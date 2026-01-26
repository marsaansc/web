import { Link, useNavigate } from 'react-router-dom'
import data from '../data/products.json'

export default function Home(){
  const navigate = useNavigate()
  const count = data?.count || 0
  const categories = Array.from(new Set((data.products||[]).map(p=>p.category))).sort()
  const example = '3.3V LDO voltage regulator'

  function onSearch(e){
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const q = String(fd.get('q') || '').trim()
    navigate(q ? `/catalog?q=${encodeURIComponent(q)}` : '/catalog')
  }

  return (
    <div>
      <section className="hero hero-octo">
        <div className="hero-octo-inner">
          <div className="hero-octo-top">
            <div className="pill" style={{borderColor:'rgba(100,210,255,.35)', color:'rgba(231,238,252,.9)'}}>
              B2B-first • Catalog + RFQ + BOM Upload
            </div>
            <h1 className="hero-octo-title">The electronic parts RFQ engine for Bangalore builders.</h1>
            <p className="hero-octo-sub">
              Search by part number, specs, or category. Build a quote basket, upload your BOM, and get a fast, traceable response.
            </p>
          </div>

          <form className="hero-search" onSubmit={onSearch}>
            <div className="hero-search-box">
              <span className="hero-search-icon" aria-hidden="true">⌕</span>
              <input
                className="hero-search-input"
                name="q"
                placeholder="Search by keywords, tech specs, or part number"
                defaultValue=""
                autoComplete="off"
              />
              <button className="btn primary hero-search-btn" type="submit">Search</button>
            </div>
            <div className="hero-search-hint">
              Try an example:&nbsp;
              <button
                type="button"
                className="linklike"
                onClick={()=>navigate(`/catalog?q=${encodeURIComponent(example)}`)}
              >
                {example}
              </button>
              <span className="dot">•</span>
              <Link className="linklike" to="/rfq">Upload BOM</Link>
              <span className="dot">•</span>
              <Link className="linklike" to="/catalog">Browse catalog</Link>
            </div>
          </form>

          <div className="hero-octo-kpis">
            <div className="kpi">
              <div className="n">{count}</div>
              <div className="l">High-priority SKUs loaded</div>
            </div>
            <div className="kpi">
              <div className="n">Fast</div>
              <div className="l">RFQ-first workflow (B2B)</div>
            </div>
            <div className="kpi">
              <div className="n">Tiered</div>
              <div className="l">Authorized + local stock options</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{marginTop:16}}>
        <div className="section-title">
          <h2>Quick start</h2>
          <span>how most buyers use Marsaan</span>
        </div>
        <div className="grid" style={{gridTemplateColumns:'repeat(12,1fr)'}}>
          <div className="card" style={{gridColumn:'span 4'}}>
            <h3>1) Find parts</h3>
            <p>Search by part number/specs or browse categories. Add items to your quote basket.</p>
            <div style={{marginTop:10}}>
              <Link to="/catalog" className="btn">Open Catalog</Link>
            </div>
          </div>
          <div className="card" style={{gridColumn:'span 4'}}>
            <h3>2) Upload BOM</h3>
            <p>Share quantities, needed-by date and alternates preference. We’ll consolidate suppliers.</p>
            <div style={{marginTop:10}}>
              <Link to="/rfq" className="btn primary">RFQ / BOM Upload</Link>
            </div>
          </div>
          <div className="card" style={{gridColumn:'span 4'}}>
            <h3>3) Get quote</h3>
            <p>Receive pricing + lead times + traceability notes (authorized vs local stock) in one response.</p>
            <div style={{marginTop:10}}>
              <Link to="/quality" className="btn">Trust & Quality</Link>
            </div>
          </div>
        </div>
      </section>

      <section style={{marginTop:16}}>
        <div className="section-title">
          <h2>Why Marsaan</h2>
          <span>credibility for semiconductor purchasing</span>
        </div>
        <div className="grid" style={{gridTemplateColumns:'repeat(12,1fr)'}}>
          <div className="card" style={{gridColumn:'span 4'}}>
            <h3>Trusted sourcing</h3>
            <p>RFQ first to authorized distributors, then vetted local stockists for urgent needs.</p>
          </div>
          <div className="card" style={{gridColumn:'span 4'}}>
            <h3>Traceability mindset</h3>
            <p>We capture purchase evidence, packaging photos, lot details and warranty/DOA terms per SKU.</p>
          </div>
          <div className="card" style={{gridColumn:'span 4'}}>
            <h3>BOM-to-quote workflow</h3>
            <p>Upload a BOM and receive an actionable quote with alternates and lead-time options.</p>
          </div>
        </div>
      </section>

      <section style={{marginTop:16}}>
        <div className="section-title">
          <h2>Categories</h2>
          <span>{categories.length} groups</span>
        </div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {categories.map(c => (
            <Link key={c} className="pill" to={`/catalog?category=${encodeURIComponent(c)}`}>{c}</Link>
          ))}
        </div>
        <div style={{marginTop:12}} className="small">
          Note: This MVP stores your quote basket locally in your browser. The RFQ form sends an email based on your deployment env configuration.
        </div>
      </section>
    </div>
  )
}
