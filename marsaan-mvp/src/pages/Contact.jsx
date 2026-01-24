export default function Contact(){
  return (
    <div>
      <div className="section-title">
        <h2>Contact</h2>
        <span>lead capture</span>
      </div>
      <div className="two-col">
        <div className="card">
          <h3>Business</h3>
          <p>For quotes and BOM uploads, use the RFQ page.</p>
          <div className="pill">rfq@marsaan.com</div>
          <div style={{marginTop:10}} className="pill">sales@marsaan.com</div>
          <div style={{marginTop:10}} className="pill">support@marsaan.com</div>
          <p className="small" style={{marginTop:12}}>
            Tip: Add a WhatsApp Business number and show response hours + SLA on this page.
          </p>
        </div>
        <div className="card">
          <h3>What to publish publicly</h3>
          <p>Keep supplier contacts and procurement links internal. Publish:</p>
          <ul>
            <li>Capabilities (what you can source)</li>
            <li>RFQ & BOM upload flow</li>
            <li>Quality / traceability policies</li>
            <li>Returns / warranty clarity</li>
          </ul>
          <p className="small">When ready, add: registered office address, GST details, and company registration info for additional trust.</p>
        </div>
      </div>
    </div>
  )
}
