import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import data from '../data/products.json'
import aiBg from '../assets/ai-edge-board.jpg'
import fpgaBg from '../assets/fpga.jpg'
import mcuBg from '../assets/microcontroller.jpg'
import { addToCart } from '../components/QuoteCart.jsx'

function fmtINR(n){
  if(!n || Number.isNaN(Number(n))) return null
  const v = Math.round(Number(n))
  return `₹${v.toLocaleString('en-IN')}`
}

export default function Catalog(){
  const products = data.products || []
  const [params, setParams] = useSearchParams()

  // URL-backed state (so it feels “pro” and shareable)
  const [q, setQ] = useState(params.get('q') || '')
  const [category, setCategory] = useState(params.get('category') || 'All')
  const [manufacturer, setManufacturer] = useState(params.get('mfg') || 'All')
  const [view, setView] = useState(params.get('view') || 'table') // table | grid
  const [sort, setSort] = useState(params.get('sort') || 'relevance') // relevance | priceAsc | priceDesc
  const [toast, setToast] = useState('')

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map(p=>p.category))).sort()],
    [products]
  )
  const manufacturers = useMemo(
    () => ['All', ...Array.from(new Set(products.map(p=>p.manufacturer).filter(Boolean))).sort()],
    [products]
  )

  // Keep URL in sync
  useEffect(()=>{
    const next = new URLSearchParams(params)
    q ? next.set('q', q) : next.delete('q')
    category !== 'All' ? next.set('category', category) : next.delete('category')
    manufacturer !== 'All' ? next.set('mfg', manufacturer) : next.delete('mfg')
    view !== 'table' ? next.set('view', view) : next.delete('view')
    sort !== 'relevance' ? next.set('sort', sort) : next.delete('sort')
    setParams(next, { replace:true })
    // eslint-disable-next-line
  }, [q, category, manufacturer, view, sort])

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    let arr = products.filter(p => {
      if(category !== 'All' && p.category !== category) return false
      if(manufacturer !== 'All' && p.manufacturer !== manufacturer) return false
      if(!qq) return true
      const hay = [
        p.sku, p.productName, p.manufacturer, p.modelPartNumber, p.keySpecs, p.useCase, p.productType
      ].join(' ').toLowerCase()
      return hay.includes(qq)
    })

    // sorting (safe and simple)
    if(sort === 'priceAsc'){
      arr = [...arr].sort((a,b)=>(a.plannedSellPriceINR||Infinity) - (b.plannedSellPriceINR||Infinity))
    }else if(sort === 'priceDesc'){
      arr = [...arr].sort((a,b)=>(b.plannedSellPriceINR||-Infinity) - (a.plannedSellPriceINR||-Infinity))
    }
    return arr
  }, [products, q, category, manufacturer, sort])

  function onAdd(p){
    addToCart(p)
    setToast(`Added to quote basket: ${p.sku}`)
    setTimeout(()=>setToast(''), 1600)
  }

  function clearFilters(){
    setQ('')
    setCategory('All')
    setManufacturer('All')
    setSort('relevance')
  }

  return (
    <>
<Link className="btn primary" to="/rfq">Upload BOM</Link>
          </div>
        }
      />
      <div className="catalog-topbar">
        <div className="container">
          <div className="crumbs"><Link to="/">Home</Link> <span className="sep">/</span> <span>Catalog</span></div>
          <div className="topbar-row">
            <div>
              <h1 className="page-title">Catalog</h1>
              <div className="page-sub">Search by part number, specs, or category. Add items to your quote basket and request an RFQ.</div>
            </div>
            <div className="topbar-actions">
              <Link className="btn btn-primary" to="/rfq">Upload BOM</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="catalog-shell">

      {/* LEFT FILTERS (DigiKey/Arrow style) */}
      <aside className="catalog-filters">
        <div className="filter-head">
          <div>
            <div className="small" style={{opacity:.9}}>Catalog</div>
            <h2 style={{margin:'4px 0 0'}}>Filters</h2>
          </div>
          <button className="btn" type="button" onClick={clearFilters}>Reset</button>
        </div>

        <div className="filter-group">
          <div className="filter-title">Search</div>
          <input
            className="input"
            placeholder="Part number, spec, keyword…"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
          />
          <div className="small" style={{marginTop:8}}>Tip: Try “3.3V LDO”, “A7-35T”, “ESP32”.</div>
        </div>

        <div className="filter-group">
          <div className="filter-title">Category</div>
          <div className="filter-list">
            {categories.map(c => (
              <button
                key={c}
                type="button"
                className={c === category ? 'filter-item active' : 'filter-item'}
                onClick={()=>setCategory(c)}
              >
                <span>{c}</span>
                <span className="small">{c === 'All' ? products.length : products.filter(p=>p.category===c).length}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <div className="filter-title">Manufacturer</div>
          <select value={manufacturer} onChange={(e)=>setManufacturer(e.target.value)}>
            {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <div className="small" style={{marginTop:8}}>We’ll expand to authorized lines as partnerships grow.</div>
        </div>

        <div className="filter-group">
          <div className="filter-title">Need a custom quote?</div>
          <div className="small">Upload your BOM and we’ll respond with lead-time options (authorized vs local stock).</div>
          <div style={{marginTop:10, display:'flex', gap:10, flexWrap:'wrap'}}>
            <Link className="btn primary" to="/rfq">Upload BOM</Link>
            <Link className="btn" to="/quality">Quality</Link>
          </div>
        </div>
      </aside>

      {/* RIGHT RESULTS */}
      <section className="catalog-results watermark" style={{"--wm1": `url(${aiBg})`, "--wm2": `url(${fpgaBg})`, "--wm3": `url(${mcuBg})`}}>
        <div className="results-head">
          <div>
            <h2 style={{margin:'0 0 4px'}}>Parts</h2>
            <div className="small">{filtered.length} items • RFQ-first workflow</div>
          </div>

          <div className="results-actions">
            <select value={sort} onChange={(e)=>setSort(e.target.value)}>
              <option value="relevance">Sort: Relevance</option>
              <option value="priceAsc">Sort: Price (Low → High)</option>
              <option value="priceDesc">Sort: Price (High → Low)</option>
            </select>

            <div className="segmented">
              <button type="button" className={view === 'table' ? 'seg active' : 'seg'} onClick={()=>setView('table')}>Table</button>
              <button type="button" className={view === 'grid' ? 'seg active' : 'seg'} onClick={()=>setView('grid')}>Grid</button>
            </div>

            <Link className="btn" to="/rfq">RFQ</Link>
          </div>
        </div>

        {toast ? <div className="pill" style={{marginBottom:12, borderColor:'rgba(34,197,94,.35)', color:'#14532d', background:'rgba(34,197,94,.08)'}}>{toast}</div> : null}

        {view === 'table' ? (
          <div className="card" style={{padding:0, overflow:'hidden'}}>
            <table className="table table-compact">
              <thead>
                <tr>
                  <th style={{width:'22%'}}>Part</th>
                  <th style={{width:'18%'}}>Manufacturer</th>
                  <th style={{width:'35%'}}>Key specs</th>
                  <th style={{width:'12%'}}>Lead time</th>
                  <th style={{width:'13%'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.sku} className="row-hover">
                    <td>
                      <div style={{fontWeight:750}}>{p.sku}</div>
                      <div className="small">{p.productName}</div>
                      <div className="small" style={{marginTop:6, display:'flex', gap:8, flexWrap:'wrap'}}>
                        <span className="pill" style={{padding:'4px 8px'}}>{p.category}</span>
                        {p.plannedSellPriceINR ? <span className="pill" style={{padding:'4px 8px'}}>{fmtINR(p.plannedSellPriceINR)}</span> : <span className="pill" style={{padding:'4px 8px'}}>RFQ pricing</span>}
                      </div>
                    </td>
                    <td>
                      <div style={{fontWeight:650}}>{p.manufacturer || '—'}</div>
                      <div className="small">{p.modelPartNumber || '—'}</div>
                    </td>
                    <td className="small" style={{color:'var(--text)'}}>{p.keySpecs || p.useCase || '—'}</td>
                    <td>
                      <div className="small">{p.leadTimeDays ? `~${Math.round(p.leadTimeDays)} days` : '—'}</div>
                      <div className="small" style={{marginTop:6}}>Authorized → Local</div>
                    </td>
                    <td>
                      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                        <Link className="btn" to={`/product/${encodeURIComponent(p.sku)}`}>View</Link>
                        <button className="btn primary" type="button" onClick={()=>onAdd(p)}>Add</button>
                      </div>
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
                        <div className="small">Planned Sell</div>
                        <div style={{fontWeight:800,fontSize:18}}>{fmtINR(p.plannedSellPriceINR)}</div>
                      </div>
                    ) : <div className="small">RFQ for pricing</div>}
                    {p.leadTimeDays ? <div className="small" style={{marginTop:6}}>Lead time: ~{Math.round(p.leadTimeDays)} days</div> : null}
                  </div>
                </div>

                <p style={{marginTop:10}}>{p.keySpecs || p.useCase || '—'}</p>

                <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:12}}>
                  <Link className="btn" to={`/product/${encodeURIComponent(p.sku)}`}>View</Link>
                  <button className="btn primary" type="button" onClick={()=>onAdd(p)}>Add to Quote</button>
                  <Link className="btn" to={`/rfq?sku=${encodeURIComponent(p.sku)}`}>Request Quote</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      </div>
    </>
  )
}
