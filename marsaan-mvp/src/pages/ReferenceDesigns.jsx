import { Link } from 'react-router-dom'

export default function ReferenceDesigns(){
  return (
    <div>
      <div className="section-title">
        <h2>Reference Designs</h2>
        <span>Templates we can source/quote against</span>
      </div>

      <div className="card">
        <p className="lead">
          This page is a placeholder for technical collateral (designs, eval stacks, known-good BOMs) that helps customers move fast.
        </p>
      </div>

      <div className="grid" style={{gridTemplateColumns:'repeat(12,1fr)'}}>
        <div className="card" style={{gridColumn:'span 6'}}>
          <h3>FPGA dev quickstart BOMs</h3>
          <p className="muted">Board + programmer + cables + recommended power + accessories.</p>
          <div style={{marginTop:12}}>
            <Link className="btn primary" to="/rfq">Request this BOM</Link>
          </div>
        </div>
        <div className="card" style={{gridColumn:'span 6'}}>
          <h3>AI edge prototype kits</h3>
          <p className="muted">Compute module + camera/sensor + storage + power + connectors.</p>
          <div style={{marginTop:12}}>
            <Link className="btn" to="/catalog">Browse parts</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
