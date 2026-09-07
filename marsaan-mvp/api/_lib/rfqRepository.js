// api/_lib/rfqRepository.js
//
// Persistence layer for RFQ submissions. Kept separate from api/rfq.js so
// the HTTP handler stays focused on request/response plumbing, and this
// file can be unit-tested or reused (e.g. by a future admin API) on its own.

import { getSupabaseClient, isPersistenceConfigured } from './supabaseClient.js';

const BOM_BUCKET = 'rfq-boms';

/**
 * Persists an RFQ + its line items (+ uploads the BOM file if present) to Supabase.
 *
 * Design choice: this never throws for "Supabase isn't configured yet" —
 * it returns { persisted: false, reason: '...' } instead, so a site that
 * hasn't set up Supabase yet keeps working exactly as before (email-only).
 * Real database errors (bad credentials, table missing, etc.) DO throw,
 * because those indicate something is actually broken and worth surfacing.
 *
 * @param {object} payload - { form, cart, submittedAt }, same shape the frontend sends
 * @param {object|null} bom - { filename, mimeType, buffer } or null
 * @returns {Promise<{ persisted: boolean, rfqId?: string, rfqNumber?: string, reason?: string }>}
 */
export async function persistRfq(payload, bom) {
  if (!isPersistenceConfigured()) {
    return { persisted: false, reason: 'not_configured' };
  }

  const supabase = getSupabaseClient();
  const f = payload?.form || {};
  const cart = Array.isArray(payload?.cart) ? payload.cart : [];

  // 1. Upload the BOM file to Storage first (if present), so we can store
  //    its path on the RFQ row in the same insert.
  let bomStoragePath = null;
  if (bom?.buffer?.length) {
    const safeName = (bom.filename || 'bom').replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${new Date().toISOString().slice(0, 10)}/${Date.now()}_${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(BOM_BUCKET)
      .upload(path, bom.buffer, {
        contentType: bom.mimeType || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      // Don't fail the whole RFQ just because file storage hiccuped —
      // the BOM is also emailed as an attachment (existing behavior),
      // so it isn't lost. Just record that the DB copy is missing.
      console.error('[rfqRepository] BOM upload failed:', uploadError.message);
    } else {
      bomStoragePath = path;
    }
  }

  // 2. Insert the RFQ header row.
  const { data: rfqRow, error: rfqError } = await supabase
    .from('rfqs')
    .insert({
      status: 'received',
      company: f.company || null,
      contact_name: f.name || null,
      email: f.email || null,
      phone: f.phone || null,
      customer_type: f.customerType || null,
      country: f.country || null,
      needed_by: f.neededBy || null,
      shipping_address: f.shipping || null,
      notes: f.notes || null,
      bom_filename: bom?.filename || null,
      bom_storage_path: bomStoragePath,
      raw_payload: payload,
    })
    .select('id, rfq_number')
    .single();

  if (rfqError) {
    throw new Error(`Failed to save RFQ: ${rfqError.message}`);
  }

  // 3. Insert line items, if any (BOM-only submissions may have zero cart lines).
  if (cart.length > 0) {
    const lineRows = cart.map((item) => ({
      rfq_id: rfqRow.id,
      sku: item.sku || null,
      product_name: item.name || null,
      model_part_number: item.model || null,
      qty: Number.isFinite(Number(item.qty)) ? Number(item.qty) : null,
    }));

    const { error: linesError } = await supabase.from('rfq_line_items').insert(lineRows);

    if (linesError) {
      // The RFQ header already exists at this point, which is the more
      // important half (you have the lead, the contact, the BOM file).
      // Surface this loudly rather than throwing and losing that header.
      console.error('[rfqRepository] Line item insert failed:', linesError.message);
    }
  }

  return { persisted: true, rfqId: rfqRow.id, rfqNumber: rfqRow.rfq_number };
}

/**
 * Inserts BOM-parsed line items for an existing RFQ. Kept separate from
 * persistRfq() because this runs as a second, best-effort step — the RFQ
 * itself is already safely saved by the time this is called (see api/rfq.js
 * for the timeout/error handling around this).
 *
 * @param {string} rfqId
 * @param {Array<{partNumber, manufacturer, description, qty}>} items
 */
export async function insertBomLineItems(rfqId, items) {
  if (!isPersistenceConfigured() || !items?.length) return { inserted: 0 };

  const supabase = getSupabaseClient();

  const rows = items.map((item) => ({
    rfq_id: rfqId,
    sku: null, // no internal SKU yet — these are customer-supplied part numbers, not yet matched against our catalog
    product_name: item.description || null,
    model_part_number: item.partNumber || null,
    qty: Number.isFinite(Number(item.qty)) ? Number(item.qty) : 1,
    source: 'bom_upload',
    raw_extracted: item,
  }));

  const { error } = await supabase.from('rfq_line_items').insert(rows);

  if (error) {
    throw new Error(`Failed to insert BOM line items: ${error.message}`);
  }

  return { inserted: rows.length };
}

/**
 * Creates a new RFQ from a finalized lead reply — Agent 3 (RFQ Finalization).
 * Reuses the exact same rfqs/rfq_line_items tables as every other RFQ, with
 * lead_id set so it's traceable back to the original discovered lead.
 *
 * @param {string} leadId
 * @param {object} extracted - { company, contactName, email, phone, items }
 * @param {string} replyText - the raw pasted reply, kept for reference
 */
export async function createRfqFromLead(leadId, extracted, replyText) {
  if (!isPersistenceConfigured()) {
    throw new Error('Supabase is not configured — cannot create an RFQ from a lead.');
  }

  const supabase = getSupabaseClient();

  const { data: rfqRow, error: rfqError } = await supabase
    .from('rfqs')
    .insert({
      status: 'received',
      lead_id: leadId,
      company: extracted.company || null,
      contact_name: extracted.contactName || null,
      email: extracted.email || null,
      phone: extracted.phone || null,
      notes: replyText,
      raw_payload: { source: 'lead_reply', leadId, replyText, extracted },
    })
    .select('id, rfq_number')
    .single();

  if (rfqError) {
    throw new Error(`Failed to create RFQ from lead: ${rfqError.message}`);
  }

  const items = Array.isArray(extracted.items) ? extracted.items : [];
  if (items.length > 0) {
    const lineRows = items.map((item) => ({
      rfq_id: rfqRow.id,
      sku: null,
      product_name: item.description || null,
      model_part_number: item.partNumber || null,
      qty: Number.isFinite(Number(item.qty)) ? Number(item.qty) : 1,
      source: 'lead_reply',
      raw_extracted: item,
    }));

    const { error: linesError } = await supabase.from('rfq_line_items').insert(lineRows);
    if (linesError) {
      // Same principle as persistRfq(): the RFQ header already exists,
      // which is the more important half — surface loudly, don't throw
      // and lose that.
      console.error('[rfqRepository] Lead-reply line item insert failed:', linesError.message);
    }
  }

  return { rfqId: rfqRow.id, rfqNumber: rfqRow.rfq_number, itemCount: items.length };
}
