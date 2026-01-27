import { Link } from 'react-router-dom'

export default function Portal(){
  return (
    <div>
      <div className="section-title">
        <h2>Customer Portal</h2>
        <span>Saved BOMs, quotes, repeat orders (roadmap)</span>
      </div>

      <div className="grid" style={{gridTemplateColumns:'repeat(12,1fr)'}}>
        <div className="card" style={{gridColumn:'span 7'}}>
          <p className="lead">
            This portal will let repeat B2B customers save BOMs, request quotes in one click, and track quote status.
            It’s shown here as a roadmap page so large customers know Marsaan is building enterprise workflows.
          </p>
          <div className="grid" style={{gridTemplateColumns:'repeat(12,1fr)'}}>
            <div className="kpi" style={{gridColumn:'span 6'}}>
              <div className="n">Saved BOMs</div>
              <div className="l">Upload once, reuse forever</div>
            </div>
            <div className="kpi" style={{gridColumn:'span 6'}}>
              <div className="n">Quote status</div>
              <div className="l">SLA + approvals + history</div>
            </div>
            <div className="kpi" style={{gridColumn:'span 6'}}>
              <div className="n">Contract pricing</div>
              <div className="l">Tiered pricing by volumes</div>
            </div>
            <div className="kpi" style={{gridColumn:'span 6'}}>
              <div className="n">Reorder</div>
              <div className="l">Repeat orders from previous quotes</div>
            </div>
          </div>
        </div>

        <div className="card" style={{gridColumn:'span 5'}}>
          <h3>Ready now</h3>
          <p className="muted">Until the portal is live, use the RFQ/BOM upload for fast procurement.</p>
          <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
            <Link className="btn primary" to="/rfq">Upload BOM</Link>
            <Link className="btn" to="/contract-pricing">Contract pricing</Link>
            <Link className="btn" to="/track-rfq">Track RFQ</Link>
          </div>
          <div className="small" style={{marginTop:10}}>Want this faster? Tell us your workflow (SAP/Oracle/Email) and we’ll prioritize integrations.</div>
        </div>
      </div>
    </div>
  )
}
