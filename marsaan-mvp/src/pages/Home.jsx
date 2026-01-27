import { Link, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import data from '../data/products.json'

const EXAMPLES = [
  'FPGA-A7-35T',
  '3.3V LDO voltage regulator',
  'IMU sensor I2C',
  'USB JTAG programmer'
]

export default function Home(){
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const products = data.products || []
  const count = data?.count || products.length

  const categories = useMemo(() => Array.from(new Set(products.map(p=>p.category))).filter(Boolean).sort(), [products])

  function onSearch(e){
    e.preventDefault()
    const qq = q.trim()
    nav(qq ? `/catalog?q=${encodeURIComponent(qq)}` : '/catalog')
  }

  return (
    <div>
      <section className="hero">
        <div className="hero-wrap">
          <div>
            <h1>The electronic parts sourcing engine — built for B2B RFQ.</h1>
            <p>
              Search by MPN, specs, or category. Upload a BOM and get a procurement-ready quote with alternates and lead-time options.
            </p>

            <form className="hero-search" onSubmit={onSearch}>
              <input
                className="input"
                placeholder="Search by keywords, specs, or part number"
                value={q}
                onChange={(e)=>setQ(e.target.value)}
              />
              <button className="btn primary" type="submit">Search</button>
            </form>

            <div className="hero-examples">
              <span className="small">Try an example:</span>
              {EXAMPLES.map(x => (
                <button key={x} className="linkbtn" onClick={() => nav(`/catalog?q=${encodeURIComponent(x)}`)} type="button">
                  {x}
                </button>
              ))}
            </div>

            <div className="kpis grid" style={{gridTemplateColumns:'repeat(12,1fr)'}}>
              <div className="kpi" style={{gridColumn:'span 4'}}>
                <div className="n">{count}</div>
                <div className="l">Curated SKUs available</div>
              </div>
              <div className="kpi" style={{gridColumn:'span 4'}}>
                <div className="n">RFQ-first</div>
                <div className="l">Built for procurement workflows</div>
              </div>
              <div className="kpi" style={{gridColumn:'span 4'}}>
                <div className="n">Traceable</div>
                <div className="l">Authorized-first sourcing approach</div>
              </div>
            </div>
          </div>

          <div className="card hero-side">
            <div className="section-title" style={{marginTop:0}}>
              <h2>Quick actions</h2>
              <span>B2B-first</span>
            </div>
            <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
              <Link className="btn primary" to="/rfq">Upload BOM</Link>
              <Link className="btn" to="/catalog">Browse catalog</Link>
              <Link className="btn" to="/quality">Quality policy</Link>
            </div>

            <div className="section-title" style={{marginTop:16}}>
              <h2>Top categories</h2>
              <span>{categories.length} groups</span>
            </div>
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              {categories.slice(0, 12).map(c => (
                <Link key={c} className="pill" to={`/catalog?category=${encodeURIComponent(c)}`}>{c}</Link>
              ))}
            </div>

            <div className="mini-callout" style={{marginTop:16}}>
              <b>Enterprise-ready tabs</b>
              <div className="small" style={{marginTop:6}}>
                Compliance, shipping/lead times, returns/RMA, and vendor documents available in the Company menu.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-title">
          <h2>Why Marsaan</h2>
          <span>credibility for semiconductor purchasing</span>
        </div>

        <div className="grid" style={{gridTemplateColumns:'repeat(12,1fr)'}}>
          <div className="card" style={{gridColumn:'span 4'}}>
            <h3>Procurement-friendly</h3>
            <p className="muted">RFQ-first flow, BOM upload, alternates, and lead-time options for real buyers.</p>
          </div>
          <div className="card" style={{gridColumn:'span 4'}}>
            <h3>Authorized-first sourcing</h3>
            <p className="muted">We prioritize authorized distributors and capture traceability evidence per SKU.</p>
          </div>
          <div className="card" style={{gridColumn:'span 4'}}>
            <h3>Fast response</h3>
            <p className="muted">Clear inputs → faster quotes. Share your BOM and we’ll respond with pricing and alternates.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
