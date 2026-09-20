// api/admin/suppliers.js — Supplier Master List (same columns as the Excel sheet).
import { requireAuth } from '../_lib/adminAuth.js';
import { getSupabaseClient, isPersistenceConfigured } from '../_lib/supabaseClient.js';

const STATUSES = ['Identified', 'Contacted', 'Evaluated', 'Shortlisted', 'Onboarded', 'Rejected'];

function json(res, code, body) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function clean(row) {
  const s = (v) => (v == null || String(v).trim() === '' ? null : String(v).trim());
  const yr = parseInt(row.year_founded, 10);
  const status = STATUSES.includes(row.pipeline_status) ? row.pipeline_status : 'Identified';
  return {
    supplier_code: s(row.supplier_code),
    company_name: s(row.company_name),
    category: s(row.category),
    country: s(row.country),
    city: s(row.city),
    website: s(row.website),
    contact_person: s(row.contact_person),
    email: s(row.email),
    phone: s(row.phone),
    year_founded: Number.isFinite(yr) ? yr : null,
    company_size: s(row.company_size),
    certifications: s(row.certifications),
    pipeline_status: status,
    notes: s(row.notes),
  };
}

export default async function handler(req, res) {
  if (!requireAuth(req, res)) return;
  if (!isPersistenceConfigured()) return json(res, 200, { ok: true, configured: false, suppliers: [] });
  const supabase = getSupabaseClient();
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

  if (req.method === 'GET') {
    const { data, error } = await supabase.from('suppliers').select('*').order('supplier_code', { ascending: true }).limit(1000);
    if (error) return json(res, 500, { ok: false, error: error.message });
    return json(res, 200, { ok: true, suppliers: data });
  }

  if (req.method === 'POST') {
    const rows = (Array.isArray(body.suppliers) ? body.suppliers : []).map(clean).filter((r) => r.company_name);
    if (rows.length === 0) return json(res, 400, { ok: false, error: 'No valid rows (company_name is required).' });
    if (rows.length > 500) return json(res, 400, { ok: false, error: 'Max 500 rows per import.' });

    // Rows with a code are upserted on it (re-importing the sheet updates, not duplicates).
    // Rows without one get the next SUP-nnn.
    const { data: existing } = await supabase.from('suppliers').select('supplier_code');
    let max = 0;
    for (const e of existing || []) {
      const m = /^SUP-(\d+)$/.exec(e.supplier_code || '');
      if (m) max = Math.max(max, Number(m[1]));
    }
    for (const r of rows) if (!r.supplier_code) r.supplier_code = `SUP-${String(++max).padStart(3, '0')}`;

    const { data, error } = await supabase.from('suppliers').upsert(rows, { onConflict: 'supplier_code' }).select('id');
    if (error) return json(res, 500, { ok: false, error: error.message });
    return json(res, 200, { ok: true, saved: data.length });
  }

  if (req.method === 'PATCH') {
    if (!body.id) return json(res, 400, { ok: false, error: 'id required.' });
    const patch = {};
    if (body.pipeline_status) {
      if (!STATUSES.includes(body.pipeline_status)) return json(res, 400, { ok: false, error: 'Invalid status.' });
      patch.pipeline_status = body.pipeline_status;
    }
    for (const k of ['email', 'contact_person', 'notes']) if (k in body) patch[k] = body[k] || null;
    const { error } = await supabase.from('suppliers').update(patch).eq('id', body.id);
    if (error) return json(res, 500, { ok: false, error: error.message });
    return json(res, 200, { ok: true });
  }

  return json(res, 405, { ok: false, error: 'Method not allowed.' });
}
