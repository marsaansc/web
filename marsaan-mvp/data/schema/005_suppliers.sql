-- Marsaan schema — migration 005 (Supplier Agent v1)
-- Run once in the Supabase SQL Editor, same way as 001-004.
-- Columns of `suppliers` mirror the Supplier Master List tab of
-- Marsaan_Supplier_Research_Sheet.xlsx so the sheet can be pasted in as-is.

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  supplier_code text unique,              -- "ID" column in the sheet, e.g. SUP-001
  company_name text not null,
  category text,
  country text,
  city text,
  website text,
  contact_person text,
  email text,
  phone text,
  year_founded integer,
  company_size text,
  certifications text,
  pipeline_status text not null default 'Identified'
    check (pipeline_status in ('Identified','Contacted','Evaluated','Shortlisted','Onboarded','Rejected')),
  notes text
);
create index if not exists suppliers_category_idx on suppliers(category);

-- One sourcing request = "get quotes for these parts from these suppliers".
create table if not exists sourcing_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  request_number text unique,             -- SRQ-2026-0001
  title text not null,
  items jsonb not null default '[]',      -- [{partNumber, manufacturer, description, qty}]
  needed_by date,
  reply_by date,
  target_incoterms text,
  target_payment_terms text,
  rfq_id uuid references rfqs(id),        -- optional link to the customer RFQ that triggered it (never sent to suppliers)
  status text not null default 'open' check (status in ('open','closed'))
);

-- One row per (request, supplier): the draft, whether it was sent, and the reply.
create table if not exists supplier_outreach (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  request_id uuid not null references sourcing_requests(id) on delete cascade,
  supplier_id uuid not null references suppliers(id),
  to_email text,
  subject text not null,
  body text not null,
  status text not null default 'draft'
    check (status in ('draft','sent','replied','declined','no_reply')),
  sent_at timestamptz,
  send_error text,
  reply_text text,
  reply_at timestamptz,
  extracted jsonb,                        -- raw model output for audit
  unique (request_id, supplier_id)
);
create index if not exists supplier_outreach_request_idx on supplier_outreach(request_id);

-- Comparison table: one row per (outreach, part) with the quoted terms.
create table if not exists supplier_quotes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  outreach_id uuid not null references supplier_outreach(id) on delete cascade,
  request_id uuid not null references sourcing_requests(id) on delete cascade,
  supplier_id uuid not null references suppliers(id),
  part_number text,
  unit_price numeric,
  currency text,                          -- INR / USD / other, as quoted
  moq integer,
  lead_time_days integer,
  payment_terms text,
  incoterms text,
  warranty text,
  valid_until text,
  needs_review boolean not null default false,  -- extractor was unsure; human confirms
  review_note text,
  confirmed boolean not null default false
);
create index if not exists supplier_quotes_request_idx on supplier_quotes(request_id);
