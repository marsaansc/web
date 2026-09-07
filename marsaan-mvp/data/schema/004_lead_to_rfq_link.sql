-- Marsaan schema — migration 004
-- Run this once in the Supabase SQL Editor, same way as 001-003.
--
-- Links the customer-acquisition pipeline (leads) to the existing RFQ
-- pipeline: when a lead's reply gets turned into a real RFQ (Agent 3 —
-- RFQ Finalization), that RFQ can point back to which lead it came from.
--
-- Also adds the columns Agent 2 (Outreach, built later) will need —
-- added now so both migrations don't need to touch the leads table twice.

alter table rfqs
  add column if not exists lead_id uuid references leads(id);

create index if not exists rfqs_lead_id_idx on rfqs(lead_id);

alter table leads
  add column if not exists draft_message text,
  add column if not exists contact_method text
    check (contact_method in ('email', 'manual')),
  add column if not exists sent_at timestamptz;

-- Allow rfq_line_items to be tagged as coming from a finalized lead reply,
-- in addition to the existing 'manual' and 'bom_upload' sources.
alter table rfq_line_items drop constraint if exists rfq_line_items_source_check;
alter table rfq_line_items
  add constraint rfq_line_items_source_check
    check (source in ('manual', 'bom_upload', 'lead_reply'));
