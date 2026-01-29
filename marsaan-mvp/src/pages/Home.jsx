import { Link, useNavigate } from 'react-router-dom'
import data from '../data/products.json'

function ChipIllustration(){
  // Lightweight inline SVG so we don't depend on external assets (keeps build stable).
  return (
    <svg
      className="home-hero-illustration"
      viewBox="0 0 720 520"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="g1" x1="80" y1="40" x2="640" y2="480" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EAF4FF" />
          <stop offset="1" stopColor="#CFE6FF" />
        </linearGradient>
        <linearGradient id="g2" x1="120" y1="120" x2="600" y2="430" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" stopOpacity="0.22" />
          <stop offset="1" stopColor="#22C55E" stopOpacity="0.10" />
        </linearGradient>
        <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      {/* soft background blob */}
      <path
        d="M560 86c92 62 118 192 70 290-46 93-154 145-265 140-105-5-221-67-264-164-46-102 5-214 78-284 76-72 194-103 281-72 38 14 67 41 100 90Z"
        fill="url(#g2)"
        filter="url(#blur)"
      />

      {/* network lines */}
      <g opacity="0.55" stroke="#2563EB" strokeWidth="2">
        <path d="M70 330H250" />
        <path d="M160 120H360" />
        <path d="M410 110H650" />
        <path d="M470 260H690" />
        <path d="M310 420H600" />
      </g>
      <g opacity="0.7" fill="#2563EB">
        {[{x:250,y:330},{x:160,y:120},{x:360,y:120},{x:410,y:110},{x:470,y:260},{x:600,y:420}].map((p,i)=>(
          <circle key={i} cx={p.x} cy={p.y} r="6" />
        ))}
      </g>

      {/* chip */}
      <rect x="250" y="150" width="240" height="240" rx="28" fill="url(#g1)" />
      <rect x="278" y="178" width="184" height="184" rx="22" fill="#FFFFFF" opacity="0.88" />
      <rect x="302" y="202" width="136" height="136" rx="18" fill="#2563EB" opacity="0.10" />

      {/* pins */}
      <g fill="#B9D6FF">
        {Array.from({length:10}).map((_,i)=> (
          <rect key={`t${i}`} x={278 + i*18} y="134" width="10" height="22" rx="4" />
        ))}
        {Array.from({length:10}).map((_,i)=> (
          <rect key={`b${i}`} x={278 + i*18} y="384" width="10" height="22" rx="4" />
        ))}
        {Array.from({length:10}).map((_,i)=> (
          <rect key={`l${i}`} x="228" y={178 + i*18} width="22" height="10" rx="4" />
        ))}
        {Array.from({length:10}).map((_,i)=> (
          <rect key={`r${i}`} x="490" y={178 + i*18} width="22" height="10" rx="4" />
        ))}
      </g>
    </svg>
  )
}

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
      {/* FULL-BLEED, LIGHT HERO */}
      <section className="fullbleed home-hero">
        <div className="container home-hero-inner">
          <div className="home-hero-copy">
            <div className="pill pill-accent">Semiconductor Supply • Authorized + Local • Traceability-first</div>
            <h1 className="home-hero-title">Semiconductor Supply. Simplified.</h1>
            <p className="home-hero-sub">
              Authorized distributors. Vetted local stock. Full traceability. Faster RFQs — with zero compromise.
            </p>

            <form className="home-hero-search" onSubmit={onSearch}>
              <div className="home-search-box">
                <span className="home-search-icon" aria-hidden="true">⌕</span>
                <input
                  className="home-search-input"
                  name="q"
                  placeholder="Search by part number, tech specs, or keywords"
                  defaultValue=""
                  autoComplete="off"
                />
                <button className="btn primary" type="submit">Search parts</button>
                <Link className="btn" to="/rfq">Upload BOM</Link>
              </div>

              <div className="home-search-hint">
                Try:&nbsp;
                <button
                  type="button"
                  className="linklike"
                  onClick={()=>navigate(`/catalog?q=${encodeURIComponent(example)}`)}
                >
                  {example}
                </button>
                <span className="dot">•</span>
                <Link className="linklike" to="/catalog">Browse catalog</Link>
              </div>
            </form>

            <div className="home-trustline">
              Serving <b>OEMs</b> • <b>Startups</b> • <b>R&amp;D Labs</b> • <b>Universities</b>
            </div>

            <div className="home-kpis">
              <div className="kpi">
                <div className="n">{count}</div>
                <div className="l">Priority SKUs loaded</div>
              </div>
              <div className="kpi">
                <div className="n">24–48h</div>
                <div className="l">Typical RFQ response</div>
              </div>
              <div className="kpi">
                <div className="n">Tiered</div>
                <div className="l">Authorized + local options</div>
              </div>
            </div>
          </div>

          <div className="home-hero-art" aria-hidden="true">
            <ChipIllustration />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="home-section" style={{marginTop:18}}>
        <div className="section-title">
          <h2>From BOM to Quote — in 3 steps</h2>
          <span>simple workflow for hardware teams</span>
        </div>

        <div className="grid" style={{gridTemplateColumns:'repeat(12,1fr)'}}>
          <div className="card home-card" style={{gridColumn:'span 4'}}>
            <div className="home-card-icon" aria-hidden="true">🔍</div>
            <h3>Find parts</h3>
            <p>Search by part number/specs or browse categories. Add items to your quote basket.</p>
            <div style={{marginTop:10}}>
              <Link to="/catalog" className="btn">Open catalog</Link>
            </div>
          </div>

          <div className="card home-card" style={{gridColumn:'span 4'}}>
            <div className="home-card-icon" aria-hidden="true">📤</div>
            <h3>Upload BOM</h3>
            <p>Share quantities, needed-by date and alternates preference. We’ll consolidate suppliers.</p>
            <div style={{marginTop:10}}>
              <Link to="/rfq" className="btn primary">RFQ / BOM Upload</Link>
            </div>
          </div>

          <div className="card home-card" style={{gridColumn:'span 4'}}>
            <div className="home-card-icon" aria-hidden="true">💬</div>
            <h3>Get quote</h3>
            <p>Receive pricing, lead times and traceability notes (authorized vs local) in one response.</p>
            <div style={{marginTop:10}}>
              <Link to="/quality" className="btn">Trust &amp; Quality</Link>
            </div>
          </div>
        </div>

        <div className="home-flowline">Authorized first → Vetted local stock → Best lead time</div>
      </section>

      {/* TRUST / DIFFERENTIATION */}
      <section className="home-section" style={{marginTop:18}}>
        <div className="section-title">
          <h2>Built for serious hardware teams</h2>
          <span>credibility for semiconductor purchasing</span>
        </div>
        <div className="grid" style={{gridTemplateColumns:'repeat(12,1fr)'}}>
          <div className="card home-card" style={{gridColumn:'span 4'}}>
            <h3>Authorized sourcing</h3>
            <p>RFQ first to authorized distributors, then vetted local stockists for urgent needs.</p>
          </div>
          <div className="card home-card" style={{gridColumn:'span 4'}}>
            <h3>Traceability mindset</h3>
            <p>We capture purchase evidence, packaging photos, lot details and warranty/DOA terms per SKU.</p>
          </div>
          <div className="card home-card" style={{gridColumn:'span 4'}}>
            <h3>Fast RFQ workflow</h3>
            <p>Upload a BOM and receive an actionable quote with alternates and lead-time options.</p>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="home-section" style={{marginTop:18}}>
        <div className="section-title">
          <h2>Explore categories</h2>
          <span>{categories.length} groups</span>
        </div>

        <div className="home-cat-grid">
          {categories.map(c => (
            <Link key={c} className="home-cat" to={`/catalog?category=${encodeURIComponent(c)}`}>
              <span className="home-cat-pill">{c}</span>
              <span className="home-cat-arrow" aria-hidden="true">→</span>
            </Link>
          ))}
        </div>

        <div style={{marginTop:12}}>
          <Link to="/catalog" className="btn">Browse full catalog</Link>
        </div>

        <div style={{marginTop:12}} className="small">
          Note: This MVP stores your quote basket locally in your browser. The RFQ form sends an email based on your deployment env configuration.
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="fullbleed home-cta" style={{marginTop:24}}>
        <div className="container home-cta-inner">
          <div>
            <h2 className="home-cta-title">Ready to source smarter?</h2>
            <div className="home-cta-sub">Upload your BOM and get a consolidated quote with lead times and traceability notes.</div>
          </div>
          <div className="cta-row">
            <Link to="/rfq" className="btn primary">Upload your BOM</Link>
            <Link to="/contact" className="btn">Contact Marsaan</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
