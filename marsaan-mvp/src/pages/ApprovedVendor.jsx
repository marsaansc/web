import { Link } from 'react-router-dom'

export default function ApprovedVendor(){
  return (
    <div>
      <div className="section-title">
        <h2>Approved Vendor / Onboarding</h2>
        <span>Enterprise readiness</span>
      </div>

      <div className="two-col">
        <div className="card">
          <h3>For procurement teams</h3>
          <ul>
            <li>Supplier profile (legal name, address, GST)</li>
            <li>Bank details and remittance info</li>
            <li>Standard terms (DOA/RMA, lead times, packaging)</li>
            <li>Compliance declarations (RoHS/REACH)</li>
          </ul>
          <div style={{marginTop:12, display:'flex', gap:10, flexWrap:'wrap'}}>
            <Link className="btn primary" to="/contact">Start onboarding</Link>
            <Link className="btn" to="/vendor-documents">Vendor documents</Link>
          </div>
        </div>
        <div className="card">
          <h3>For engineering teams</h3>
          <ul>
            <li>BOM review + alternates</li>
            <li>Lifecycle checks (NRND/EOL)</li>
            <li>Package compatibility checks</li>
            <li>Lead-time risk mitigation</li>
          </ul>
          <div style={{marginTop:12}}>
            <Link className="btn" to="/engineering-support">Talk to an Engineer</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
