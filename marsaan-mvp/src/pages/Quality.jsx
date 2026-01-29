import { Link } from 'react-router-dom'

export default function Quality(){
  return (
    <div>
      <div className="page-head">
        <div>
          <div className="small">Trust documentation</div>
          <h1 style={{margin:'6px 0 0'}}>Quality & Anti‑Counterfeit Practices</h1>
          <div className="small" style={{marginTop:10, maxWidth:900}}>
            This is a founder-friendly policy page designed to build procurement confidence. Keep it honest: avoid claiming
            certifications you don’t have; instead document your process and evidence you can share per shipment.
          </div>
        </div>
        <div className="page-head-actions">
          <Link className="btn" to="/traceability">Traceability</Link>
          <Link className="btn primary" to="/rfq">Upload BOM</Link>
        </div>
      </div>

      <div className="doc-shell">
        <aside className="doc-nav">
          <div className="doc-nav-title">On this page</div>
          <a className="doc-link" href="#principles">Principles</a>
          <a className="doc-link" href="#supply-path">Supply path</a>
          <a className="doc-link" href="#inspection">Inbound inspection</a>
          <a className="doc-link" href="#esd">ESD handling</a>
          <a className="doc-link" href="#vendor">Vendor onboarding</a>
          <a className="doc-link" href="#returns">DOA / Returns</a>
          <a className="doc-link" href="#evidence">Evidence we can share</a>
        </aside>

        <main className="doc-content">
          <section id="principles" className="doc-section">
            <h2>Principles</h2>
            <div className="callout">
              <ul style={{margin:'0 0 0 18px'}}>
                <li><b>Authorized-first</b>: default sourcing route prioritizes franchised / authorized channels.</li>
                <li><b>Vetted local stock</b>: used for urgency, but clearly labelled with evidence notes.</li>
                <li><b>Traceability-by-default</b>: we capture purchase + packaging + shipping evidence per order.</li>
                <li><b>Customer clarity</b>: no vague claims—policies are explicit and written in plain language.</li>
              </ul>
            </div>
          </section>

          <section id="supply-path" className="doc-section">
            <h2>Supply path we follow</h2>
            <div className="doc-grid">
              <div className="card card-soft">
                <div className="pill pill-accent" style={{marginBottom:10}}>Tier 1</div>
                <h3 style={{margin:'0 0 6px'}}>Authorized / Franchised distributors</h3>
                <p>Best for compliance, reliability, and enterprise procurement.</p>
              </div>
              <div className="card card-soft">
                <div className="pill" style={{marginBottom:10}}>Tier 2</div>
                <h3 style={{margin:'0 0 6px'}}>Vetted local stockists</h3>
                <p>Best for Bangalore fast delivery when lead-time is critical.</p>
              </div>
              <div className="card card-soft">
                <div className="pill" style={{marginBottom:10}}>Tier 3</div>
                <h3 style={{margin:'0 0 6px'}}>Special sourcing (on request)</h3>
                <p>Hard-to-find parts, alternates, end-of-life mitigation.</p>
              </div>
            </div>
          </section>

          <section id="inspection" className="doc-section">
            <h2>Inbound inspection checklist</h2>
            <div className="card card-soft">
              <ul style={{margin:'0 0 0 18px'}}>
                <li>Packaging & label checks (sealed condition, label consistency, date codes where applicable).</li>
                <li>Photo evidence captured on receipt (outer box, inner packaging, part labels).</li>
                <li>Quantity verification and visible damage screening.</li>
                <li>Quarantine rules for anomalies (hold stock until resolved).</li>
              </ul>
              <div className="small" style={{marginTop:10}}>
                For higher-risk lines (ICs, memory, power ICs), we can add optional sampling/testing as we scale.
              </div>
            </div>
          </section>

          <section id="esd" className="doc-section">
            <h2>ESD handling & packing</h2>
            <div className="card card-soft">
              <ul style={{margin:'0 0 0 18px'}}>
                <li>ESD-safe storage for ICs/modules and sensitive components.</li>
                <li>ESD-safe packing material during dispatch to reduce handling damage.</li>
                <li>Clear labelling for fragile items and temperature/moisture-sensitive packages where applicable.</li>
              </ul>
            </div>
          </section>

          <section id="vendor" className="doc-section">
            <h2>Vendor onboarding & controls</h2>
            <div className="card card-soft">
              <ul style={{margin:'0 0 0 18px'}}>
                <li>Supplier profile: GST/registration details, business address, warranty/DOA terms.</li>
                <li>RFQ capture: MOQ, lead time, incoterms, and packaging format.</li>
                <li>First-order caution: smaller quantity + extra evidence capture.</li>
                <li>Ongoing performance: delivery accuracy, defect rates, response times.</li>
              </ul>
            </div>
          </section>

          <section id="returns" className="doc-section">
            <h2>DOA / Returns policy (summary)</h2>
            <div className="card card-soft">
              <ul style={{margin:'0 0 0 18px'}}>
                <li>We align return handling to supplier warranty terms and clearly communicate timelines.</li>
                <li>DOA claims require basic evidence (photos + issue description) to speed up approvals.</li>
                <li>We’ll avoid ambiguous promises—each SKU may have different replacement options.</li>
              </ul>
              <div style={{marginTop:10}}>
                <Link className="btn" to="/returns">Read full Returns page</Link>
              </div>
            </div>
          </section>

          <section id="evidence" className="doc-section">
            <h2>Evidence we can share per shipment</h2>
            <div className="doc-grid">
              <div className="card card-soft">
                <h3 style={{margin:'0 0 6px'}}>Purchase proof</h3>
                <p>Invoice/PO references and supplier details (as allowed by contract).</p>
              </div>
              <div className="card card-soft">
                <h3 style={{margin:'0 0 6px'}}>Packaging evidence</h3>
                <p>Photos of outer box, labels, and inner packaging to support authenticity.</p>
              </div>
              <div className="card card-soft">
                <h3 style={{margin:'0 0 6px'}}>Shipping evidence</h3>
                <p>Courier tracking + dispatch timestamp and packing notes.</p>
              </div>
            </div>
            <div className="small" style={{marginTop:10}}>
              As Marsaan scales, these become standardized “traceability bundles” attached to each order.
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
