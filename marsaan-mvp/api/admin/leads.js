// api/admin/leads.js
import { requireAuth } from '../_lib/adminAuth.js';
import { getSupabaseClient, isPersistenceConfigured } from '../_lib/supabaseClient.js';
import { scanForLeads } from '../_lib/leadScout.js';

const VALID_STATUSES = ['new', 'contacted', 'dismissed'];

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;

  if (!isPersistenceConfigured()) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: true, configured: false, leads: [] }));
  }

  const supabase = getSupabaseClient();

  if (req.method === 'GET') {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(300);

    if (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ ok: false, error: error.message }));
    }

    // Cross-reference: for each SKU that has leads, how many existing RFQ
    // line items also mention it? This is the concrete "conversation"
    // between the two agents — a lead and a real submitted RFQ for the
    // same part are now directly comparable, because both live in a
    // shape keyed by the same SKU.
    //
    // Known limitation: this only counts rfq_line_items.sku matches,
    // which is reliable for manually-added cart items. BOM-parsed items
    // store the customer's own part number in model_part_number instead,
    // so this count is a useful signal, not an exhaustive one.
    const skus = [...new Set(leads.map((l) => l.sku))];
    let rfqCountBySku = {};
    if (skus.length > 0) {
      const { data: lineItems, error: liError } = await supabase
        .from('rfq_line_items')
        .select('sku')
        .in('sku', skus);

      if (!liError) {
        rfqCountBySku = lineItems.reduce((acc, row) => {
          if (!row.sku) return acc;
          acc[row.sku] = (acc[row.sku] || 0) + 1;
          return acc;
        }, {});
      }
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: true, configured: true, leads, rfqCountBySku }));
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { sku, productName, manufacturer, keySpecs } = body;

    if (!sku || !productName) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ ok: false, error: 'sku and productName are required.' }));
    }

    let scanResult;
    try {
      scanResult = await scanForLeads({ sku, productName, manufacturer, keySpecs });
    } catch (e) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ ok: false, error: `Scan failed: ${e.message}` }));
    }

    if (!scanResult.ok) {
      res.statusCode = 200; // not a hard error — e.g. missing API key, or model output couldn't be parsed
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ ok: true, inserted: 0, reason: scanResult.reason }));
    }

    if (scanResult.leads.length === 0) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ ok: true, inserted: 0 }));
    }

    const rows = scanResult.leads.map((lead) => ({
      sku,
      source_url: lead.sourceUrl || null,
      source_platform: lead.platform || null,
      snippet: lead.snippet || null,
      qty_mentioned: Number.isFinite(Number(lead.qtyMentioned)) ? Number(lead.qtyMentioned) : null,
      raw_result: lead,
    }));

    const { data: inserted, error: insertError } = await supabase.from('leads').insert(rows).select();

    if (insertError) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ ok: false, error: insertError.message }));
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: true, inserted: inserted.length, leads: inserted }));
  }

  if (req.method === 'PATCH') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { id, status } = body;

    if (!id || !VALID_STATUSES.includes(status)) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(
        JSON.stringify({ ok: false, error: `Invalid request. status must be one of: ${VALID_STATUSES.join(', ')}` })
      );
    }

    const { data, error } = await supabase.from('leads').update({ status }).eq('id', id).select().single();

    if (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ ok: false, error: error.message }));
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: true, lead: data }));
  }

  res.statusCode = 405;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ ok: false, error: 'Method not allowed.' }));
}
