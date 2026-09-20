// api/admin/sourcing.js — Supplier Agent workflow (one endpoint, `action` switch,
// to stay within Vercel's 12-function Hobby limit).
//   create        new sourcing request (parts list)
//   draft         generate quote-request drafts for chosen suppliers
//   update-draft  edit subject/body of a draft
//   send          send an approved draft (human click only)
//   reply         paste supplier reply -> extract terms into supplier_quotes
//   update-quote  correct / confirm an extracted quote row
import { requireAuth } from '../_lib/adminAuth.js';
import { getSupabaseClient, isPersistenceConfigured } from '../_lib/supabaseClient.js';
import { buildQuoteRequestDraft, extractSupplierReply, sendSupplierEmail } from '../_lib/supplierAgent.js';

function json(res, code, body) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

const num = (v) => (v == null || v === '' || !Number.isFinite(Number(v)) ? null : Number(v));
const int = (v) => (num(v) == null ? null : Math.round(num(v)));
const str = (v) => (v == null || String(v).trim() === '' ? null : String(v).trim());

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  if (!isPersistenceConfigured()) return json(res, 200, { ok: true, configured: false, requests: [] });
  const supabase = getSupabaseClient();

  if (req.method === 'GET') {
    const { data: requests, error } = await supabase
      .from('sourcing_requests').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) return json(res, 500, { ok: false, error: error.message });
    const ids = requests.map((r) => r.id);
    let outreach = [], quotes = [];
    if (ids.length) {
      const o = await supabase.from('supplier_outreach')
        .select('*, suppliers(company_name, supplier_code, email)').in('request_id', ids).order('created_at');
      const q = await supabase.from('supplier_quotes').select('*, suppliers(company_name, supplier_code)').in('request_id', ids);
      if (o.error) return json(res, 500, { ok: false, error: o.error.message });
      if (q.error) return json(res, 500, { ok: false, error: q.error.message });
      outreach = o.data; quotes = q.data;
    }
    return json(res, 200, {
      ok: true,
      requests: requests.map((r) => ({
        ...r,
        outreach: outreach.filter((x) => x.request_id === r.id),
        quotes: quotes.filter((x) => x.request_id === r.id),
      })),
    });
  }

  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'Method not allowed.' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { action } = body;

  try {
    if (action === 'create') {
      const items = (Array.isArray(body.items) ? body.items : [])
        .map((i) => ({ partNumber: str(i.partNumber), manufacturer: str(i.manufacturer), description: str(i.description), qty: int(i.qty) || 1 }))
        .filter((i) => i.partNumber);
      if (!str(body.title) || items.length === 0) return json(res, 400, { ok: false, error: 'title and at least one part are required.' });
      const year = new Date().getFullYear();
      const { count } = await supabase.from('sourcing_requests').select('id', { count: 'exact', head: true });
      const request_number = `SRQ-${year}-${String((count || 0) + 1).padStart(4, '0')}`;
      const { data, error } = await supabase.from('sourcing_requests').insert({
        request_number, title: str(body.title), items,
        needed_by: str(body.needed_by), reply_by: str(body.reply_by),
        target_incoterms: str(body.target_incoterms), target_payment_terms: str(body.target_payment_terms),
      }).select('id, request_number').single();
      if (error) throw new Error(error.message);
      return json(res, 200, { ok: true, ...data });
    }

    if (action === 'draft') {
      const { requestId, supplierIds } = body;
      if (!requestId || !Array.isArray(supplierIds) || supplierIds.length === 0)
        return json(res, 400, { ok: false, error: 'requestId and supplierIds are required.' });
      const { data: request } = await supabase.from('sourcing_requests').select('*').eq('id', requestId).single();
      const { data: suppliers } = await supabase.from('suppliers').select('*').in('id', supplierIds);
      const { data: have } = await supabase.from('supplier_outreach').select('supplier_id').eq('request_id', requestId);
      const skip = new Set((have || []).map((h) => h.supplier_id));
      const rows = (suppliers || []).filter((s) => !skip.has(s.id)).map((s) => {
        const d = buildQuoteRequestDraft({ supplier: s, request });
        return { request_id: requestId, supplier_id: s.id, to_email: s.email, subject: d.subject, body: d.body };
      });
      if (rows.length) {
        const { error } = await supabase.from('supplier_outreach').insert(rows);
        if (error) throw new Error(error.message);
      }
      return json(res, 200, { ok: true, drafted: rows.length, skipped_existing: skip.size });
    }

    if (action === 'update-draft') {
      const { outreachId } = body;
      const patch = {};
      if (str(body.subject)) patch.subject = str(body.subject);
      if (str(body.body)) patch.body = String(body.body);
      if ('to_email' in body) patch.to_email = str(body.to_email);
      const { error } = await supabase.from('supplier_outreach').update(patch).eq('id', outreachId).eq('status', 'draft');
      if (error) throw new Error(error.message);
      return json(res, 200, { ok: true });
    }

    if (action === 'send') {
      const { data: o } = await supabase.from('supplier_outreach').select('*').eq('id', body.outreachId).single();
      if (!o) return json(res, 404, { ok: false, error: 'Draft not found.' });
      if (o.status !== 'draft') return json(res, 400, { ok: false, error: `Already ${o.status}.` });
      if (!o.to_email || !/^\S+@\S+\.\S+$/.test(o.to_email)) return json(res, 400, { ok: false, error: 'Supplier has no valid email. Add one first.' });
      // Safeguard: max one email per supplier per 24h across all requests.
      const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const { data: recent } = await supabase.from('supplier_outreach').select('id')
        .eq('supplier_id', o.supplier_id).eq('status', 'sent').gte('sent_at', since).limit(1);
      if (recent && recent.length) return json(res, 429, { ok: false, error: 'This supplier was already emailed in the last 24 hours.' });
      try {
        await sendSupplierEmail({ to: o.to_email, subject: o.subject, body: o.body });
      } catch (e) {
        await supabase.from('supplier_outreach').update({ send_error: e.message }).eq('id', o.id);
        return json(res, 502, { ok: false, error: e.message });
      }
      await supabase.from('supplier_outreach').update({ status: 'sent', sent_at: new Date().toISOString(), send_error: null }).eq('id', o.id);
      await supabase.from('suppliers').update({ pipeline_status: 'Contacted' }).eq('id', o.supplier_id).eq('pipeline_status', 'Identified');
      return json(res, 200, { ok: true });
    }

    if (action === 'reply') {
      const { outreachId, replyText } = body;
      if (!outreachId || !str(replyText)) return json(res, 400, { ok: false, error: 'outreachId and replyText are required.' });
      const { data: o } = await supabase.from('supplier_outreach').select('*, sourcing_requests(items)').eq('id', outreachId).single();
      if (!o) return json(res, 404, { ok: false, error: 'Outreach not found.' });
      const result = await extractSupplierReply(replyText, o.sourcing_requests?.items || []);
      // Always keep the pasted text, even if extraction fails.
      await supabase.from('supplier_outreach').update({ reply_text: replyText, reply_at: new Date().toISOString() }).eq('id', outreachId);
      if (!result.ok) return json(res, 200, { ok: true, extracted: false, reason: result.reason });
      const ex = result.extracted;
      const g = ex.generalTerms || {};
      await supabase.from('supplier_quotes').delete().eq('outreach_id', outreachId).eq('confirmed', false);
      const rows = (ex.quotes || []).map((q) => ({
        outreach_id: outreachId, request_id: o.request_id, supplier_id: o.supplier_id,
        part_number: str(q.partNumber), unit_price: num(q.unitPrice), currency: str(q.currency || g.currency),
        moq: int(q.moq), lead_time_days: int(q.leadTimeDays),
        payment_terms: str(q.paymentTerms || g.paymentTerms), incoterms: str(q.incoterms || g.incoterms),
        warranty: str(q.warranty || g.warranty), valid_until: str(q.validUntil || g.validUntil),
        needs_review: Boolean(q.needsReview) || q.unitPrice == null, review_note: str(q.reviewNote),
      }));
      if (rows.length) {
        const { error } = await supabase.from('supplier_quotes').insert(rows);
        if (error) throw new Error(error.message);
      }
      await supabase.from('supplier_outreach').update({
        status: ex.declined ? 'declined' : 'replied', extracted: ex,
      }).eq('id', outreachId);
      return json(res, 200, { ok: true, extracted: true, quotes: rows.length, declined: Boolean(ex.declined) });
    }

    if (action === 'update-quote') {
      const { quoteId } = body;
      const patch = {
        unit_price: num(body.unit_price), currency: str(body.currency), moq: int(body.moq),
        lead_time_days: int(body.lead_time_days), payment_terms: str(body.payment_terms),
        incoterms: str(body.incoterms), warranty: str(body.warranty), valid_until: str(body.valid_until),
        confirmed: true, needs_review: false,
      };
      const { error } = await supabase.from('supplier_quotes').update(patch).eq('id', quoteId);
      if (error) throw new Error(error.message);
      return json(res, 200, { ok: true });
    }

    return json(res, 400, { ok: false, error: 'Unknown action.' });
  } catch (e) {
    return json(res, 500, { ok: false, error: e.message });
  }
}
