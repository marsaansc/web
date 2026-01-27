import { Link } from 'react-router-dom'

export default function TrackRFQ(){
  return (
    <div>
      <div className="section-title">
        <h2>Track RFQ</h2>
        <span>Enterprise feature (roadmap)</span>
      </div>

      <div className="card">
        <p className="lead">We can add an RFQ tracking workflow (status, SLA, line-level messages) once you want to onboard repeat customers.</p>

        <div className="grid" style={{gridTemplateColumns:'repeat(12,1fr)'}}>
          <div className="card" style={{gridColumn:'span 6'}}>
            <h3>What tracking includes</h3>
            <ul>
              <li>RFQ ID + status (received → quoting → quoted → PO)</li>
              <li>Line-level alternates and lead-time updates</li>
              <li>Attachment history (BOM versions)</li>
              <li>Email + portal notifications</li>
            </ul>
          </div>
          <div className="card" style={{gridColumn:'span 6'}}>
            <h3>For now</h3>
            <p>Use the RFQ form; we’ll confirm by email. If you want tracking, tell us your preferred system (Zoho, Odoo, HubSpot) and we’ll wire it.</p>
            <div style={{display:'flex', gap:10, flexWrap:'wrap', marginTop:10}}>
              <Link className="btn primary" to="/rfq">Submit RFQ</Link>
              <Link className="btn" to="/contact">Talk to Sales</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
