-- Marsaan RFQ persistence schema — migration 002
-- Run this once in the Supabase SQL Editor, same way as 001.
--
-- Adds a 'source' column so line items added manually via "Add to Quote"
-- can be told apart from line items extracted automatically from an
-- uploaded BOM file by the parsing agent (step 4).

alter table rfq_line_items
  add column if not exists source text not null default 'manual'
    check (source in ('manual', 'bom_upload'));

-- Keeps the raw extracted row alongside the structured fields, so if the
-- AI extraction ever gets a field wrong, you can see exactly what it saw
-- and correct it — never trust a parsed row with no way to check it.
alter table rfq_line_items
  add column if not exists raw_extracted jsonb;
