import { useMemo } from 'react'


function CoastlineWorldMap() {
  return (
    <svg viewBox="0 0 1200 600" className="map-illus" role="img" aria-label="Sourcing workflow illustration">
      <defs>
        <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.2" />
        </linearGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="18" floodColor="#0B2A6F" floodOpacity="0.08" />
        </filter>
      </defs>

      {/* Background */}
      <rect x="24" y="24" width="1152" height="552" rx="22" fill="#ffffff" filter="url(#softShadow)" />
      <rect x="24" y="360" width="1152" height="216" rx="22" fill="#F6FAFF" />

      {/* Subtle grid */}
      <g opacity="0.18">
        {Array.from({length: 16}).map((_,i)=>(
          <line key={'v'+i} x1={80 + i*70} y1="90" x2={80 + i*70} y2="540" stroke="#2563eb" strokeWidth="1" />
        ))}
        {Array.from({length: 8}).map((_,i)=>(
          <line key={'h'+i} x1="80" y1={120 + i*55} x2="1120" y2={120 + i*55} stroke="#2563eb" strokeWidth="1" />
        ))}
      </g>

      {/* Animated arcs */}
      <g className="map-arcs">
        <path className="map-arc arc1" d="M180,370 C360,260 470,250 610,210" />
        <path className="map-arc arc2" d="M610,210 C760,170 860,190 1010,250" />
        <path className="map-arc arc3" d="M180,370 C520,430 760,420 1010,250" />
      </g>

      {/* Nodes */}
      <g>
        <circle className="map-node n1" cx="180" cy="370" r="7" />
        <circle className="map-node n2" cx="610" cy="210" r="7" />
        <circle className="map-node n3" cx="1010" cy="250" r="7" />

        <text x="145" y="400" fontSize="14" fill="#0b1324" opacity="0.9">Authorized</text>
        <text x="585" y="240" fontSize="14" fill="#0b1324" opacity="0.9">Vetting</text>
        <text x="980" y="280" fontSize="14" fill="#0b1324" opacity="0.9">Bangalore</text>
      </g>

      {/* Caption */}
      <g opacity="0.85">
        <text x="70" y="120" fontSize="18" fontWeight="700" fill="#0b1324">Tiered sourcing workflow</text>
        <text x="70" y="148" fontSize="13" fill="#42526e">Authorized distributors first → vetted local stock → best lead time</text>
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