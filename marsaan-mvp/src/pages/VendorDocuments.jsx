export default function VendorDocuments(){
  return (
    <div>
      <div className="section-title">
        <h2>Vendor Documents</h2>
        <span>For procurement onboarding</span>
      </div>

      <div className="card">
        <p className="lead">This page is intentionally designed for enterprise procurement teams. As you finalize your registrations, you can upload and share controlled documents securely.</p>
      </div>

      <div className="grid" style={{gridTemplateColumns:'repeat(12,1fr)'}}>
        <div className="card" style={{gridColumn:'span 6'}}>
          <h3>Typical documents requested</h3>
          <ul>
            <li>GST certificate, MSME/Udyam, PAN</li>
            <li>Bank details (cancelled cheque), billing address</li>
            <li>Company profile, capability statement</li>
            <li>Quality statement, RMA policy, traceability process</li>
            <li>RoHS/REACH declarations (where applicable)</li>
          </ul>
        </div>
        <div className="card" style={{gridColumn:'span 6'}}>
          <h3>Controlled sharing</h3>
          <p className="small">For security, share these documents only after receiving a verified procurement email. We can also host documents in a private portal for approved customers.</p>
          <div style={{marginTop:12}}>
            <a className="btn primary" href="mailto:sales@marsaan.com?subject=Vendor%20Documents%20Request">Request documents</a>
          </div>
        </div>
      </div>
    </div>
  )
}
