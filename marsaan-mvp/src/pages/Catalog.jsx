import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import data from '../data/products.json'
import { addToCart } from '../components/QuoteCart.jsx'

export default function Catalog(){
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') || '')
  const [category, setCategory] = useState(params.get('category') || 'All')
  const [toast, setToast] = useState('')

  const products = data.products || []
  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p=>p.category))).sort()], [products])

  useEffect(()=>{
    const next = new URLSearchParams(params)
    q ? next.set('q', q) : next.delete('q')
    category && category !== 'All' ? next.set('category', category) : next.delete('category')
    setParams(next, { replace:true })
    // eslint-disable-next-line
  }, [q, category])

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return products.filter(p => {
      if(category !== 'All' && p.category !== category) return false
      if(!qq) return true
      const hay = [
        p.sku, p.productName, p.manufacturer, p.modelPartNumber, p.keySpecs, p.useCase, p.productType
      ].join(' ').toLowerCase()
      return hay.includes(qq)
    })
  }, [products, q, category])

  function onAdd(p){
    addToCart(p)
    setToast(`Added to quote basket: ${p.sku}`)
    setTimeout(()=>setToast(''), 1600)
  }

  return (
    <div>
      <div className="section-title">
        <h2>Catalog</h2>
        <span>{filtered.length} items</span>
      </div>

      <div className="toolbar">
        <input className="input" style={{flex:'1 1 280px'}} placeholder="Search SKU, model, manufacturer, specs…"
               value={q} onChange={(e)=>setQ(e.target.value)} />
        <select value={category} onChange={(e)=>setCategory(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <Link className="btn primary" to="/rfq">Go to RFQ</Link>
      </div>

      {toast ? <div className="pill" style={{marginBottom:12, borderColor:'rgba(166,255,203,.45)'}}>{toast}</div> : null}

      <div className="grid" style={{gridTemplateColumns:'repeat(12,1fr)'}}>
        {filtered.map(p => (
          <div key={p.sku} className="card" style={{gridColumn:'span 6'}}>
            <div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
              <div>
                <div className="pill" style={{marginBottom:10}}>{p.category}</div>
                <h3 style={{margin:'0 0 6px'}}>{p.productName}</h3>
                <div className="small"><b>{p.sku}</b> • {p.manufacturer} • {p.modelPartNumber}</div>
              </div>
              <div style={{textAlign:'right'}}>
                {p.plannedSellPriceINR ? (
                  <div>
                    <div className="small">Planned Sell</div>
                    <div style={{fontWeight:800,fontSize:18}}>₹{Math.round(p.plannedSellPriceINR)}</div>
                  </div>
                ) : <div className="small">RFQ for pricing</div>}
                {p.leadTimeDays ? <div className="small" style={{marginTop:6}}>Lead time: ~{Math.round(p.leadTimeDays)} days</div> : null}
              </div>
            </div>

            <p style={{marginTop:10}}>{p.keySpecs || p.useCase || '—'}</p>

            <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:12}}>
              <Link className="btn" to={`/product/${encodeURIComponent(p.sku)}`}>View</Link>
              <button className="btn primary" onClick={()=>onAdd(p)}>Add to Quote</button>
              <Link className="btn" to={`/rfq?sku=${encodeURIComponent(p.sku)}`}>Request Quote</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
