import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { loadCart } from './QuoteCart.jsx'

function useOutsideClose(ref, onClose){
  useEffect(() => {
    function onDoc(e){
      if(!ref.current) return
      if(ref.current.contains(e.target)) return
      onClose?.()
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('touchstart', onDoc, { passive:true })
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('touchstart', onDoc)
    }
  }, [ref, onClose])
}

export default function Layout({ children }) {
  const nav = useNavigate()
  const [open, setOpen] = useState(null) // 'parts' | 'mfr' | 'dist' | 'resources' | 'company'
  const [q, setQ] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const wrapRef = useRef(null)

  useOutsideClose(wrapRef, () => setOpen(null))

  useEffect(() => {
    // best-effort cart count (localStorage)
    function refresh(){
      try{ setCartCount((loadCart() || []).length) }catch{ setCartCount(0) }
    }
    refresh()
    window.addEventListener('storage', refresh)
    return () => window.removeEventListener('storage', refresh)
  }, [])

  const parts = useMemo(() => ([
    { label:'FPGA & Dev Boards', href:'/catalog?category=FPGA%20Boards' },
    { label:'AI / Edge Modules', href:'/catalog?category=AI%20Edge%20Boards' },
    { label:'Power & Regulators', href:'/catalog?category=Power' },
    { label:'Sensors', href:'/catalog?category=Sensors' },
    { label:'Memory & Storage', href:'/catalog?category=Memory' },
    { label:'Connectivity', href:'/catalog?category=Connectivity' },
    { label:'Tools & Accessories', href:'/catalog?category=Accessories' },
  ]), [])

  function submitSearch(e){
    e.preventDefault()
    const qq = q.trim()
    nav(qq ? `/catalog?q=${encodeURIComponent(qq)}` : '/catalog')
    setOpen(null)
  }

  return (
    <>
      <header className="header" ref={wrapRef}>
        <div className="topbar">
          <div className="container topbar-inner">
            <div className="topbar-left">
              <span className="pill">B2B RFQ-first</span>
              <span className="pill">GST invoicing</span>
              <span className="pill">QC + RMA</span>
              <span className="pill">Traceability mindset</span>
            </div>
            <div className="topbar-right">
              <a className="toplink" href="mailto:rfq@marsaan.com">rfq@marsaan.com</a>
              <span className="sep">•</span>
              <a className="toplink" href="mailto:sales@marsaan.com">sales@marsaan.com</a>
            </div>
          </div>
        </div>

        <div className="nav">
          <div className="container nav-inner">
            <Link to="/" className="brand">
              <span className="brand-mark">Marsaan</span>
              <span className="brand-sub">Electronic parts • RFQ + BOM</span>
            </Link>

            <form className="mini-search" onSubmit={submitSearch} role="search">
              <input
                className="input"
                placeholder="Search parts, MPN, specs…"
                value={q}
                onChange={(e)=>setQ(e.target.value)}
              />
              <button className="btn primary" type="submit">Search</button>
            </form>

            <div className="nav-actions">
              <NavLink className="navlink" to="/rfq">Get a Quote</NavLink>
              <NavLink className="navlink" to="/contact">Contact Sales</NavLink>
              <NavLink className="navlink" to="/rfq">
                Quote List <span className="count">{cartCount}</span>
              </NavLink>
            </div>
          </div>
        </div>

        <div className="subnav">
          <div className="container subnav-inner">
            <button className={open==='parts' ? 'subnav-btn active' : 'subnav-btn'} onClick={()=>setOpen(open==='parts'?null:'parts')}>Electronic Parts</button>
            <button className={open==='mfr' ? 'subnav-btn active' : 'subnav-btn'} onClick={()=>setOpen(open==='mfr'?null:'mfr')}>Manufacturers</button>
            <button className={open==='dist' ? 'subnav-btn active' : 'subnav-btn'} onClick={()=>setOpen(open==='dist'?null:'dist')}>Distributors</button>
            <button className={open==='resources' ? 'subnav-btn active' : 'subnav-btn'} onClick={()=>setOpen(open==='resources'?null:'resources')}>Resources</button>
            <button className={open==='company' ? 'subnav-btn active' : 'subnav-btn'} onClick={()=>setOpen(open==='company'?null:'company')}>Company</button>
          </div>
        </div>

        {open ? (
          <div className="dropdown" role="menu">
            {open === 'parts' && (
              <div className="dropdown-grid">
                <div>
                  <div className="dropdown-title">Browse Electronic Parts</div>
                  <div className="dropdown-links">
                    {parts.map(x => <Link key={x.label} to={x.href} onClick={()=>setOpen(null)}>{x.label}</Link>)}
                  </div>
                  <div style={{marginTop:12, display:'flex', gap:10, flexWrap:'wrap'}}>
                    <Link className="btn" to="/catalog" onClick={()=>setOpen(null)}>Browse all</Link>
                    <Link className="btn primary" to="/rfq" onClick={()=>setOpen(null)}>Upload BOM</Link>
                  </div>
                </div>
                <div className="dropdown-card">
                  <div className="dropdown-title">Procurement-ready</div>
                  <div className="small">RFQ-first flow, lead times, alternates and traceability notes. Ideal for startups, OEMs and universities.</div>
                  <div style={{marginTop:10, display:'flex', gap:8, flexWrap:'wrap'}}>
                    <span className="pill">Authorized-first routing</span>
                    <span className="pill">GST invoice</span>
                    <span className="pill">QC/RMA policy</span>
                  </div>
                </div>
              </div>
            )}

            {open === 'mfr' && (
              <div className="dropdown-grid">
                <div>
                  <div className="dropdown-title">Manufacturers</div>
                  <div className="small">Browse a directory and request sourcing for a specific manufacturer.</div>
                  <div style={{marginTop:12, display:'flex', gap:10, flexWrap:'wrap'}}>
                    <Link className="btn primary" to="/manufacturers" onClick={()=>setOpen(null)}>Manufacturer Directory</Link>
                    <Link className="btn" to="/rfq" onClick={()=>setOpen(null)}>Request sourcing</Link>
                  </div>
                </div>
                <div className="dropdown-card">
                  <div className="dropdown-title">Tip</div>
                  <div className="small">For large buyers: share your AVL (approved vendor list) and we’ll map RFQ routing to authorized channels first.</div>
                </div>
              </div>
            )}

            {open === 'dist' && (
              <div className="dropdown-grid">
                <div>
                  <div className="dropdown-title">Distributors</div>
                  <div className="small">Authorized distributors, India stockists, and global sourcing network overview.</div>
                  <div style={{marginTop:12, display:'flex', gap:10, flexWrap:'wrap'}}>
                    <Link className="btn primary" to="/distributors" onClick={()=>setOpen(null)}>Distributor Network</Link>
                    <Link className="btn" to="/sourcing" onClick={()=>setOpen(null)}>Sourcing approach</Link>
                  </div>
                </div>
                <div className="dropdown-card">
                  <div className="dropdown-title">Counterfeit risk control</div>
                  <div className="small">We prioritize authorized channels and capture evidence (packaging photos, lot details, warranty/DOA terms) per SKU.</div>
                </div>
              </div>
            )}

            {open === 'resources' && (
              <div className="dropdown-grid">
                <div>
                  <div className="dropdown-title">Resources</div>
                  <div className="dropdown-links">
                    <Link to="/reference-designs" onClick={()=>setOpen(null)}>Reference Designs</Link>
                    <Link to="/application-notes" onClick={()=>setOpen(null)}>Application Notes</Link>
                    <Link to="/engineering-support" onClick={()=>setOpen(null)}>Engineering Support</Link>
                  </div>
                </div>
                <div className="dropdown-card">
                  <div className="dropdown-title">Talk to an engineer</div>
                  <div className="small">Need alternates, BOM optimization, or quick compatibility checks? Use the RFQ form and select “Engineering support”.</div>
                  <div style={{marginTop:12}}>
                    <Link className="btn primary" to="/engineering-support" onClick={()=>setOpen(null)}>Get support</Link>
                  </div>
                </div>
              </div>
            )}

            {open === 'company' && (
              <div className="dropdown-grid">
                <div>
                  <div className="dropdown-title">Company</div>
                  <div className="dropdown-links">
                    <Link to="/quality" onClick={()=>setOpen(null)}>Quality & Authenticity</Link>
                    <Link to="/compliance" onClick={()=>setOpen(null)}>Compliance</Link>
                    <Link to="/shipping" onClick={()=>setOpen(null)}>Shipping & Lead Times</Link>
                    <Link to="/returns" onClick={()=>setOpen(null)}>Returns / RMA</Link>
                    <Link to="/contact" onClick={()=>setOpen(null)}>Contact Sales</Link>
                    <Link to="/vendor-documents" onClick={()=>setOpen(null)}>Vendor Documents</Link>
                  </div>
                </div>
                <div className="dropdown-card">
                  <div className="dropdown-title">Enterprise readiness</div>
                  <div className="small">Contract pricing, onboarding, RFQ tracking, and a customer portal are available as we scale with you.</div>
                  <div style={{marginTop:12, display:'flex', gap:10, flexWrap:'wrap'}}>
                    <Link className="btn" to="/contract-pricing" onClick={()=>setOpen(null)}>Contract Pricing</Link>
                    <Link className="btn" to="/approved-vendor" onClick={()=>setOpen(null)}>Approved Vendor</Link>
                    <Link className="btn" to="/track-rfq" onClick={()=>setOpen(null)}>Track RFQ</Link>
                    <Link className="btn primary" to="/portal" onClick={()=>setOpen(null)}>Customer Portal</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </header>

      <main className="container">{children}</main>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div><b>Marsaan.com</b> — Electronic Parts Catalog + RFQ/BOM</div>
              <div className="small">B2B-first: procurement-friendly navigation, table catalog view, RFQ routing, and credibility pages.</div>
            </div>
            <div>
              <div className="small"><b>Sales:</b> sales@marsaan.com</div>
              <div className="small"><b>RFQ:</b> rfq@marsaan.com</div>
              <div className="small"><b>Support:</b> support@marsaan.com</div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
