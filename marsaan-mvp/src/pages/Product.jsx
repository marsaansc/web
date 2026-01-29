import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import data from '../data/products.json'
import PageHero from '../components/PageHero.jsx'
import aiBg from '../assets/ai-edge-board.jpg'
import fpgaBg from '../assets/fpga.jpg'
import mcuBg from '../assets/microcontroller.jpg'
import { addToCart } from '../components/QuoteCart.jsx'

function LinkLine({ label, url, price }){
  if(!url) return null
  return (
    <div style={{display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap',borderBottom:'1px solid var(--line)',padding:'10px 0'}}>
      <div><b>{label}</b><div className="small">{url}</div></div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        {price ? <span className="pill">{price}</span> : null}
        <a className="btn" href={url} target="_blank" rel="noreferrer">Open</a>
      </div>
    </div>
  )
}

export default function Product(){
  const { sku } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const p = (data.products || []).find(x => x.sku === sku)

  const bg = useMemo(() => {
    const c = String(p?.category || '').toLowerCase()
    if(c.includes('fpga')) return fpgaBg
    if(c.includes('micro')) return mcuBg
    if(c.includes('mcu')) return mcuBg
    return aiBg
  }, [p])

  const tabFromHash = useMemo(() => {
    const h = (location.hash || '').replace('#','').trim()
    return h || 'overview'
  }, [location.hash])

  const [tab, setTab] = useState('overview')

  useEffect(() => {
    setTab(['overview','specs','sourcing','docs'].includes(tabFromHash) ? tabFromHash : 'overview')
  }, [tabFromHash])

  function setHash(next){
    // keep current path/query; only replace hash
    navigate({ pathname: location.pathname, search: location.search, hash: `#${next}` }, { replace: true })
  }

  if(!p){
    return (
      <div className="card">
        <h3>Product not found</h3>
        <p>Go back to the catalog and select an item.</p>
        <Link className="btn" to="/catalog">Catalog</Link>
      </div>
    )
  }

  const tier1 = p.tier1?.distributors || []
  const tier2 = p.tier2?.stockists || []

  const plannedSell = Number.isFinite(p.plannedSellPriceINR) ? Math.round(p.plannedSellPriceINR) : null
  const plannedBuy = Number.isFinite(p.plannedBuyPriceINR) ? Math.round(p.plannedBuyPriceINR) : null
  const leadDays = Number.isFinite(p.leadTimeDays) ? Math.round(p.leadTimeDays) : null

  const extSources = useMemo(() => {
    const links = p.links || {}
    return [
      { name:'Amazon India', url: links.amazonIN?.url, price: links.amazonIN?.priceINR ? `₹${Math.round(links.amazonIN.priceINR)}` : '' },
      { name:'Digi-Key', url: links.digikey?.url, price: links.digikey?.priceUSD ? `$${links.digikey.priceUSD}` : '' },
      { name:'Mouser', url: links.mouser?.url, price: links.mouser?.priceUSD ? `$${links.mouser.priceUSD}` : '' },
      { name:'LCSC', url: links.lcsc?.url, price: links.lcsc?.priceUSD ? `$${links.lcsc.priceUSD}` : '' },
      { name:'Alibaba', url: links.alibaba?.url, price: links.alibaba?.priceUSD ? `$${links.alibaba.priceUSD}` : '' },
    ].filter(x => x.url)
  }, [p])

  function onAdd(){
    addToCart(p)
    alert('Added to quote basket. Go to RFQ page to submit.')
  }

  return (
    <>
      <PageHero
        kicker="Product details"
        title={p ? (p.name || p.mpn || p.sku) : 'Product'}
        subtitle={p ? `${p.category || ''}${p.manufacturer ? ' • ' + p.manufacturer : ''}${p.mpn ? ' • ' + p.mpn : ''}` : 'Looking up SKU…'}
        crumbs={[{ label: 'Home', to: '/' }, { label: 'Catalog', to: '/catalog' }, { label: sku }]}
        actions={
          <div className="hero-actions">
            <Link className="btn" to="/catalog">Back to Catalog</Link>
            <Link className="btn primary" to="/rfq">Upload BOM</Link>
          </div>
        }
      />
      <div className="product-shell watermark" style={{"--wm1": `url(${bg})`, "--wm2": `url(${fpgaBg})`}}>

      {/* Header */}
      <div className="product-head">
        <div style={{minWidth:0}}>
          <div className="small" style={{marginBottom:6}}>
            <Link className="link" to="/catalog">Catalog</Link>
            <span className="small" style={{opacity:.7}}> / </span>
            <span className="small" style={{opacity:.9}}>{p.category}</span>
          </div>
          <h1 className="product-title">{p.productName}</h1>
          <div className="product-sub">
            <span className="pill pill-accent">{p.manufacturer}</span>
            <span className="pill">MPN: {p.modelPartNumber || '—'}</span>
            <span className="pill">SKU: {p.sku}</span>
          </div>
          <p className="product-blurb">{p.keySpecs || '—'}</p>
        </div>

        {/* Mini gallery (safe: inline SVG only) */}
        <div className="product-media" aria-hidden="true">
          <svg viewBox="0 0 420 280" className="product-illus" role="img">
            <defs>
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stopColor="rgba(37,99,235,.18)" />
                <stop offset="1" stopColor="rgba(34,197,94,.12)" />
              </linearGradient>
              <linearGradient id="g2" x1="0" x2="1">
                <stop offset="0" stopColor="rgba(37,99,235,.55)" />
                <stop offset="1" stopColor="rgba(34,197,94,.45)" />
              </linearGradient>
            </defs>
            <rect x="18" y="22" width="384" height="236" rx="18" fill="url(#g)" stroke="rgba(215,226,242,.9)" />
            <rect x="124" y="70" width="172" height="140" rx="18" fill="rgba(255,255,255,.84)" stroke="rgba(37,99,235,.18)" />
            <rect x="150" y="96" width="120" height="90" rx="12" fill="rgba(37,99,235,.08)" stroke="rgba(37,99,235,.22)" />
            {Array.from({length:10}).map((_,i)=>(
              <rect key={i} x={92 + i*24} y="58" width="10" height="18" rx="3" fill="url(#g2)" opacity=".7" />
            ))}
            {Array.from({length:10}).map((_,i)=>(
              <rect key={'b'+i} x={92 + i*24} y="204" width="10" height="18" rx="3" fill="url(#g2)" opacity=".7" />
            ))}
            <path d="M48 206 C90 190, 112 182, 150 166" stroke="rgba(37,99,235,.35)" strokeWidth="4" fill="none" />
            <path d="M372 76 C330 92, 308 100, 270 116" stroke="rgba(34,197,94,.28)" strokeWidth="4" fill="none" />
          </svg>
          <div className="small" style={{marginTop:8, color:'var(--muted)'}}>
            Illustration placeholder — replace with your product photo later.
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="product-grid">
        <div className="product-main">
          <div className="product-tabs" role="tablist" aria-label="Product sections">
            <button className={tab==='overview' ? 'tab active' : 'tab'} onClick={() => setHash('overview')}>Overview</button>
            <button className={tab==='specs' ? 'tab active' : 'tab'} onClick={() => setHash('specs')}>Specs</button>
            <button className={tab==='sourcing' ? 'tab active' : 'tab'} onClick={() => setHash('sourcing')}>Sourcing</button>
            <button className={tab==='docs' ? 'tab active' : 'tab'} onClick={() => setHash('docs')}>Docs & Links</button>
          </div>

          {tab === 'overview' ? (
            <div className="card">
              <h3>What this is</h3>
              <p>{p.variant || p.productType || '—'}</p>

              <div className="product-kv">
                <div className="kv">
                  <div className="small">Use case</div>
                  <div><b>{p.useCase || '—'}</b></div>
                </div>
                <div className="kv">
                  <div className="small">Best for</div>
                  <div><b>{p.targetCustomers || '—'}</b></div>
                </div>
                <div className="kv">
                  <div className="small">Lead time</div>
                  <div><b>{leadDays ? `${leadDays} days (typical)` : 'Quote required'}</b></div>
                </div>
              </div>

              <div className="callout" style={{marginTop:14}}>
                <div><b>Tip:</b> For lowest counterfeit risk, start with Tier‑1 authorized distributors. Use Tier‑2 only when you need urgent local stock.</div>
                <div className="small" style={{marginTop:6}}>Marsaan RFQ will consolidate options + alternates if applicable.</div>
              </div>
            </div>
          ) : null}

          {tab === 'specs' ? (
            <div className="card">
              <h3>Specifications</h3>
              <div className="spec-table">
                <div className="spec-row"><div className="spec-k">Category</div><div className="spec-v">{p.category || '—'}</div></div>
                <div className="spec-row"><div className="spec-k">Type</div><div className="spec-v">{p.productType || '—'}</div></div>
                <div className="spec-row"><div className="spec-k">Manufacturer</div><div className="spec-v">{p.manufacturer || '—'}</div></div>
                <div className="spec-row"><div className="spec-k">MPN / Model</div><div className="spec-v">{p.modelPartNumber || '—'}</div></div>
                <div className="spec-row"><div className="spec-k">Key specs</div><div className="spec-v">{p.keySpecs || '—'}</div></div>
                <div className="spec-row"><div className="spec-k">MOQ</div><div className="spec-v">{p.moq || 'As quoted'}</div></div>
                <div className="spec-row"><div className="spec-k">Typical lead time</div><div className="spec-v">{leadDays ? `${leadDays} days` : 'As quoted'}</div></div>
              </div>
            </div>
          ) : null}

          {tab === 'sourcing' ? (
            <div className="card">
              <h3>Where we source this</h3>
              <p className="small">This is based on your internal Tier‑1/Tier‑2 mapping. We’ll keep refining it as Marsaan grows.</p>

              <div className="source-grid">
                <div className="source-card">
                  <div className="pill pill-accent">Tier‑1 • Authorized</div>
                  <div className="small" style={{marginTop:8}}>Lowest counterfeit risk</div>
                  {tier1.length ? (
                    <ul className="list-tight">{tier1.map(x => <li key={x}>{x}</li>)}</ul>
                  ) : <div className="small">Not mapped yet.</div>}
                  {p.tier1?.notes ? <div className="small" style={{marginTop:8}}>{p.tier1.notes}</div> : null}
                </div>

                <div className="source-card">
                  <div className="pill">Tier‑2 • India stock</div>
                  <div className="small" style={{marginTop:8}}>Fast delivery in Bangalore / PAN‑India</div>
                  {tier2.length ? (
                    <ul className="list-tight">{tier2.map(x => <li key={x}>{x}</li>)}</ul>
                  ) : <div className="small">Not mapped yet.</div>}
                  {p.tier2?.notes ? <div className="small" style={{marginTop:8}}>{p.tier2.notes}</div> : null}
                </div>
              </div>

              <div className="callout" style={{marginTop:14}}>
                <b>Supplier plan:</b> {p.supplierPlan?.sourcingMode || '—'} • Primary: {p.supplierPlan?.primarySupplierPlanned || '—'}
              </div>
            </div>
          ) : null}

          {tab === 'docs' ? (
            <div className="card">
              <h3>Docs & reference links</h3>
              <div className="small">Keep these links for internal research; publish only what you want customers to see.</div>

              <div style={{marginTop:10}}>
                {extSources.length ? (
                  extSources.map(x => (
                    <LinkLine key={x.url} label={x.name} url={x.url} price={x.price} />
                  ))
                ) : (
                  <div className="small">No reference links added for this SKU yet.</div>
                )}
              </div>
            </div>
          ) : null}

          {/* Availability / Pricing table (always shown like DigiKey) */}
          <div className="card" style={{marginTop:14}}>
            <div className="section-title"><h2>Availability & pricing</h2><span>indicative</span></div>
            <div className="small">Final pricing depends on qty, lead time, alternates, and traceability requirements.</div>

            <div style={{overflowX:'auto', marginTop:10}}>
              <table className="table-compact" style={{width:'100%', minWidth:760}}>
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Unit price</th>
                    <th>MOQ</th>
                    <th>Lead time</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><b>Marsaan (planned)</b><div className="small">GST invoice • RFQ</div></td>
                    <td>{plannedSell ? `₹${plannedSell}` : 'Quote'}</td>
                    <td>{p.moq || 'As quoted'}</td>
                    <td>{leadDays ? `${leadDays} days` : 'As quoted'}</td>
                    <td><Link className="btn" to={`/rfq?sku=${encodeURIComponent(p.sku)}`}>Request Quote</Link></td>
                  </tr>
                  {extSources.slice(0,4).map(s => (
                    <tr key={s.url}>
                      <td><b>{s.name}</b><div className="small">Reference</div></td>
                      <td>{s.price || '—'}</td>
                      <td>—</td>
                      <td>—</td>
                      <td><a className="btn" href={s.url} target="_blank" rel="noreferrer">Open</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sticky buy box */}
        <aside className="product-aside">
          <div className="card product-buy">
            <div className="buy-row">
              <div className="small">Indicative sell</div>
              <div className="buy-price">{plannedSell ? `₹${plannedSell}` : 'Quote'}</div>
            </div>
            <div className="small" style={{marginTop:6, color:'var(--muted)'}}>
              Buy plan: {plannedBuy ? `₹${plannedBuy}` : '—'} • Margin: {Number.isFinite(p.plannedGrossMarginPct) ? `${Math.round(p.plannedGrossMarginPct*100)}%` : '—'}
            </div>

            <div className="buy-meta">
              <div className="meta-item"><span className="small">Lead time</span><b>{leadDays ? `${leadDays} days` : 'Quote'}</b></div>
              <div className="meta-item"><span className="small">MOQ</span><b>{p.moq || 'As quoted'}</b></div>
              <div className="meta-item"><span className="small">Priority</span><b>{p.priorityLabel || '—'}</b></div>
            </div>

            <div className="buy-actions">
              <button className="btn primary" onClick={onAdd}>Add to Quote</button>
              <Link className="btn" to={`/rfq?sku=${encodeURIComponent(p.sku)}`}>Request Quote</Link>
              <Link className="btn" to="/catalog">Back to Catalog</Link>
            </div>

            <div className="small" style={{marginTop:10}}>
              Need alternates? Upload BOM and we’ll suggest compatible options.
            </div>
          </div>
        </aside>
      </div>
      </div>
    </>
  )
}
