import { useMemo } from 'react'

export default function Returns() {
  const toc = useMemo(
    () => [
      { id: 'overview', label: 'Overview' },
      { id: 'eligibility', label: 'Eligibility' },
      { id: 'doa', label: 'DOA window' },
      { id: 'rma', label: 'RMA process' },
      { id: 'packaging', label: 'Packaging & handling' },
      { id: 'exceptions', label: 'Exceptions' },
      { id: 'warranty', label: 'Warranty alignment' },
      { id: 'sla', label: 'Response SLA' },
    ],
    []
  )

  return (
    <div className="page">
      <div className="page-head">
        <h1>Returns, DOA & Warranty</h1>
        <p className="muted">
          Enterprise-style policy designed for semiconductor distribution. Final terms can vary by SKU and supplier; your quote
          or invoice will always supersede where explicitly stated.
        </p>
      </div>

      <div className="doc-shell">
        <aside className="doc-nav">
          <div className="doc-nav-title">On this page</div>
          {toc.map((t) => (
            <a key={t.id} className="doc-link" href={`#${t.id}`}>
              {t.label}
            </a>
          ))}
        </aside>

        <main className="doc-content">
          <section id="overview" className="doc-section">
            <div className="card">
              <div className="kicker">Policy Summary</div>
              <h2 className="h2-tight">Clear, fast, and aligned to supplier terms</h2>
              <div className="doc-grid" style={{ marginTop: 12 }}>
                <div className="card card-soft">
                  <h3 className="h3">DOA</h3>
                  <p className="muted" style={{ marginTop: 8 }}>
                    DOA claims must be reported within the stated window (typically 7–30 days). Some categories may be shorter.
                  </p>
                </div>
                <div className="card card-soft">
                  <h3 className="h3">RMA</h3>
                  <p className="muted" style={{ marginTop: 8 }}>
                    RMAs require evidence (photos + test setup). We validate and issue replacement/credit where applicable.
                  </p>
                </div>
                <div className="card card-soft">
                  <h3 className="h3">Alignment</h3>
                  <p className="muted" style={{ marginTop: 8 }}>
                    We run back-to-back claims with suppliers. Your invoice/quote will show the applicable terms per line item.
                  </p>
                </div>
              </div>
              <div className="callout" style={{ marginTop: 12 }}>
                <b>Important:</b> Semiconductor returns depend heavily on packaging condition and ESD handling. Keep all original
                packing material until acceptance testing is completed.
              </div>
            </div>
          </section>

          <section id="eligibility" className="doc-section">
            <h2>Eligibility</h2>
            <div className="card">
              <div className="policy-table">
                <div className="policy-row">
                  <div className="policy-k">Return reason</div>
                  <div className="policy-v">DOA, shipping damage, wrong item supplied, supplier-authorized warranty claim.</div>
                </div>
                <div className="policy-row">
                  <div className="policy-k">Proof required</div>
                  <div className="policy-v">Order reference, photos, and basic test description (setup + symptoms).</div>
                </div>
                <div className="policy-row">
                  <div className="policy-k">Condition</div>
                  <div className="policy-v">Original packaging, labels, and ESD-safe handling. Items must be in resalable condition unless DOA.</div>
                </div>
                <div className="policy-row">
                  <div className="policy-k">Custom / cut tape</div>
                  <div className="policy-v">May be restricted or non-returnable unless explicitly stated on the quote.</div>
                </div>
              </div>
            </div>
          </section>

          <section id="doa" className="doc-section">
            <h2>DOA window</h2>
            <div className="card">
              <p className="muted">
                DOA (Dead on Arrival) is a failure observed during first power-on / initial testing under normal use conditions.
                The DOA window starts from delivery date.
              </p>

              <div className="policy-table" style={{ marginTop: 10 }}>
                <div className="policy-row">
                  <div className="policy-k">Typical DOA window</div>
                  <div className="policy-v">7–30 days (varies by supplier & product class).</div>
                </div>
                <div className="policy-row">
                  <div className="policy-k">High-risk / sensitive parts</div>
                  <div className="policy-v">May have a shorter DOA window. Check your quote line item terms.</div>
                </div>
                <div className="policy-row">
                  <div className="policy-k">Boards & modules</div>
                  <div className="policy-v">Often support DOA with test evidence and serial/lot traceability.</div>
                </div>
              </div>
            </div>
          </section>

          <section id="rma" className="doc-section">
            <h2>RMA process</h2>
            <div className="card">
              <div className="mini-grid">
                <div className="mini">
                  <div className="mini-k">1) Submit</div>
                  <div className="mini-v">Issue details + photos + test setup + order reference.</div>
                </div>
                <div className="mini">
                  <div className="mini-k">2) Validate</div>
                  <div className="mini-v">We confirm eligibility and may request additional diagnostics.</div>
                </div>
                <div className="mini">
                  <div className="mini-k">3) RMA ID</div>
                  <div className="mini-v">If approved, we issue an RMA ID and return instructions.</div>
                </div>
                <div className="mini">
                  <div className="mini-k">4) Receive</div>
                  <div className="mini-v">Incoming inspection + packaging condition check.</div>
                </div>
                <div className="mini">
                  <div className="mini-k">5) Resolve</div>
                  <div className="mini-v">Replacement, credit, or supplier warranty route (back-to-back).</div>
                </div>
                <div className="mini">
                  <div className="mini-k">6) Close</div>
                  <div className="mini-v">Outcome recorded and shared with evidence summary.</div>
                </div>
              </div>

              <div className="small" style={{ marginTop: 10 }}>
                For high-value orders, we assign a named owner and keep an audit trail of communications and evidence.
              </div>
            </div>
          </section>

          <section id="packaging" className="doc-section">
            <h2>Packaging & handling</h2>
            <div className="doc-grid">
              <div className="card">
                <h3 className="h3">Original packing required</h3>
                <ul className="list-tight">
                  <li>Keep outer carton + seals</li>
                  <li>Keep inner bags, trays, reels</li>
                  <li>Do not remove labels / lot codes</li>
                </ul>
              </div>
              <div className="card">
                <h3 className="h3">ESD-safe handling</h3>
                <ul className="list-tight">
                  <li>Use ESD straps / mats where applicable</li>
                  <li>Avoid touching exposed pads/pins</li>
                  <li>Store in anti-static packaging</li>
                </ul>
              </div>
              <div className="card">
                <h3 className="h3">Return shipping</h3>
                <ul className="list-tight">
                  <li>Use protective packaging to prevent in-transit damage</li>
                  <li>Mark RMA ID on the outer package</li>
                  <li>Include a short failure note</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="exceptions" className="doc-section">
            <h2>Exceptions</h2>
            <div className="card">
              <ul className="list-tight">
                <li>ESD damage, physical damage, or altered labels may void eligibility.</li>
                <li>Special-order items, cut tape, or custom builds may be non-returnable unless stated.</li>
                <li>Software/licensing and downloadable items are non-returnable.</li>
                <li>Opened packaging may be restricted for certain product classes.</li>
              </ul>
            </div>
          </section>

          <section id="warranty" className="doc-section">
            <h2>Warranty alignment</h2>
            <div className="card">
              <p className="muted">
                We align customer-facing warranty terms with supplier warranty terms (“back-to-back”). If supplier warranty requires
                manufacturer validation, timelines may be longer, and we will keep you updated with status checkpoints.
              </p>
              <div className="callout" style={{ marginTop: 12 }}>
                <b>Best practice:</b> For critical designs, request alternates and qualify at least one second source where possible.
              </div>
            </div>
          </section>

          <section id="sla" className="doc-section">
            <h2>Response SLA</h2>
            <div className="card">
              <div className="policy-table">
                <div className="policy-row">
                  <div className="policy-k">Acknowledgement</div>
                  <div className="policy-v">Within 1 business day of receiving a complete claim submission.</div>
                </div>
                <div className="policy-row">
                  <div className="policy-k">RMA decision</div>
                  <div className="policy-v">Typically 2–5 business days (may vary by evidence completeness).</div>
                </div>
                <div className="policy-row">
                  <div className="policy-k">High-value orders</div>
                  <div className="policy-v">Named owner + scheduled updates until closure.</div>
                </div>
              </div>
              <div className="small" style={{ marginTop: 10 }}>
                Contact details are shown on your invoice/quote and on the RFQ confirmation email.
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
