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

  function onRemove(sku){
    setCart(removeFromCart(sku))
  }
  function onQty(sku, qty){
    setCart(updateQty(sku, qty))
  }

  function onSubmit(e){
    e.preventDefault()

    const payload = {
      submittedAt: new Date().toISOString(),
      form,
      cart,
      bomFile: bomFile ? { name: bomFile.name, size: bomFile.size, type: bomFile.type } : null,
      nextStep: "Send this JSON + BOM file to rfq@marsaan.com OR connect this form to Formspree/Netlify/Vercel function."
    }

    // MVP behavior: download RFQ JSON so you can email it with the BOM file.
    downloadText(`Marsaan_RQ_${Date.now()}.json`, JSON.stringify(payload, null, 2))
    alert("RFQ saved as a JSON download. Next: email the JSON + BOM file to rfq@marsaan.com, or connect a form endpoint.")
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
          <p>Fill these details and submit. In this MVP template, the RFQ downloads as JSON so you can email it to your inbox.
             Later, connect this to a real backend or form endpoint.</p>

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

          <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:12}}>
            <button className="btn primary" type="submit" disabled={!hasLines && !bomFile}>Submit RFQ</button>
            <Link className="btn" to="/catalog">Add products</Link>
            <Link className="btn" to="/quality">See Quality policy</Link>
          </div>

          <div className="small" style={{marginTop:10}}>
            Production integration ideas: Formspree / Netlify Forms / Vercel serverless function → email to rfq@marsaan.com + save to CRM.
          </div>
        </form>
      </div>
    </div>
  )
}
