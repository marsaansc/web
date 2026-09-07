import { useEffect, useState } from 'react'

const STATUS_OPTIONS = ['received', 'quoting', 'quoted', 'won', 'lost']

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString()
}

export default function Admin() {
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState(null)
  const [loginBusy, setLoginBusy] = useState(false)

  const [rfqs, setRfqs] = useState([])
  const [loadError, setLoadError] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [bomBusyId, setBomBusyId] = useState(null)

  async function loadRfqs() {
    setLoadError(null)
    try {
      const res = await fetch('/api/admin/rfqs', { credentials: 'same-origin' })
      if (res.status === 401) {
        setAuthed(false)
        return
      }
      const json = await res.json()
      if (!json.ok) throw new Error(json.error || 'Failed to load RFQs.')
      setAuthed(true)
      setRfqs(json.rfqs || [])
    } catch (e) {
      setLoadError(e.message || 'Failed to load RFQs.')
    }
  }

  useEffect(() => {
    (async () => {
      await loadRfqs()
      setCheckingAuth(false)
    })()
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setLoginBusy(true)
    setLoginError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const json = await res.json()
      if (!json.ok) {
        setLoginError(json.error || 'Login failed.')
        return
      }
      setPassword('')
      await loadRfqs()
    } catch (e) {
      setLoginError(e.message || 'Login failed.')
    } finally {
      setLoginBusy(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' })
    setAuthed(false)
    setRfqs([])
  }

  async function handleStatusChange(id, status) {
    // Optimistic update — feels instant, reverted on error.
    const prev = rfqs
    setRfqs(rfqs.map(r => (r.id === id ? { ...r, status } : r)))
    try {
      const res = await fetch('/api/admin/rfqs', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error || 'Failed to update status.')
    } catch (e) {
      setRfqs(prev)
      alert(`Couldn't update status: ${e.message}`)
    }
  }

  async function handleBomDownload(id) {
    setBomBusyId(id)
    try {
      const res = await fetch(`/api/admin/bom-download?id=${encodeURIComponent(id)}`, {
        credentials: 'same-origin',
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error || 'No BOM file available.')
      window.open(json.url, '_blank', 'noopener')
    } catch (e) {
      alert(e.message)
    } finally {
      setBomBusyId(null)
    }
  }

  if (checkingAuth) {
    return <div className="container" style={{ paddingTop: 40 }}>Loading…</div>
  }

  if (!authed) {
    return (
      <div className="container" style={{ paddingTop: 40, maxWidth: 380 }}>
        <div className="card">
          <h3>Admin login</h3>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: 10, marginTop: 10, marginBottom: 10 }}
              autoFocus
            />
            {loginError && <p className="small" style={{ color: '#b91c1c' }}>{loginError}</p>}
            <button className="btn primary" type="submit" disabled={loginBusy} style={{ width: '100%' }}>
              {loginBusy ? 'Checking…' : 'Log in'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: 24, paddingBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>RFQs</h2>
        <button className="btn" onClick={handleLogout}>Log out</button>
      </div>

      {loadError && (
        <div className="card" style={{ marginBottom: 16, borderColor: '#fca5a5' }}>
          <p style={{ color: '#b91c1c' }}>{loadError}</p>
        </div>
      )}

      {rfqs.length === 0 && !loadError && (
        <div className="card"><p>No RFQs yet.</p></div>
      )}

      {rfqs.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Ref #</th>
              <th>Date</th>
              <th>Company / Contact</th>
              <th>Email</th>
              <th>Status</th>
              <th>Items</th>
              <th>BOM</th>
            </tr>
          </thead>
          <tbody>
            {rfqs.map(rfq => {
              const items = rfq.rfq_line_items || []
              const isExpanded = expandedId === rfq.id
              return (
                <>
                  <tr key={rfq.id}>
                    <td>{rfq.rfq_number || '—'}</td>
                    <td className="small">{formatDate(rfq.created_at)}</td>
                    <td>
                      <div><b>{rfq.company || '—'}</b></div>
                      <div className="small">{rfq.contact_name}</div>
                    </td>
                    <td className="small">{rfq.email || '—'}</td>
                    <td>
                      <select
                        value={rfq.status}
                        onChange={e => handleStatusChange(rfq.id, e.target.value)}
                        style={{ padding: 6, borderRadius: 8 }}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      {items.length > 0 ? (
                        <button className="btn" onClick={() => setExpandedId(isExpanded ? null : rfq.id)}>
                          {items.length} {isExpanded ? '▲' : '▼'}
                        </button>
                      ) : (
                        <span className="small">0 (BOM upload)</span>
                      )}
                    </td>
                    <td>
                      {rfq.bom_storage_path ? (
                        <button
                          className="btn"
                          onClick={() => handleBomDownload(rfq.id)}
                          disabled={bomBusyId === rfq.id}
                        >
                          {bomBusyId === rfq.id ? '…' : `Download`}
                        </button>
                      ) : (
                        <span className="small">—</span>
                      )}
                    </td>
                  </tr>
                  {isExpanded && items.length > 0 && (
                    <tr>
                      <td colSpan={7} style={{ background: 'rgba(0,0,0,0.02)' }}>
                        <table className="table table-compact">
                          <thead>
                            <tr>
                              <th>SKU</th>
                              <th>Product</th>
                              <th>Model / Part #</th>
                              <th>Qty</th>
                            </tr>
                          </thead>
                          <tbody>
                            {items.map(li => (
                              <tr key={li.id}>
                                <td>{li.sku || '—'}</td>
                                <td>{li.product_name || '—'}</td>
                                <td>{li.model_part_number || '—'}</td>
                                <td>{li.qty ?? '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
