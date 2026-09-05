-- Marsaan RFQ persistence schema
-- Run this once in the Supabase SQL Editor (Project -> SQL Editor -> New query)

-- One row per RFQ submission (the "header")
create table if not exists rfqs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Status lifecycle: received -> quoting -> quoted -> won / lost
  status text not null default 'received'
    check (status in ('received', 'quoting', 'quoted', 'won', 'lost')),

  -- Lead / contact details (mirrors the RFQ.jsx form fields exactly)
  company text,
  contact_name text,
  email text,
  phone text,
  customer_type text,      -- 'Startup' | 'OEM' | 'University' etc.
  country text,
  needed_by date,
  shipping_address text,
  notes text,

  -- BOM file, if one was uploaded (stored in Supabase Storage, not this table)
  bom_filename text,
  bom_storage_path text,

  -- Raw copy of exactly what was submitted, for safety/debugging.
  -- Nothing here is a substitute for the structured columns above/below --
  -- it's a fallback so we never lose data even if a future field is missed.
  raw_payload jsonb
);

create index if not exists rfqs_status_idx on rfqs(status);
create index if not exists rfqs_created_at_idx on rfqs(created_at desc);
create index if not exists rfqs_email_idx on rfqs(email);

-- One row per cart line item within an RFQ (the "lines")
create table if not exists rfq_line_items (
  id uuid primary key default gen_random_uuid(),
  rfq_id uuid not null references rfqs(id) on delete cascade,

  sku text,
  product_name text,
  model_part_number text,
  qty integer,

  created_at timestamptz not null default now()
);

create index if not exists rfq_line_items_rfq_id_idx on rfq_line_items(rfq_id);

-- Auto-generate a short human-friendly RFQ number (e.g. RFQ-2026-0001)
-- so you have something short to reference in emails/calls instead of a UUID.
create sequence if not exists rfq_number_seq;

alter table rfqs add column if not exists rfq_number text unique;

create or replace function set_rfq_number()
returns trigger as $$
begin
  if new.rfq_number is null then
    new.rfq_number := 'RFQ-' || to_char(now(), 'YYYY') || '-' ||
                       lpad(nextval('rfq_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_rfq_number on rfqs;
create trigger trg_set_rfq_number
  before insert on rfqs
  for each row execute function set_rfq_number();
