import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import data from '../data/products.json'
import { addToCart } from '../components/QuoteCart.jsx'

function fmtINR(x){
  const n = Number(x)
  if(!Number.isFinite(n) || n <= 0) return ''
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

export default function Catalog(){
  const [params, setParams] = useSearchParams()
  const products = data.products || []
  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p=>p.category))).sort()], [products])

  const [q, setQ] = useState(params.get('q') || '')
  const [category, setCategory] = useState(params.get('category') || 'All')
  const [view, setView] = useState(params.get('view') || 'table') // table | grid
  const [toast, setToast] = useState('')

  useEffect(()=>{
    const next = new URLSearchParams(params)
    q ? next.set('q', q) : next.delete('q')
    category && category !== 'All' ? next.set('category', category) : next.delete('category')
    view ? next.set('view', view) : next.delete('view')
    setParams(next, { replace:true })
    // eslint-disable-next-line
  }, [q, category, view])

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return products.filter(p => {
      if(category !== 'All' && p.category !== category) return false
      if(!qq) return true
      const hay = [p.sku, p.productName, p.manufacturer, p.modelPartNumber, p.keySpecs, p.useCase, p.productType].join(' ').toLowerCase()
      return hay.includes(qq)
    })
  }, [products, q, category])

  function onAdd(p){
    addToCart(p)
    setToast(`Added to quote list: ${p.sku}`)
    setTimeout(()=>setToast(''), 1600)
  }

  return (
    <div>
      <div className="section-title">
        <h2>Catalog</h2>
        <span>{filtered.length} items</span>
      </div>

      <div className="toolbar">
        <input
          className="input"
          style={{flex:'1 1 280px'}}
          placeholder="Search MPN, SKU, manufacturer, specs…"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
        />
        <select value={category} onChange={(e)=>setCategory(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="toggle" role="tablist" aria-label="View">
          <button className={view==='table' ? 'btn active' : 'btn'} type="button" onClick={()=>setView('table')}>Table</button>
          <button className={view==='grid' ? 'btn active' : 'btn'} type="button" onClick={()=>setView('grid')}>Cards</button>
        </div>

        <Link className="btn primary" to="/rfq">Go to RFQ</Link>
      </div>

      {toast ? <div className="pill" style={{marginBottom:12, borderColor:'rgba(34,197,94,.35)', color:'rgba(15,23,42,.8)'}}>{toast}</div> : null}

      {view === 'table' ? (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>MPN / SKU</th>
                <th>Manufacturer</th>
                <th>Category</th>
                <th>Key specs</th>
                <th>Lead time</th>
                <th>Indicative</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.sku}>
                  <td>
                    <Link to={`/product/${encodeURIComponent(p.sku)}`}><b>{p.modelPartNumber || p.sku}</b></Link>
                    <div className="small">SKU: {p.sku}</div>
                  </td>
                  <td>{p.manufacturer || '—'}</td>
                  <td><span className="pill">{p.category || '—'}</span></td>
                  <td className="small">{p.keySpecs || p.useCase || '—'}</td>
                  <td className="small">{p.leadTimeDays ? `~${Math.round(p.leadTimeDays)} days` : 'RFQ'}</td>
                  <td className="small">{p.plannedSellPriceINR ? fmtINR(p.plannedSellPriceINR) : 'RFQ'}</td>
                  <td style={{whiteSpace:'nowrap'}}>
                    <button className="btn" type="button" onClick={()=>onAdd(p)}>Add</button>
                    <Link className="btn primary" style={{marginLeft:8}} to={`/rfq?sku=${encodeURIComponent(p.sku)}`}>Quote</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
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
                      <div className="small">Indicative</div>
                      <div style={{fontWeight:800,fontSize:18}}>{fmtINR(p.plannedSellPriceINR)}</div>
                    </div>
                  ) : <div className="small">RFQ for pricing</div>}
                  {p.leadTimeDays ? <div className="small" style={{marginTop:6}}>Lead time: ~{Math.round(p.leadTimeDays)} days</div> : null}
                </div>
              </div>

              <p className="muted" style={{marginTop:10}}>{p.keySpecs || p.useCase || '—'}</p>

              <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:12}}>
                <Link className="btn" to={`/product/${encodeURIComponent(p.sku)}`}>View</Link>
                <button className="btn" type="button" onClick={()=>onAdd(p)}>Add to Quote</button>
                <Link className="btn primary" to={`/rfq?sku=${encodeURIComponent(p.sku)}`}>Request Quote</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="small" style={{marginTop:14}}>
        Tip: For best turnaround, share quantity breaks, target price, alternates allowed, and needed-by date.
      </div>
    </div>
  )
}
