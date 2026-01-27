import { useMemo, useState } from 'react'
import data from '../data/products.json'
import { Link } from 'react-router-dom'

export default function Manufacturers(){
  const products = data.products || []
  const list = useMemo(() => {
    const set = new Set(products.map(p => (p.manufacturer || '').trim()).filter(Boolean))
    return Array.from(set).sort((a,b)=>a.localeCompare(b))
  }, [products])

  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    if(!qq) return list
    return list.filter(x => x.toLowerCase().includes(qq))
  }, [list, q])

  return (
    <div>
      <div className="section-title">
        <h2>Manufacturers</h2>
        <span>A–Z directory</span>
      </div>

      <div className="card">
        <div className="toolbar">
          <input className="input" style={{flex:'1 1 320px'}} placeholder="Search manufacturer (e.g., Xilinx, ST, TI…)" value={q} onChange={(e)=>setQ(e.target.value)} />
          <Link className="btn primary" to="/rfq">Request sourcing</Link>
        </div>
        <div className="small">If you share your AVL (approved vendor list), we can map RFQ routing to authorized channels first.</div>
      </div>

      <div className="card" style={{marginTop:14}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <b>Directory</b>
          <span className="pill">{filtered.length} manufacturer(s)</span>
        </div>
        <div className="mfr-grid" style={{marginTop:12}}>
          {filtered.map(m => (
            <div key={m} className="mfr-item">
              <div style={{fontWeight:700}}>{m}</div>
              <div className="small">Browse parts by this manufacturer in catalog</div>
              <Link className="btn" to={`/catalog?q=${encodeURIComponent(m)}`}>Search</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
