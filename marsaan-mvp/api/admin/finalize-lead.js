// api/admin/finalize-lead.js
import { requireAuth } from '../_lib/adminAuth.js';
import { finalizeLeadReply } from '../_lib/leadFinalizer.js';
import { createRfqFromLead } from '../_lib/rfqRepository.js';
import { getSupabaseClient, isPersistenceConfigured } from '../_lib/supabaseClient.js';

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: false, error: 'Method not allowed.' }));
  }

  if (!isPersistenceConfigured()) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: false, error: 'Persistence not configured.' }));
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { leadId, replyText } = body;

  if (!leadId || !replyText) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: false, error: 'leadId and replyText are required.' }));
  }

  let finalizeResult;
  try {
    finalizeResult = await finalizeLeadReply(replyText);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: false, error: `Extraction failed: ${e.message}` }));
  }

  if (!finalizeResult.ok) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: true, created: false, reason: finalizeResult.reason }));
  }

  let rfqResult;
  try {
    rfqResult = await createRfqFromLead(leadId, finalizeResult.extracted, replyText);
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: false, error: e.message }));
  }

  try {
    const supabase = getSupabaseClient();
    await supabase.from('leads').update({ status: 'contacted' }).eq('id', leadId);
  } catch (e) {
    console.error('[api/admin/finalize-lead] Failed to update lead status:', e.message);
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    ok: true,
    created: true,
    rfqId: rfqResult.rfqId,
    rfqNumber: rfqResult.rfqNumber,
    itemCount: rfqResult.itemCount,
    extracted: finalizeResult.extracted,
  }));
}
