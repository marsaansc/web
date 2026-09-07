// api/admin/rfqs.js
import { requireAuth } from '../_lib/adminAuth.js';
import { getSupabaseClient, isPersistenceConfigured } from '../_lib/supabaseClient.js';

const VALID_STATUSES = ['received', 'quoting', 'quoted', 'won', 'lost'];

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return; // requireAuth already sent the 401 response

  if (!isPersistenceConfigured()) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: true, configured: false, rfqs: [] }));
  }

  const supabase = getSupabaseClient();

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('rfqs')
      .select('*, rfq_line_items(*)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ ok: false, error: error.message }));
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: true, configured: true, rfqs: data }));
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

    const { data, error } = await supabase
      .from('rfqs')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ ok: false, error: error.message }));
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ ok: true, rfq: data }));
  }

  res.statusCode = 405;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ ok: false, error: 'Method not allowed.' }));
}
