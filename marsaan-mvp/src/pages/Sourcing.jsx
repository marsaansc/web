import { useMemo } from 'react'


function CoastlineWorldMap() {
  // NOTE: This is intentionally NOT a geographic map.
  // It's a clean “sourcing workflow” illustration (no Bangalore/world visuals).
  return (
    <svg viewBox="0 0 1200 600" className="map-illus" role="img" aria-label="Sourcing workflow illustration">
      <defs>
        <linearGradient id="bgWash" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7fbff" />
          <stop offset="1" stopColor="#eef5ff" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="60%">
          <stop offset="0" stopColor="#2563eb" stopOpacity="0.18" />
          <stop offset="1" stopColor="#2563eb" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect x="0" y="0" width="1200" height="600" fill="url(#bgWash)" />
      <g opacity="0.28">
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={'h'+i} x1="0" y1={40 + i*26} x2="1200" y2={40 + i*26} stroke="#94a3b8" strokeWidth="1" />
        ))}
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={'v'+i} x1={30 + i*50} y1="0" x2={30 + i*50} y2="600" stroke="#94a3b8" strokeWidth="1" />
        ))}
      </g>

      {/* Soft glow behind the flow */}
      <circle cx="620" cy="300" r="260" fill="url(#glow)" />

      {/* Animated arcs (CSS) */}
      <path className="map-arc arc1" d="M 220 320 C 420 190, 540 190, 700 270" />
      <path className="map-arc arc2" d="M 700 270 C 860 340, 980 360, 1050 300" />
      <path className="map-arc arc3" d="M 220 320 C 520 440, 820 450, 1050 300" />

      {/* Nodes */}
      <g>
        <circle className="map-node n1" cx="220" cy="320" r="9" />
        <circle className="map-node n2" cx="700" cy="270" r="9" />
        <circle className="map-node n3" cx="1050" cy="300" r="9" />
      </g>

      {/* Labels */}
      <g fontFamily="ui-sans-serif, system-ui" fontSize="16" fill="#0b1324" opacity="0.92">
        <text x="170" y="292">Tier-1 Authorized</text>
        <text x="646" y="242">Vetting</text>
        <text x="980" y="272">Quote &amp; Delivery</text>
      </g>

      {/* Legend chips */}
      <g fontFamily="ui-sans-serif, system-ui" fontSize="14" fill="#0b1324" opacity="0.9">
        <rect x="60" y="470" width="330" height="68" rx="14" fill="#ffffff" stroke="rgba(37,99,235,.18)" />
        <text x="84" y="512">Authorized first → vetted local → best lead time</text>

        <rect x="420" y="470" width="320" height="68" rx="14" fill="#ffffff" stroke="rgba(37,99,235,.18)" />
        <text x="444" y="512">Evidence bundle: lot, packaging, warranty</text>

        <rect x="770" y="470" width="370" height="68" rx="14" fill="#ffffff" stroke="rgba(37,99,235,.18)" />
        <text x="794" y="512">Single consolidated quote with alternates</text>
      </g>
    </svg>
  )
}


export default function Sourcing() {
  const toc = useMemo(
    () => [
      { id: 'overview', label: 'Overview' },
      { id: 'tiers', label: 'Tier‑1 vs Tier‑2' },
      { id: 'workflow', label: 'RFQ workflow' },
      { id: 'verification', label: 'Verification & onboarding' },
      { id: 'evidence', label: 'Evidence bundle' },
      { id: 'playbook', label: 'Operating playbook' },
    ],
    []
  )

  return (
    <div className="page">
      <div className="page-head">
        <h1>Global Sourcing</h1>
        <p className="muted">
          A credible sourcing model that reads like a global distributor: <b>Authorized first</b>, vetted local stock for speed,
          and documentation that reduces counterfeit risk.
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
            <div className="card map-card">
              <div className="map-left">
                <div className="kicker">Global Reach • Local Agility</div>
                <h2 className="h2-tight">Sourcing designed for Bangalore, ready for the world</h2>
                <p className="muted" style={{ marginTop: 8 }}>
                  We quote from <b>Tier‑1 (authorized / franchised)</b> first for best traceability, then use <b>Tier‑2</b> (India
                  stockists / resellers) for urgent delivery and smaller quantities—always with extra verification.
                </p>

                <div className="flow">
                  <div className="flow-step">
                    <div className="flow-dot" />
                    <div>
                      <div className="flow-title">Tier‑1 Authorized</div>
                      <div className="flow-sub">Lowest counterfeit risk • Best paperwork</div>
                    </div>
                  </div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">
                    <div className="flow-dot" />
                    <div>
                      <div className="flow-title">Tier‑2 Local Stock</div>
                      <div className="flow-sub">Fast delivery • Small MOQ (verified)</div>
                    </div>
                  </div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-step">
                    <div className="flow-dot" />
                    <div>
                      <div className="flow-title">Customer Delivery</div>
                      <div className="flow-sub">Evidence bundle • DOA/Warranty alignment</div>
                    </div>
                  </div>
                </div>

                <div className="pill-row">
                  <span className="pill">RFQ turnaround target: 24–48h</span>
                  <span className="pill">Evidence per line item</span>
                  <span className="pill">Alternates + lead time options</span>
                </div>
              </div>

              <div className="map-right">
                <CoastlineWorldMap />
              </div>
            </div>
          </section>

          <section id="tiers" className="doc-section">
            <h2>Tier‑1 vs Tier‑2</h2>
            <div className="doc-grid">
              <div className="card">
                <h3 className="h3">Tier‑1 (Authorized / Franchised)</h3>
                <ul className="list-tight">
                  <li>Primary path for branded ICs, memory, power ICs, sensors.</li>
                  <li>Better traceability: CoC/CoO, packing lists, lot codes, clear return terms.</li>
                  <li>Usually longer lead times; MOQ may apply.</li>
                </ul>
              </div>
              <div className="card">
                <h3 className="h3">Tier‑2 (India Stockists / Resellers)</h3>
                <ul className="list-tight">
                  <li>Best for urgent delivery, small quantities, accessories & adapters.</li>
                  <li>Must be vetted: source chain clarity, photos, packaging checks.</li>
                  <li>Policy must include stricter acceptance rules.</li>
                </ul>
              </div>
              <div className="card">
                <h3 className="h3">When to stock vs RFQ‑first</h3>
                <ul className="list-tight">
                  <li>Start RFQ‑first until demand is proven.</li>
                  <li>Stock only high‑turn SKUs with predictable margins.</li>
                  <li>Keep records of price dates, supplier terms, lead time history.</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="workflow" className="doc-section">
            <h2>RFQ workflow</h2>
            <div className="card">
              <div className="mini-grid">
                <div className="mini">
                  <div className="mini-k">1) Intake</div>
                  <div className="mini-v">BOM, quantities, target date, alternates allowed.</div>
                </div>
                <div className="mini">
                  <div className="mini-k">2) Route</div>
                  <div className="mini-v">Tier‑1 first → Tier‑2 only if needed (or urgency).</div>
                </div>
                <div className="mini">
                  <div className="mini-k">3) Normalize</div>
                  <div className="mini-v">Compare lead time, MOQ, Incoterms, warranty, DOA windows.</div>
                </div>
                <div className="mini">
                  <div className="mini-k">4) Quote</div>
                  <div className="mini-v">Provide options: cheapest, fastest, lowest risk.</div>
                </div>
                <div className="mini">
                  <div className="mini-k">5) Confirm</div>
                  <div className="mini-v">Confirm packaging, labels, compliance docs as applicable.</div>
                </div>
                <div className="mini">
                  <div className="mini-k">6) Deliver</div>
                  <div className="mini-v">Ship with invoice + evidence bundle reference.</div>
                </div>
              </div>
              <div className="small" style={{ marginTop: 10 }}>
                Tip: for each BOM line, keep a short “decision note” (why this supplier was chosen) — it becomes your credibility.
              </div>
            </div>
          </section>

          <section id="verification" className="doc-section">
            <h2>Verification & onboarding</h2>
            <div className="card">
              <div className="policy-table">
                <div className="policy-row">
                  <div className="policy-k">Supplier identity</div>
                  <div className="policy-v">GST/KYC, address verification, business license where applicable.</div>
                </div>
                <div className="policy-row">
                  <div className="policy-k">Commercial terms</div>
                  <div className="policy-v">DOA days, RMA method, payment terms, delivery/Incoterms, warranty.</div>
                </div>
                <div className="policy-row">
                  <div className="policy-k">Product evidence</div>
                  <div className="policy-v">Packaging photos, labels, lot/date codes, anti-tamper seals.</div>
                </div>
                <div className="policy-row">
                  <div className="policy-k">Quality checks</div>
                  <div className="policy-v">Visual inspection, ESD handling, sample test for risky parts.</div>
                </div>
                <div className="policy-row">
                  <div className="policy-k">Red flags</div>
                  <div className="policy-v">Unusually low price, no paperwork, mismatched packaging, vague origin.</div>
                </div>
              </div>
            </div>
          </section>

          <section id="evidence" className="doc-section">
            <h2>Evidence bundle (per order)</h2>
            <div className="doc-grid">
              <div className="card">
                <h3 className="h3">Documents</h3>
                <ul className="list-tight">
                  <li>Invoice + packing list reference</li>
                  <li>Supplier term snapshot (DOA/warranty)</li>
                  <li>Compliance docs (if applicable)</li>
                </ul>
              </div>
              <div className="card">
                <h3 className="h3">Photos</h3>
                <ul className="list-tight">
                  <li>Outer carton + seals</li>
                  <li>Labels + lot/date codes</li>
                  <li>Tray/reel/bag & condition</li>
                </ul>
              </div>
              <div className="card">
                <h3 className="h3">Notes</h3>
                <ul className="list-tight">
                  <li>Quote option chosen & why</li>
                  <li>Alternates considered</li>
                  <li>Delivery constraints & customer confirmations</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="playbook" className="doc-section">
            <h2>Operating playbook</h2>
            <div className="card">
              <ul className="list-tight">
                <li><b>Default route:</b> Tier‑1 → Tier‑2 → (only then) broker-style sourcing.</li>
                <li><b>Set expectations:</b> show three quote options: fastest / cheapest / lowest-risk.</li>
                <li><b>Keep proof:</b> evidence bundle is your “brand.”</li>
                <li><b>Learn from data:</b> record lead times & margins; stock only proven SKUs.</li>
              </ul>
              <div className="callout" style={{ marginTop: 12 }}>
                <b>Founder note (Bangalore-first):</b> Build a Tier‑2 list for speed (SP Road / Peenya for accessories), but keep the Tier‑1 habit for credibility on ICs.
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}