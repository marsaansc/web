import { Link, NavLink } from 'react-router-dom'

export default function Layout({ children }) {
  return (
    <>
      <header className="nav">
        <div className="container nav-inner">
          <Link to="/" className="brand">
            <span className="brand-word">Marsaan</span>
            <span className="badge">Semiconductor Supply — MVP</span>
          </Link>
          <nav className="nav-links">
            <NavLink to="/catalog">Catalog</NavLink>
            <NavLink to="/rfq">RFQ / BOM Upload</NavLink>
            <NavLink to="/quality">Quality</NavLink>
            <NavLink to="/sourcing">Sourcing</NavLink>
            <NavLink to="/traceability">Traceability</NavLink>
            <NavLink to="/returns">Returns</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </nav>
        </div>
      </header>

      <main className="container">{children}</main>

      <footer className="footer">
        <div className="container">
          <div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
            <div>
              <div><b>Marsaan.com</b> — Catalog + RFQ + BOM Upload</div>
              <div className="small">This is a working MVP template. Configure forms to email submissions to your official inbox.</div>
            </div>
            <div className="small">
              Suggested emails: <b>rfq@marsaan.com</b>, <b>sales@marsaan.com</b>, <b>support@marsaan.com</b>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
