import { useEffect, useMemo, useState } from 'react'

const HEADER_MAP = {
  'id': 'supplier_code', 'supplier id': 'supplier_code',
  'company name': 'company_name', 'supplier name': 'company_name',
  'category': 'category', 'country': 'country', 'city': 'city', 'website': 'website',
  'contact person': 'contact_person', 'email': 'email', 'phone': 'phone',
  'year founded': 'year_founded', 'company size': 'company_size', 'certifications': 'certifications',
  'pipeline status': 'pipeline_status', 'notes': 'notes',
}

// Parses text pasted straight from Excel (tab-separated, first row = headers).
function parsePasted(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []
  const sep = lines[0].includes('\t') ? '\t' : ','
  const heads = lines[0].split(sep).map((h) => HEADER_MAP[h.trim().toLowerCase()] || null)
  return lines.slice(1).map((l) => {
    const cells = l.split(sep)
    const row = {}
    heads.forEach((k, i) => { if (k) row[k] = (cells[i] || '').trim() })
    return row
  }).filter((r) => r.company_name)
}

async function api(path, method = 'GET', body) {
  const res = await fetch(path, {
    method, credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || 'Request failed.')
  return json
}

const fmt = (v) => (v == null || v === '' ? '—' : v)

function SuppliersList({ suppliers, reload }) {
  const [paste, setPaste] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)
  const rows = useMemo(() => parsePasted(paste), [paste])

  async function doImport() {
    setBusy(true); setMsg(null)
    try {
      const r = await api('/api/admin/suppliers', 'POST', { suppliers: rows })
      setMsg(`Saved ${r.saved} supplier(s).`); setPaste(''); await reload()
    } catch (e) { setMsg(e.message) } finally { setBusy(false) }
  }
  async function setEmail(s) {
    const email = window.prompt(`Email for ${s.company_name}:`, s.email || '')
    if (email === null) return
    try { await api('/api/admin/suppliers', 'PATCH', { id: s.id, email }); await reload() } catch (e) { alert(e.message) }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Import from your Supplier Master List</h3>
        <p className="small">In the Excel sheet, select the header row plus the rows to import (Supplier Master List tab), copy, and paste below. Re-importing with the same ID updates instead of duplicating. Remove the "(SAMPLE)" rows first.</p>
        <textarea value={paste} onChange={(e) => setPaste(e.target.value)} rows={5} style={{ width: '100%', padding: 8 }} placeholder="Paste here…" />
        <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn primary" disabled={busy || rows.length === 0} onClick={doImport}>
            {busy ? 'Importing…' : `Import ${rows.length} row(s)`}
          </button>
          {msg && <span className="small">{msg}</span>}
        </div>
      </div>
      <table className="table">
        <thead><tr><th>ID</th><th>Company</th><th>Category</th><th>Country</th><th>Contact</th><th>Email</th><th>Status</th></tr></thead>
        <tbody>
          {suppliers.map((s) => (
            <tr key={s.id}>
              <td className="small">{s.supplier_code}</td>
              <td><b>{s.company_name}</b></td>
              <td className="small">{fmt(s.category)}</td>
              <td className="small">{fmt(s.country)}</td>
              <td className="small">{fmt(s.contact_person)}</td>
              <td className="small">{s.email || <span style={{ color: '#b91c1c' }}>missing</span>} <button className="btn" onClick={() => setEmail(s)}>edit</button></td>
              <td className="small">{s.pipeline_status}</td>
            </tr>
          ))}
          {suppliers.length === 0 && <tr><td colSpan={7} className="small">No suppliers yet. Import above.</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

function QuoteTable({ req, fx }) {
  const inr = (q) => (q.unit_price == null ? null : (String(q.currency || '').toUpperCase() === 'USD' ? q.unit_price * fx : (String(q.currency || 'INR').toUpperCase() === 'INR' ? q.unit_price : null)))
  const byPart = {}
  for (const q of req.quotes) (byPart[q.part_number || '?'] ||= []).push(q)
  return Object.entries(byPart).map(([part, qs]) => {
    const vals = qs.map(inr).filter((v) => v != null)
    const best = vals.length ? Math.min(...vals) : null
    return (
      <div key={part} style={{ marginTop: 10 }}>
        <b>{part}</b>
        <table className="table table-compact">
          <thead><tr><th>Supplier</th><th>Unit price</th><th>≈ INR</th><th>MOQ</th><th>Lead (d)</th><th>Terms</th><th>Incoterms</th><th>Valid</th><th></th></tr></thead>
          <tbody>
            {qs.map((q) => {
              const v = inr(q)
              return (
                <tr key={q.id} style={v != null && v === best && vals.length > 1 ? { background: 'rgba(34,197,94,0.12)' } : undefined}>
                  <td className="small">{q.suppliers?.company_name}</td>
                  <td>{q.unit_price == null ? '—' : `${q.currency || ''} ${q.unit_price}`}</td>
                  <td>{v == null ? '—' : v.toFixed(2)}</td>
                  <td>{fmt(q.moq)}</td><td>{fmt(q.lead_time_days)}</td>
                  <td className="small">{fmt(q.payment_terms)}</td><td className="small">{fmt(q.incoterms)}</td><td className="small">{fmt(q.valid_until)}</td>
                  <td className="small">
                    {q.needs_review && <span title={q.review_note || ''} style={{ color: '#b45309' }}>⚠ check {q.review_note || ''}</span>}
                    {q.confirmed && '✔'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  })
}

function Sourcing({ suppliers, requests, reload }) {
  const [title, setTitle] = useState('')
  const [partsText, setPartsText] = useState('')
  const [neededBy, setNeededBy] = useState('')
  const [replyBy, setReplyBy] = useState('')
  const [open, setOpen] = useState(null)
  const [pick, setPick] = useState(new Set())
  const [replyDrafts, setReplyDrafts] = useState({})
  const [edits, setEdits] = useState({})
  const [busy, setBusy] = useState(null)
  const [fx, setFx] = useState(88) // placeholder USD/INR — update to the day's rate
  const [error, setError] = useState(null)

  async function run(key, fn) {
    setBusy(key); setError(null)
    try { await fn(); await reload() } catch (e) { setError(e.message) } finally { setBusy(null) }
  }

  function createRequest() {
    // one part per line: PartNo, Manufacturer, Qty, Description (comma or tab)
    const items = partsText.split(/\r?\n/).filter((l) => l.trim()).map((l) => {
      const [partNumber, manufacturer, qty, ...d] = l.split(/\t|,/).map((x) => x.trim())
      return { partNumber, manufacturer, qty, description: d.join(', ') }
    })
    return run('create', async () => {
      const r = await api('/api/admin/sourcing', 'POST', { action: 'create', title, items, needed_by: neededBy, reply_by: replyBy })
      setTitle(''); setPartsText(''); setOpen(r.id)
    })
  }

  return (
    <div>
      {error && <div className="card" style={{ borderColor: '#fca5a5', marginBottom: 12 }}><p style={{ color: '#b91c1c' }}>{error}</p></div>}
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>New sourcing request</h3>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title, e.g. Artix-7 + ESP32 batch Oct" style={{ width: '100%', padding: 8, marginBottom: 8 }} />
        <textarea value={partsText} onChange={(e) => setPartsText(e.target.value)} rows={4} style={{ width: '100%', padding: 8 }}
          placeholder={'One part per line: Part number, Manufacturer, Qty, Description\nXC7A35T-1CSG324C, AMD/Xilinx, 10, Artix-7 FPGA'} />
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label className="small">Needed by <input type="date" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} /></label>
          <label className="small">Reply by <input type="date" value={replyBy} onChange={(e) => setReplyBy(e.target.value)} /></label>
          <button className="btn primary" disabled={!title.trim() || !partsText.trim() || busy === 'create'} onClick={createRequest}>Create</button>
          <label className="small" style={{ marginLeft: 'auto' }}>USD→INR (placeholder) <input type="number" value={fx} onChange={(e) => setFx(Number(e.target.value) || 0)} style={{ width: 70 }} /></label>
        </div>
      </div>

      {requests.map((req) => {
        const isOpen = open === req.id
        const drafted = new Set(req.outreach.map((o) => o.supplier_id))
        return (
          <div className="card" key={req.id} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setOpen(isOpen ? null : req.id)}>
              <div><b>{req.request_number}</b> — {req.title} <span className="small">({req.items.length} parts, {req.outreach.length} suppliers, {req.outreach.filter((o) => o.status === 'replied').length} replied)</span></div>
              <span>{isOpen ? '▲' : '▼'}</span>
            </div>
            {isOpen && (
              <div style={{ marginTop: 12 }}>
                <div className="small">Parts: {req.items.map((i) => `${i.partNumber} ×${i.qty}`).join(' · ')}</div>

                <h4 style={{ marginTop: 12 }}>1. Pick suppliers → generate drafts</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {suppliers.filter((s) => !drafted.has(s.id)).map((s) => (
                    <label key={s.id} className="small">
                      <input type="checkbox" checked={pick.has(s.id)} onChange={() => { const n = new Set(pick); n.has(s.id) ? n.delete(s.id) : n.add(s.id); setPick(n) }} /> {s.company_name}
                    </label>
                  ))}
                </div>
                <button className="btn" style={{ marginTop: 8 }} disabled={pick.size === 0 || busy === 'draft' + req.id}
                  onClick={() => run('draft' + req.id, async () => { await api('/api/admin/sourcing', 'POST', { action: 'draft', requestId: req.id, supplierIds: [...pick] }); setPick(new Set()) })}>
                  Generate {pick.size} draft(s)
                </button>

                <h4 style={{ marginTop: 16 }}>2. Review, send, paste replies</h4>
                {req.outreach.map((o) => {
                  const e = edits[o.id] || {}
                  const subject = e.subject ?? o.subject
                  const bodyTxt = e.body ?? o.body
                  return (
                    <div key={o.id} style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 8, padding: 10, marginBottom: 8 }}>
                      <div><b>{o.suppliers?.company_name}</b> <span className="small">→ {o.to_email || 'NO EMAIL'} · status: <b>{o.status}</b>{o.sent_at ? ` · sent ${new Date(o.sent_at).toLocaleString()}` : ''}</span></div>
                      {o.send_error && <div className="small" style={{ color: '#b91c1c' }}>Send error: {o.send_error}</div>}
                      {o.status === 'draft' && (
                        <>
                          <input value={subject} onChange={(ev) => setEdits({ ...edits, [o.id]: { ...e, subject: ev.target.value } })} style={{ width: '100%', padding: 6, marginTop: 6 }} />
                          <textarea value={bodyTxt} rows={10} onChange={(ev) => setEdits({ ...edits, [o.id]: { ...e, body: ev.target.value } })} style={{ width: '100%', padding: 6, marginTop: 6, fontFamily: 'inherit' }} />
                          <button className="btn primary" disabled={busy === 'send' + o.id}
                            onClick={() => { if (!window.confirm(`Send this email to ${o.to_email}?`)) return
                              run('send' + o.id, async () => {
                                await api('/api/admin/sourcing', 'POST', { action: 'update-draft', outreachId: o.id, subject, body: bodyTxt })
                                await api('/api/admin/sourcing', 'POST', { action: 'send', outreachId: o.id })
                              }) }}>
                            {busy === 'send' + o.id ? 'Sending…' : 'Approve & send'}
                          </button>
                        </>
                      )}
                      {o.status !== 'draft' && (
                        <>
                          <textarea rows={4} placeholder="Paste the supplier's reply here…" value={replyDrafts[o.id] ?? o.reply_text ?? ''}
                            onChange={(ev) => setReplyDrafts({ ...replyDrafts, [o.id]: ev.target.value })} style={{ width: '100%', padding: 6, marginTop: 6 }} />
                          <button className="btn" disabled={!(replyDrafts[o.id] || '').trim() || busy === 'reply' + o.id}
                            onClick={() => run('reply' + o.id, () => api('/api/admin/sourcing', 'POST', { action: 'reply', outreachId: o.id, replyText: replyDrafts[o.id] }))}>
                            {busy === 'reply' + o.id ? 'Extracting…' : 'Extract quote'}
                          </button>
                        </>
                      )}
                    </div>
                  )
                })}

                {req.quotes.length > 0 && (
                  <>
                    <h4 style={{ marginTop: 16 }}>3. Comparison (cheapest ≈INR highlighted; ⚠ = check against the original reply)</h4>
                    <QuoteTable req={req} fx={fx} />
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}
      {requests.length === 0 && <div className="card"><p>No sourcing requests yet.</p></div>}
    </div>
  )
}

export default function SuppliersPanel() {
  const [view, setView] = useState('sourcing')
  const [suppliers, setSuppliers] = useState([])
  const [requests, setRequests] = useState([])
  const [err, setErr] = useState(null)

  async function reload() {
    try {
      const [s, r] = await Promise.all([api('/api/admin/suppliers'), api('/api/admin/sourcing')])
      setSuppliers(s.suppliers || []); setRequests(r.requests || []); setErr(null)
    } catch (e) { setErr(e.message) }
  }
  useEffect(() => { reload() }, [])

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className={view === 'sourcing' ? 'btn primary' : 'btn'} onClick={() => setView('sourcing')}>Sourcing requests</button>
        <button className={view === 'list' ? 'btn primary' : 'btn'} onClick={() => setView('list')}>Supplier list ({suppliers.length})</button>
      </div>
      {err && <div className="card" style={{ borderColor: '#fca5a5', marginBottom: 12 }}><p style={{ color: '#b91c1c' }}>{err}</p></div>}
      {view === 'list'
        ? <SuppliersList suppliers={suppliers} reload={reload} />
        : <Sourcing suppliers={suppliers} requests={requests} reload={reload} />}
    </div>
  )
}
