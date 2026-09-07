// api/admin/bom-download.js
import { requireAuth } from '../_lib/adminAuth.js';
import { getSupabaseClient, isPersistenceConfigured } from '../_lib/supabaseClient.js';

const BOM_BUCKET = 'rfq-boms';
const SIGNED_URL_EXPIRY_SECONDS = 60; // short-lived on purpose — regenerated on each click

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  if (!isPersistenceConfigured()) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: false, error: 'Persistence not configured.' }));
  }

  const { id } = req.query || {};
  if (!id) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: false, error: 'Missing id.' }));
  }

  const supabase = getSupabaseClient();

  const { data: rfq, error: rfqError } = await supabase
    .from('rfqs')
    .select('bom_storage_path')
    .eq('id', id)
    .single();

  if (rfqError || !rfq?.bom_storage_path) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: false, error: 'No BOM file found for this RFQ.' }));
  }

  const { data: signed, error: signError } = await supabase.storage
    .from(BOM_BUCKET)
    .createSignedUrl(rfq.bom_storage_path, SIGNED_URL_EXPIRY_SECONDS);

  if (signError) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: false, error: signError.message }));
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ ok: true, url: signed.signedUrl }));
}
