import { Link } from 'react-router-dom'

export default function Compliance(){
  return (
    <div>
      <div className="section-title">
        <h2>Compliance</h2>
        <span>RoHS / REACH / BIS (as applicable)</span>
      </div>

      <div className="grid" style={{gridTemplateColumns:'repeat(12,1fr)'}}>
        <div className="card" style={{gridColumn:'span 7'}}>
          <h3>What we provide</h3>
          <ul>
            <li><b>RoHS / REACH</b> documentation when available from manufacturer/distributor.</li>
            <li><b>Country-of-origin</b> and invoice trail for procurement records.</li>
            <li><b>HSN / GST</b> invoice for India shipments.</li>
            <li><b>Export documentation</b> guidance for international customers (on request).</li>
          </ul>
          <div className="small">Note: Requirements vary by product category and end-use. Share your compliance checklist in RFQ notes for fastest handling.</div>
        </div>
        <div className="card" style={{gridColumn:'span 5'}}>
          <h3>Need a compliance pack?</h3>
          <p className="small">Upload your BOM and mention: RoHS/REACH, test reports, CoC, CoO, and labeling requirements.</p>
          <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:12}}>
            <Link className="btn primary" to="/rfq">Upload BOM</Link>
            <Link className="btn" to="/contact">Contact Sales</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
