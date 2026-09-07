-- Marsaan schema — migration 003
-- Run this once in the Supabase SQL Editor, same way as 001 and 002.
--
-- Stores leads found by the demand-discovery agent: public posts/listings
-- where someone appears to be looking for a part in your catalog.

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Which catalog SKU this scan was searching for (e.g. 'FPGA-A7-35T')
  sku text not null,

  -- What was found
  source_url text,
  source_platform text,       -- e.g. 'IndiaMART', 'Reddit', 'LinkedIn' — whatever the model identifies
  snippet text,                -- the relevant excerpt showing the demand signal
  qty_mentioned integer,       -- quantity, if the post specified one

  -- Your own follow-up tracking — deliberately manual, no auto-contact.
  status text not null default 'new'
    check (status in ('new', 'contacted', 'dismissed')),

  -- Full raw model output for this result, kept for auditing/debugging
  -- the extraction (same principle as raw_extracted on rfq_line_items).
  raw_result jsonb
);

create index if not exists leads_sku_idx on leads(sku);
create index if not exists leads_status_idx on leads(status);
create index if not exists leads_created_at_idx on leads(created_at desc);
