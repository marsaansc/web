import { Link } from 'react-router-dom'

export default function Distributors(){
  return (
    <div>
      <div className="section-title">
        <h2>Distributors</h2>
        <span>Authorized-first, then vetted local stock</span>
      </div>

      <div className="grid" style={{gridTemplateColumns:'repeat(12,1fr)'}}>
        <div className="card" style={{gridColumn:'span 7'}}>
          <h3>How Marsaan routes sourcing</h3>
          <div className="small">Large customers care about counterfeit risk and traceability. We default to authorized channels first.</div>

          <div style={{marginTop:12}}>
            <div className="pill" style={{marginBottom:10}}>Tier 1 — Authorized / Franchised</div>
            <ul>
              <li>Lowest counterfeit risk</li>
              <li>Better documentation + lot traceability</li>
              <li>Best for OEMs and long-term supply</li>
            </ul>
          </div>

          <div style={{marginTop:12}}>
            <div className="pill" style={{marginBottom:10}}>Tier 2 — India stockists (GST invoice)</div>
            <ul>
              <li>Fast delivery for urgent needs</li>
              <li>Smaller quantities may be available</li>
              <li>We still request documentation where possible</li>
            </ul>
          </div>

          <div style={{marginTop:12}}>
            <div className="pill" style={{marginBottom:10}}>Local — Accessories / adapters</div>
            <ul>
              <li>SP Road / Peenya for cables, adapters, tools</li>
              <li>Useful for rapid prototyping support</li>
            </ul>
          </div>

          <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:14}}>
            <Link className="btn primary" to="/rfq">Request distributor quote</Link>
            <Link className="btn" to="/quality">Quality & authenticity</Link>
            <Link className="btn" to="/traceability">Traceability</Link>
          </div>
        </div>

        <div className="card" style={{gridColumn:'span 5'}}>
          <h3>Need a specific distributor?</h3>
          <div className="small">Share your approved vendor list (AVL) or preferred sources. We’ll route the RFQ accordingly.</div>
          <div style={{marginTop:12}}>
            <div className="pill">Procurement note</div>
            <div className="small" style={{marginTop:8}}>
              Add in RFQ notes: Incoterms, target lead time, alternates allowed, and required compliance (RoHS/REACH/BIS).
            </div>
          </div>
          <div style={{marginTop:14}}>
            <Link className="btn primary" to="/contact">Contact Sales</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
