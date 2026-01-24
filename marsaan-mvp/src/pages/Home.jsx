import { Link } from 'react-router-dom'
import data from '../data/products.json'

export default function Home(){
  const count = data?.count || 0
  const categories = Array.from(new Set((data.products||[]).map(p=>p.category))).sort()

  return (
    <div>
      <section className="hero">
        <div className="two-col">
          <div>
            <h1>Semiconductor & FPGA supply for builders — fast RFQs, trusted sourcing.</h1>
            <p>
              MARSAAN is building a supply chain ecosystem for FPGA/AI boards, sensors, power ICs and tools.
              Start with our curated catalog, upload your BOM, and get a quote workflow that works for startups, OEMs and universities.
            </p>
            <div className="cta-row">
              <Link to="/catalog" className="btn primary">Browse Catalog</Link>
              <Link to="/rfq" className="btn">Request Quote / BOM Upload</Link>
              <Link to="/quality" className="btn">Trust & Quality</Link>
            </div>

            <div className="kpis grid" style={{gridTemplateColumns:'repeat(12,1fr)'}}>
              <div className="kpi" style={{gridColumn:'span 4'}}>
                <div className="n">{count}</div>
                <div className="l">High-priority SKUs loaded</div>
              </div>
              <div className="kpi" style={{gridColumn:'span 4'}}>
                <div className="n">B2B</div>
                <div className="l">RFQ-first purchasing model</div>
              </div>
              <div className="kpi" style={{gridColumn:'span 4'}}>
                <div className="n">Tiered</div>
                <div className="l">Authorized + local stock options</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Quick start</h3>
            <p>1) Search by category → add items to your quote basket</p>
            <p>2) Upload BOM (CSV/XLSX) → specify quantity & needed-by date</p>
            <p>3) Get quote + alternatives based on lead time</p>

            <div className="section-title" style={{marginTop:14}}>
              <h2>Categories</h2>
              <span>{categories.length} groups</span>
            </div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {categories.map(c => (
                <Link key={c} className="pill" to={`/catalog?category=${encodeURIComponent(c)}`}>{c}</Link>
              ))}
            </div>

            <div style={{marginTop:14}} className="small">
              Note: This MVP template stores quote basket locally in your browser. Deploy with a real form endpoint to receive RFQs.
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
    </div>
  )
}
