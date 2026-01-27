import { Link } from 'react-router-dom'

export default function EngineeringSupport(){
  return (
    <div>
      <div className="section-title">
        <h2>Engineering Support</h2>
        <span>Talk to an engineer</span>
      </div>

      <div className="two-col">
        <div className="card">
          <h3>What we can help with</h3>
          <ul>
            <li>BOM scrub (MPN normalization, alternates)</li>
            <li>Lead-time aware alternates (authorized-first)</li>
            <li>Basic compatibility checks (voltage, package, interface)</li>
            <li>Prototype quantities + staged scaling plan</li>
          </ul>
          <div style={{display:'flex', gap:10, flexWrap:'wrap', marginTop:12}}>
            <Link className="btn primary" to="/rfq">Request engineering support</Link>
            <Link className="btn" to="/catalog">Browse parts</Link>
          </div>
        </div>

        <div className="card">
          <h3>How to request</h3>
          <p className="small">Use the RFQ form and add notes like:</p>
          <div className="soft">
            <div className="small"><b>Example notes</b></div>
            <ul className="small">
              <li>“Alternates allowed for LDO regulator, prefer same footprint.”</li>
              <li>“Need 10 pcs now + 200 pcs in 6 weeks. Suggest staged buys.”</li>
              <li>“Prefer authorized sources only.”</li>
            </ul>
          </div>
          <div className="small" style={{marginTop:10}}>Typical turnaround depends on BOM size and criticality. For enterprise buyers, we can align to your procurement SLA.</div>
        </div>
      </div>
    </div>
  )
}
