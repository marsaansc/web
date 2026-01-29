import { useMemo } from 'react'

function MapIllustration() {
  // Lightweight inline SVG (no external assets). Creates a "global network" feel.
  return (
    <svg viewBox="0 0 900 420" className="map-illus" role="img" aria-label="Global sourcing network map illustration">
      <rect x="0" y="0" width="900" height="420" rx="22" fill="#F7FAFF" />

      {/* faint lat/long lines */}
      <g opacity="0.12" stroke="#2563eb" strokeWidth="1">
        <path d="M60 90 H840" />
        <path d="M60 150 H840" />
        <path d="M60 210 H840" />
        <path d="M60 270 H840" />
        <path d="M60 330 H840" />
        <path d="M140 50 V370" />
        <path d="M260 50 V370" />
        <path d="M380 50 V370" />
        <path d="M500 50 V370" />
        <path d="M620 50 V370" />
        <path d="M740 50 V370" />
      </g>

      {/* high-detail continent silhouettes (inline SVG, no external assets) */}
      <g opacity="0.18" fill="#2563eb">
        {/* North America */}
        <path d="M115 122c22-16 52-28 86-32 44-6 86 6 112 26 18 14 27 32 19 50-8 17-28 20-45 30-20 11-21 30-38 45-19 17-50 24-80 19-35-6-70-27-85-52-16-26-7-61 31-86z"/>
        {/* Greenland */}
        <path d="M300 102c14-9 36-11 50-3 10 6 10 16 1 23-9 6-25 9-38 6-14-3-22-15-13-26z"/>
        {/* South America */}
        <path d="M255 235c20-12 44-4 56 13 14 20 14 50 2 73-10 19-11 38-25 55-15 19-37 29-56 22-20-7-30-30-33-51-4-28 7-55 17-82 7-17 16-23 39-30z"/>
        {/* Europe */}
        <path d="M395 145c18-12 44-18 67-14 18 3 33 12 35 23 2 12-9 20-22 25-14 6-15 16-27 22-14 7-32 8-48 2-16-6-30-18-28-31 2-11 11-18 23-27z"/>
        {/* Africa */}
        <path d="M430 205c26-18 62-24 92-16 26 7 46 24 44 44-2 20-24 29-34 46-10 18-7 40-23 52-19 14-46 16-70 8-24-7-46-26-52-48-6-23 7-38 20-56 8-10 11-18 23-30z"/>
        {/* Asia */}
        <path d="M545 138c42-26 102-36 158-26 46 8 84 30 86 57 2 27-25 41-44 56-20 16-18 35-38 51-26 22-68 31-109 25-42-6-81-28-98-55-18-28-8-63 17-86 11-10 15-16 28-22z"/>
        {/* Australia */}
        <path d="M720 290c20-13 48-15 69-6 18 7 28 21 23 34-5 13-22 15-35 22-13 7-16 18-31 23-17 6-37 3-52-7-15-10-22-28-16-41 5-11 19-16 42-25z"/>
      </g>

      {/* network lines */}
      <g opacity="0.55" stroke="#2563eb" strokeWidth="2" fill="none">
        <path d="M195 185 C300 110, 420 120, 520 170" />
        <path d="M520 170 C610 220, 690 250, 745 285" />
        <path d="M420 290 C520 250, 600 220, 745 285" />
      </g>

      {/* nodes */}
      <g>
        <circle cx="195" cy="185" r="7" fill="#2563eb" />
        <circle cx="520" cy="170" r="7" fill="#2563eb" />
        <circle cx="745" cy="285" r="7" fill="#2563eb" />
        <circle cx="420" cy="290" r="7" fill="#2563eb" />
        <circle cx="310" cy="155" r="4" fill="#2563eb" opacity="0.75" />
        <circle cx="610" cy="240" r="4" fill="#2563eb" opacity="0.75" />
      </g>

      {/* labels */}
      <g fontFamily="ui-sans-serif, system-ui" fontSize="12" fill="#0B1324" opacity="0.9">
        <text x="180" y="170">Authorized</text>
        <text x="500" y="155">Vetting</text>
        <text x="724" y="270">Bangalore</text>
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
                <MapIllustration />
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