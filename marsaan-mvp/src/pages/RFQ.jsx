import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import data from '../data/products.json'
import QuoteCart, { loadCart, removeFromCart, updateQty } from '../components/QuoteCart.jsx'

function downloadText(filename, text){
  const blob = new Blob([text], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(()=>URL.revokeObjectURL(a.href), 500)
}

export default function RFQ(){
  const [params] = useSearchParams()
  const preSku = params.get('sku') || ''
  const [cart, setCart] = useState(loadCart())
  const [bomFile, setBomFile] = useState(null)

  const [form, setForm] = useState({
    company: '', name: '', email: '', phone: '',
    customerType: 'Startup', country: 'India',
    neededBy: '', notes: ''
  })

  // If sku passed, ensure it's in cart (soft add)
  useEffect(()=>{
    if(!preSku) return
    const exists = cart.some(x=>x.sku === preSku)
    if(exists) return
    const p = (data.products||[]).find(x=>x.sku === preSku)
    if(!p) return
    const next = [...cart, { sku: p.sku, name: p.productName, model: p.modelPartNumber, category: p.category, qty: 1 }]
    localStorage.setItem('marsaan_quote_cart', JSON.stringify(next))
    setCart(next)
    // eslint-disable-next-line
  }, [preSku])

  const hasLines = useMemo(()=> (cart||[]).length > 0, [cart])

  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null)
  const [lastPayload, setLastPayload] = useState(null)

  async function onSubmit(e){
    e.preventDefault()
    setStatus(null)
    setLastPayload(null)

    const payload = {
      submittedAt: new Date().toISOString(),
      form,
      cart,
      bomFile: bomFile ? { name: bomFile.name, size: bomFile.size, type: bomFile.type } : null
    }

    try{
      setSubmitting(true)
      const fd = new FormData()
      fd.append('rfq', JSON.stringify(payload))
      if(bomFile) fd.append('bom', bomFile)

      const r = await fetch('/api/rfq', { method: 'POST', body: fd })
      const j = await r.json().catch(()=>null)

      if(!r.ok || !j?.ok){
        const msg = j?.error || `Submission failed (${r.status})`
        setLastPayload(payload)
        setStatus({ type:'warn', msg })
        return
      }

      const refMsg = j?.rfqNumber ? ` Your reference number is ${j.rfqNumber}.` : ''
      setStatus({ type:'ok', msg:`RFQ submitted.${refMsg} You will receive an email at rfq@marsaan.com shortly.` })
      return
    }catch(err){
      setLastPayload(payload)
      setStatus({ type:'warn', msg:`RFQ endpoint request failed: ${err?.message || 'Unknown error'}. You can download the RFQ JSON and email it manually.` })
    }finally{
      setSubmitting(false)
    }
  }

  function onRemove(sku){
    setCart(removeFromCart(sku))
  }
  function onQty(sku, qty){
    setCart(updateQty(sku, qty))
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <div className="small">RFQ / BOM Upload</div>
          <h1 style={{margin:'6px 0 0'}}>Get a quote with lead-time options</h1>
          <div className="small" style={{marginTop:10, maxWidth:860}}>
            Upload your BOM or pick items from the catalog. We respond with pricing + lead times + traceability notes
            (authorized distributors vs vetted local stock) in one consolidated quote.
          </div>
        </div>
        <div className="page-head-actions">
          <Link className="btn" to="/catalog">Browse Catalog</Link>
          <a className="btn" href="/api/health" target="_blank" rel="noreferrer">API Health</a>
        </div>
      </div>

      <div className="rfq-shell">
        <div className="rfq-left">
          <div className="card card-soft">
            <div className="rfq-steps">
              <div className="step"><span className="dot"/>Add parts / BOM</div>
              <div className="step"><span className="dot"/>Share constraints</div>
              <div className="step"><span className="dot"/>Receive quote</div>
            </div>
            <div className="small" style={{marginTop:10}}>
              Expected response: <b>same day / next business day</b> for most BOMs.
            </div>
          </div>

          <QuoteCart items={cart} onRemove={onRemove} onQty={onQty} />
        </div>

        <form className="card rfq-form" onSubmit={onSubmit}>
          <div className="form-head">
            <div>
              <h2 style={{margin:'0 0 6px'}}>Buyer details</h2>
              <div className="small">This helps us choose the right supply path and share compliant paperwork.</div>
            </div>
            <span className="pill pill-accent">Secure RFQ submission</span>
          </div>

          <div className="form-grid">
            <div>
              <label className="label">Company / Lab / Institute</label>
              <input className="input" placeholder="e.g., Marsaan Labs Pvt Ltd" value={form.company}
                     onChange={(e)=>setForm({...form, company:e.target.value})} required />
            </div>
            <div>
              <label className="label">Customer type</label>
              <select value={form.customerType} onChange={(e)=>setForm({...form, customerType:e.target.value})}>
                <option>Startup</option>
                <option>OEM</option>
                <option>University</option>
                <option>Reseller</option>
                <option>Individual</option>
              </select>
            </div>

            <div>
              <label className="label">Your name</label>
              <input className="input" placeholder="Full name" value={form.name}
                     onChange={(e)=>setForm({...form, name:e.target.value})} required />
            </div>
            <div>
              <label className="label">Work email</label>
              <input className="input" type="email" placeholder="name@company.com" value={form.email}
                     onChange={(e)=>setForm({...form, email:e.target.value})} required />
            </div>

            <div>
              <label className="label">Phone / WhatsApp</label>
              <input className="input" placeholder="+91 …" value={form.phone}
                     onChange={(e)=>setForm({...form, phone:e.target.value})} />
            </div>
            <div>
              <label className="label">Country</label>
              <input className="input" placeholder="India" value={form.country}
                     onChange={(e)=>setForm({...form, country:e.target.value})} />
            </div>
          </div>

          <div className="divider" />

          <div className="form-head" style={{marginTop:0}}>
            <div>
              <h2 style={{margin:'0 0 6px'}}>BOM upload</h2>
              <div className="small">CSV/XLSX/PDF supported. Add “needed-by date” and alternates preference.</div>
            </div>
            <div className="small">{hasLines ? `${cart.length} line(s) in basket` : 'No basket lines yet'}</div>
          </div>

          <div className="upload-card">
            <div>
              <div style={{fontWeight:700}}>Drop your BOM here</div>
              <div className="small" style={{marginTop:6}}>or click to choose a file</div>
            </div>
            <input
              className="upload-input"
              type="file"
              onChange={(e)=>setBomFile(e.target.files?.[0] || null)}
            />
          </div>
          {bomFile ? (
            <div className="small" style={{marginTop:8}}>
              Selected: <b>{bomFile.name}</b> ({Math.round(bomFile.size/1024)} KB)
            </div>
          ) : null}

          <div className="form-grid" style={{marginTop:12}}>
            <div>
              <label className="label">Needed-by date (optional)</label>
              <input className="input" type="date" value={form.neededBy}
                     onChange={(e)=>setForm({...form, neededBy:e.target.value})} />
            </div>
            <div>
              <label className="label">Shipping pincode / city (optional)</label>
              <input className="input" placeholder="e.g., 5600XX / Bangalore" value={form.shipping || ''}
                     onChange={(e)=>setForm({...form, shipping:e.target.value})} />
            </div>
          </div>

          <div style={{marginTop:12}}>
            <label className="label">Notes</label>
            <textarea rows="4" style={{width:'100%'}} className="input" placeholder="Quantities, alternates allowed, target brand, certifications needed, etc."
                      value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})} />
          </div>

          {status && (
            <div className={status.type === 'ok' ? 'notice success' : 'notice warning'} style={{marginTop:12}}>
              <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
                <span>{status.msg}</span>
                {lastPayload && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => downloadText(`Marsaan_RFQ_${Date.now()}.json`, JSON.stringify(lastPayload, null, 2))}
                  >
                    Download RFQ JSON
                  </button>
                )}
                {status.type !== 'ok' && (
                  <a className="btn" href="/api/health" target="_blank" rel="noreferrer">Check /api/health</a>
                )}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button className="btn primary" type="submit" disabled={submitting || (!hasLines && !bomFile)}>
              {submitting ? 'Submitting…' : 'Submit RFQ'}
            </button>
            <Link className="btn" to="/catalog">Add parts</Link>
            <Link className="btn" to="/quality">Quality policy</Link>
          </div>

          <div className="callout" style={{marginTop:12}}>
            <div style={{fontWeight:700, marginBottom:6}}>What you’ll receive</div>
            <ul style={{margin:'0 0 0 18px', padding:0}}>
              <li>Pricing per line + MOQ notes</li>
              <li>Lead times (authorized vs local stock)</li>
              <li>Traceability / warranty / DOA terms</li>
              <li>Alternate part suggestions</li>
            </ul>
          </div>

          <div className="small" style={{marginTop:10}}>
            Production integration: Vercel serverless function → email to rfq@marsaan.com + optional webhook to CRM/ERP.
          </div>
        </form>
      </div>
    </div>
  )
}
