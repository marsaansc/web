import { useEffect, useState } from 'react'
import products from '../data/products.json'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

export default function LeadsPanel() {
  const [leads, setLeads] = useState([])
  const [rfqCountBySku, setRfqCountBySku] = useState({})
  const [loadError, setLoadError] = useState(null)
  const [loading, setLoading] = useState(true)

  const [scanning, setScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(null) // { current, total, currentSku }
  const [scanLog, setScanLog] = useState([]) // per-SKU results as they come in

  const [expandedLeadId, setExpandedLeadId] = useState(null)
  const [replyDrafts, setReplyDrafts] = useState({}) // leadId -> textarea content
  const [finalizeBusyId, setFinalizeBusyId] = useState(null)
  const [finalizeResults, setFinalizeResults] = useState({}) // leadId -> { rfqNumber, itemCount } | { error }

  async function loadLeads() {
    setLoadError(null)
    try {
      const res = await fetch('/api/admin/leads', { credentials: 'same-origin' })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error || 'Failed to load leads.')
      setLeads(json.leads || [])
      setRfqCountBySku(json.rfqCountBySku || {})
    } catch (e) {
      setLoadError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadLeads() }, [])

  async function scanOneSku(product) {
    const res = await fetch('/api/admin/leads', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sku: product.sku,
        productName: product.productName,
        manufacturer: product.manufacturer,
        keySpecs: product.keySpecs,
      }),
    })
    const json = await res.json()
    if (!json.ok) throw new Error(json.error || 'Scan failed.')
    return json
  }

  async function handleScanAll() {
    setScanning(true)
    setScanLog([])
    const list = products.products || []
    setScanProgress({ current: 0, total: list.length, currentSku: null })

    for (let i = 0; i < list.length; i++) {
      const product = list[i]
      setScanProgress({ current: i + 1, total: list.length, currentSku: product.sku })
      try {
        const result = await scanOneSku(product)
        setScanLog(prev => [...prev, {
          sku: product.sku,
          found: result.inserted || 0,
          reason: result.reason,
        }])
      } catch (e) {
        setScanLog(prev => [...prev, { sku: product.sku, found: 0, error: e.message }])
      }
    }

    setScanning(false)
    setScanProgress(null)
    await loadLeads()
  }

  async function handleStatusChange(id, status) {
    const prev = leads
    setLeads(leads.map(l => (l.id === id ? { ...l, status } : l)))
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error || 'Failed to update status.')
    } catch (e) {
      setLeads(prev)
      alert(`Couldn't update status: ${e.message}`)
    }
  }

  async function handleFinalize(leadId) {
    const replyText = (replyDrafts[leadId] || '').trim()
    if (!replyText) {
      alert("Paste the customer's reply first.")
      return
    }
    setFinalizeBusyId(leadId)
    try {
      const res = await fetch('/api/admin/finalize-lead', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, replyText }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error || 'Failed to create RFQ.')
      if (!json.created) {
        setFinalizeResults(prev => ({ ...prev, [leadId]: { error: `Couldn't extract this reply (${json.reason}).` } }))
        return
      }
      setFinalizeResults(prev => ({ ...prev, [leadId]: { rfqNumber: json.rfqNumber, itemCount: json.itemCount } }))
      await loadLeads()
    } catch (e) {
      setFinalizeResults(prev => ({ ...prev, [leadId]: { error: e.message } }))
    } finally {
      setFinalizeBusyId(null)
    }
  }

  if (loading) return <div className="card"><p>Loading…</p></div>

  return (
    <div>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Scan for leads</h3>
        <p>
          Searches the public web, one catalog part at a time, for people who look like they're
          actively trying to buy that part. Manually triggered — no automatic scheduling yet.
        </p>
        <button className="btn primary" onClick={handleScanAll} disabled={scanning}>
          {scanning ? 'Scanning…' : `Scan all ${products.products?.length || 0} catalog parts`}
        </button>

        {scanProgress && (
          <div style={{ marginTop: 12 }}>
            <div className="small">
              Scanning {scanProgress.current}/{scanProgress.total}: {scanProgress.currentSku}
            </div>
            <div style={{ background: '#eee', borderRadius: 8, height: 8, marginTop: 6 }}>
              <div
                style={{
                  width: `${(scanProgress.current / scanProgress.total) * 100}%`,
                  background: 'var(--accent, #2563eb)',
                  height: 8,
                  borderRadius: 8,
                  transition: 'width 0.2s',
                }}
              />
            </div>
          </div>
        )}

        {scanLog.length > 0 && (
          <div className="small" style={{ marginTop: 12, maxHeight: 120, overflowY: 'auto' }}>
            {scanLog.map((entry, i) => (
              <div key={i}>
                {entry.sku}: {entry.error ? `error — ${entry.error}` : `${entry.found} lead(s) found${entry.reason ? ` (${entry.reason})` : ''}`}
              </div>
            ))}
          </div>
        )}
      </div>

      {loadError && (
        <div className="card" style={{ marginBottom: 16, borderColor: '#fca5a5' }}>
          <p style={{ color: '#b91c1c' }}>{loadError}</p>
        </div>
      )}

      {leads.length === 0 && !loadError && (
        <div className="card"><p>No leads yet — run a scan above.</p></div>
      )}

      {leads.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>SKU</th>
              <th>Platform</th>
              <th>Snippet</th>
              <th>Qty</th>
              <th>Existing RFQs</th>
              <th>Status</th>
              <th>Reply → RFQ</th>
            </tr>
          </thead>
          <tbody>
            {leads.map(lead => {
              const isExpanded = expandedLeadId === lead.id
              const result = finalizeResults[lead.id]
              return (
                <>
                  <tr key={lead.id}>
                    <td className="small">{formatDate(lead.created_at)}</td>
                    <td>{lead.sku}</td>
                    <td>
                      {lead.source_url ? (
                        <a href={lead.source_url} target="_blank" rel="noopener noreferrer">
                          {lead.source_platform || 'Link'}
                        </a>
                      ) : (lead.source_platform || '—')}
                    </td>
                    <td className="small" style={{ maxWidth: 320 }}>{lead.snippet || '—'}</td>
                    <td>{lead.qty_mentioned ?? '—'}</td>
                    <td>
                      {rfqCountBySku[lead.sku] ? (
                        <span className="pill" title="Number of your own RFQ line items also requesting this SKU">
                          {rfqCountBySku[lead.sku]} existing RFQ{rfqCountBySku[lead.sku] > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="small">—</span>
                      )}
                    </td>
                    <td>
                      <select
                        value={lead.status}
                        onChange={e => handleStatusChange(lead.id, e.target.value)}
                        style={{ padding: 6, borderRadius: 8 }}
                      >
                        <option value="new">new</option>
                        <option value="contacted">contacted</option>
                        <option value="dismissed">dismissed</option>
                      </select>
                    </td>
                    <td>
                      <button className="btn" onClick={() => setExpandedLeadId(isExpanded ? null : lead.id)}>
                        {isExpanded ? 'Close' : 'Paste reply'}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} style={{ background: 'rgba(0,0,0,0.02)' }}>
                        <div style={{ padding: 12 }}>
                          <p className="small">
                            Paste what the customer replied with (an email body, a WhatsApp message, whatever they sent).
                            This gets turned into a real RFQ, linked back to this lead.
                          </p>
                          <textarea
                            value={replyDrafts[lead.id] || ''}
                            onChange={e => setReplyDrafts(prev => ({ ...prev, [lead.id]: e.target.value }))}
                            style={{ width: '100%', minHeight: 100, padding: 10 }}
                            placeholder="e.g. Hi, yes we're interested — need about 200 units of the Artix-7 board, can you also quote the Zynq one?"
                          />
                          <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                            <button
                              className="btn primary"
                              onClick={() => handleFinalize(lead.id)}
                              disabled={finalizeBusyId === lead.id}
                            >
                              {finalizeBusyId === lead.id ? 'Creating RFQ…' : 'Create RFQ from this reply'}
                            </button>
                            {result?.rfqNumber && (
                              <span className="small" style={{ color: '#15803d' }}>
                                ✓ Created {result.rfqNumber} with {result.itemCount} item(s) — check the RFQs tab.
                              </span>
                            )}
                            {result?.error && (
                              <span className="small" style={{ color: '#b91c1c' }}>{result.error}</span>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
