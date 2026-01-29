import { Link } from 'react-router-dom'

export default function Traceability(){
  return (
    <div>
      <div className="page-head">
        <div>
          <div className="small">Trust documentation</div>
          <h1 style={{margin:'6px 0 0'}}>Traceability</h1>
          <div className="small" style={{marginTop:10, maxWidth:900}}>
            Enterprise buyers don’t just want parts—they want confidence. Marsaan’s traceability approach is designed to
            keep evidence centralized per SKU/order so RMAs and audits are faster and cleaner.
          </div>
        </div>
        <div className="page-head-actions">
          <Link className="btn" to="/quality">Quality</Link>
          <Link className="btn primary" to="/rfq">Upload BOM</Link>
        </div>
      </div>

      <div className="doc-shell">
        <aside className="doc-nav">
          <div className="doc-nav-title">On this page</div>
          <a className="doc-link" href="#what">What we track</a>
          <a className="doc-link" href="#bundle">Traceability bundle</a>
          <a className="doc-link" href="#labels">Authorized vs local labelling</a>
          <a className="doc-link" href="#retention">Retention</a>
          <a className="doc-link" href="#rma">RMA speed</a>
        </aside>

        <main className="doc-content">
          <section id="what" className="doc-section">
            <h2>What we track (per order / SKU)</h2>
            <div className="doc-grid">
              <div className="card card-soft">
                <h3 style={{margin:'0 0 6px'}}>Source & route</h3>
                <p>Supplier name, channel tier (authorized vs local), purchase date, and order reference.</p>
              </div>
              <div className="card card-soft">
                <h3 style={{margin:'0 0 6px'}}>Lot / serial (if available)</h3>
                <p>Lot code, date code, serials, and packaging identifiers where provided.</p>
              </div>
              <div className="card card-soft">
                <h3 style={{margin:'0 0 6px'}}>Handling notes</h3>
                <p>ESD precautions, repacking notes, and condition observations at receipt.</p>
              </div>
            </div>
          </section>

          <section id="bundle" className="doc-section">
            <h2>What’s inside a “traceability bundle”</h2>
            <div className="callout">
              <ul style={{margin:'0 0 0 18px'}}>
                <li><b>Purchase proof</b>: invoice/PO references (as allowed).</li>
                <li><b>Packaging photos</b>: outer box + inner pack + labels.</li>
                <li><b>Shipping proof</b>: courier tracking + dispatch timestamp.</li>
                <li><b>Warranty / DOA terms</b>: captured per SKU if different.</li>
                <li><b>Notes</b>: alternates used, substitutions, and approvals.</li>
              </ul>
            </div>
            <div className="small" style={{marginTop:10}}>
              This bundle is what procurement teams ask for when they do vendor onboarding or dispute resolution.
            </div>
          </section>

          <section id="labels" className="doc-section">
            <h2>Authorized vs local stock labelling</h2>
            <div className="card card-soft">
              <p>
                Marsaan responses differentiate the sourcing path so you can make a tradeoff between compliance and speed.
                Your quote can include two options per line item:
              </p>
              <div className="doc-grid" style={{marginTop:10}}>
                <div className="card card-soft">
                  <div className="pill pill-accent" style={{marginBottom:10}}>Option A</div>
                  <h3 style={{margin:'0 0 6px'}}>Authorized / franchised</h3>
                  <p>Higher confidence + clean paperwork. Best for OEM/enterprise procurement.</p>
                </div>
                <div className="card card-soft">
                  <div className="pill" style={{marginBottom:10}}>Option B</div>
                  <h3 style={{margin:'0 0 6px'}}>Vetted local stock</h3>
                  <p>Faster delivery. Evidence provided + clear DOA/warranty terms.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="retention" className="doc-section">
            <h2>Retention & privacy</h2>
            <div className="card card-soft">
              <ul style={{margin:'0 0 0 18px'}}>
                <li>We keep documentation for a defined period (typically 12–24 months) unless law/contract requires longer.</li>
                <li>We separate “research links” and internal notes from customer-facing evidence bundles.</li>
                <li>Supplier data may be redacted depending on contracts while still preserving authenticity evidence.</li>
              </ul>
            </div>
          </section>

          <section id="rma" className="doc-section">
            <h2>Why this speeds up RMAs</h2>
            <div className="card card-soft">
              <p>
                When a part fails, most delays happen because evidence is scattered across emails, WhatsApp threads, and
                courier screenshots. Centralizing evidence makes decisions faster—especially for DOA approvals.
              </p>
              <div style={{marginTop:10, display:'flex', gap:10, flexWrap:'wrap'}}>
                <Link className="btn" to="/returns">Returns / DOA</Link>
                <Link className="btn primary" to="/rfq">Request a quote</Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
