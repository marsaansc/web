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

    // Production behavior: send RFQ + BOM to Vercel serverless function (/api/rfq)
    // If the server responds with an error, show the message and allow manual JSON download.
    // Only auto-download if the network call itself fails.
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
        setStatus({ type:'warn', msg: msg })
        return
      }

      setStatus({ type:'ok', msg:'RFQ submitted. You will receive an email at rfq@marsaan.com shortly.' })
      // clear cart after submit (optional)
      // localStorage.removeItem('marsaan_quote_cart')
      // setCart([])
      return
    }catch(err){
      // Network or unexpected runtime error: keep the RFQ locally and allow manual download.
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
      <div className="section-title">
        <h2>Request Quote / BOM Upload</h2>
        <span>RFQ-first B2B MVP</span>
      </div>

      <div className="two-col">
        <QuoteCart items={cart} onRemove={onRemove} onQty={onQty} />

        <form className="card" onSubmit={onSubmit}>
          <h3>Lead capture</h3>
          <p>Fill these details and submit. This form is connected to a Vercel backend endpoint that emails your RFQ to rfq@marsaan.com. If the endpoint fails, you can download the RFQ JSON and email it manually.</p>

          <div className="toolbar">
            <input className="input" placeholder="Company / Lab / Institute" value={form.company}
                   onChange={(e)=>setForm({...form, company:e.target.value})} required />
            <select value={form.customerType} onChange={(e)=>setForm({...form, customerType:e.target.value})}>
              <option>Startup</option>
              <option>OEM</option>
              <option>University</option>
              <option>Reseller</option>
              <option>Individual</option>
            </select>
          </div>

          <div className="toolbar">
            <input className="input" placeholder="Your name" value={form.name}
                   onChange={(e)=>setForm({...form, name:e.target.value})} required />
            <input className="input" type="email" placeholder="Work email" value={form.email}
                   onChange={(e)=>setForm({...form, email:e.target.value})} required />
          </div>

          <div className="toolbar">
            <input className="input" placeholder="Phone / WhatsApp" value={form.phone}
                   onChange={(e)=>setForm({...form, phone:e.target.value})} />
            <input className="input" placeholder="Country" value={form.country}
                   onChange={(e)=>setForm({...form, country:e.target.value})} />
            <input className="input" type="date" value={form.neededBy}
                   onChange={(e)=>setForm({...form, neededBy:e.target.value})} />
          </div>

          <div style={{marginTop:10}}>
            <label className="small"><b>BOM Upload</b> (CSV/XLSX/PDF)</label><br/>
            <input className="input" type="file" onChange={(e)=>setBomFile(e.target.files?.[0] || null)} />
            <div className="small" style={{marginTop:6}}>
              Tip: For production, store BOM files securely (S3/Drive) and link them to the RFQ record.
            </div>
          </div>

          <div style={{marginTop:10}}>
            <textarea rows="4" style={{width:'100%'}} className="input" placeholder="Notes (quantities, alternates allowed, shipping pincode, etc.)"
                      value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})} />
          </div>

          {status && (
            <div className={status.type === 'ok' ? 'notice success' : 'notice warning'} style={{marginTop:10}}>
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
          <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:12}}>
            <button className="btn primary" type="submit" disabled={submitting || (!hasLines && !bomFile)}>Submit RFQ</button>
            <Link className="btn" to="/catalog">Add products</Link>
            <Link className="btn" to="/quality">See Quality policy</Link>
          </div>

          <div className="small" style={{marginTop:10}}>
            Production integration: Vercel serverless function → email to rfq@marsaan.com + optional webhook to Zoho/Odoo CRM.
          </div>
        </form>
      </div>
    </div>
  )
}
