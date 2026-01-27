import { Link } from 'react-router-dom'

export default function ContractPricing(){
  return (
    <div>
      <div className="section-title">
        <h2>Contract Pricing</h2>
        <span>Enterprise scale (coming online as we grow)</span>
      </div>

      <div className="card">
        <p className="lead">For large OEMs and repeat programs, we can align pricing to annual volume commitments, blanket POs and SLA-based lead times.</p>
        <div className="grid" style={{gridTemplateColumns:'repeat(12,1fr)'}}>
          <div className="card" style={{gridColumn:'span 6'}}>
            <h3>What you get</h3>
            <ul>
              <li>Volume price tiers + fixed validity window</li>
              <li>Approved alternates policy</li>
              <li>SLA for RFQ turnaround</li>
              <li>Documentation pack for audit</li>
            </ul>
          </div>
          <div className="card" style={{gridColumn:'span 6'}}>
            <h3>Next step</h3>
            <p className="small">Submit an RFQ with “Contract pricing” in notes and attach your forecast/AVL.</p>
            <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:10}}>
              <Link className="btn primary" to="/rfq">Request contract pricing</Link>
              <Link className="btn" to="/vendor-documents">Vendor documents</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
