import { Link } from 'react-router-dom'

export default function Shipping(){
  return (
    <div>
      <div className="section-title">
        <h2>Shipping & Lead Times</h2>
        <span>Procurement expectations, simplified</span>
      </div>

      <div className="grid" style={{gridTemplateColumns:'repeat(12,1fr)'}}>
        <div className="card" style={{gridColumn:'span 7'}}>
          <h3>Lead-time buckets</h3>
          <ul>
            <li><b>Local stock (India):</b> 0–3 days (Tier-2 stockists / our inventory)</li>
            <li><b>Authorized / regional hubs:</b> 5–14 days (distributor stock + domestic shipping)</li>
            <li><b>Import / factory:</b> 2–8 weeks (MOQs, production, freight, customs)</li>
          </ul>
          <div className="small">Exact lead time depends on SKU, quantity, and required documentation (CoC/CoO).</div>
        </div>
        <div className="card" style={{gridColumn:'span 5'}}>
          <h3>How to request</h3>
          <p>Upload your BOM and include: quantity, needed-by date, shipping pincode/country, alternates allowed.</p>
          <div className="cta-row" style={{marginTop:10}}>
            <Link to="/rfq" className="btn primary">Upload BOM</Link>
            <Link to="/returns" className="btn">Returns / RMA</Link>
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop:14}}>
        <h3>Shipping options</h3>
        <div className="small">We can quote Ex-Works, FCA, or Delivered (DAP/DDP where available) depending on destination and compliance needs.</div>
        <div style={{marginTop:10, display:'flex', gap:8, flexWrap:'wrap'}}>
          <span className="pill">Courier</span>
          <span className="pill">Air freight</span>
          <span className="pill">Insured shipment</span>
          <span className="pill">Tracking + delivery confirmation</span>
        </div>
      </div>
    </div>
  )
}
