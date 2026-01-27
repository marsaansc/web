import { Link, useParams } from 'react-router-dom'
import data from '../data/products.json'
import { addToCart } from '../components/QuoteCart.jsx'

function Chip({ children }){
  return <span className="chip">{children}</span>
}

export default function Product(){
  const { sku } = useParams()
  const p = (data.products || []).find(x => x.sku === sku)

  if(!p){
    return (
      <div className="card">
        <h3>Product not found</h3>
        <p className="muted">Go back to the catalog and select an item.</p>
        <Link className="btn" to="/catalog">Catalog</Link>
      </div>
    )
  }

  const tier1 = p.tier1?.distributors || []
  const tier2 = p.tier2?.stockists || []

  function onAdd(){
    addToCart(p)
    alert('Added to Quote List. Go to the RFQ page to submit.')
  }

  return (
    <div>
      <div className="section-title">
        <h2>{p.productName}</h2>
        <span><b>{p.sku}</b></span>
      </div>

      <div className="two-col">
        <div>
          <div className="card">
            <div style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
              <div>
                <div className="muted" style={{fontSize:13}}>{p.category}{p.productType ? ` • ${p.productType}` : ''}</div>
                <div style={{marginTop:6, fontWeight:700}}>{p.manufacturer} {p.modelPartNumber ? `— ${p.modelPartNumber}` : ''}</div>
              </div>
              <div style={{display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
                <Chip>GST Invoice</Chip>
                <Chip>QC + RMA</Chip>
                <Chip>Traceability</Chip>
              </div>
            </div>

            <div style={{marginTop:12}}>
              <div className="muted" style={{fontSize:13, marginBottom:6}}>Key specs</div>
              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                {(p.keySpecs || '').split(/;|\||,/).map(s => s.trim()).filter(Boolean).slice(0, 8).map(s => (
                  <Chip key={s}>{s}</Chip>
                ))}
                {!p.keySpecs ? <span className="muted">—</span> : null}
              </div>
            </div>

            <div style={{marginTop:16}}>
              <div className="muted" style={{fontSize:13, marginBottom:6}}>Use case</div>
              <p style={{margin:'0 0 6px'}}>{p.useCase || '—'}</p>
              <div className="small">Target customers: {p.targetCustomers || '—'}</div>
            </div>
          </div>

          <div className="card" style={{marginTop:14}}>
            <h3 style={{marginTop:0}}>RFQ routing (from your mapping)</h3>
            <p className="muted" style={{marginTop:6}}>
              Start with Tier‑1 authorized sources for lowest counterfeit risk; use Tier‑2 for urgent local stock in India.
            </p>
            <div className="grid" style={{gridTemplateColumns:'repeat(12,1fr)', marginTop:10}}>
              <div className="card" style={{gridColumn:'span 6', background:'var(--surface2)'}}>
                <b>Tier‑1 (Authorized)</b>
                {tier1.length ? <ul>{tier1.map(x => <li key={x}>{x}</li>)}</ul> : <div className="small">Not mapped yet.</div>}
                {p.tier1?.notes ? <div className="small" style={{marginTop:6}}>{p.tier1.notes}</div> : null}
              </div>
              <div className="card" style={{gridColumn:'span 6', background:'var(--surface2)'}}>
                <b>Tier‑2 (India stockists)</b>
                {tier2.length ? <ul>{tier2.map(x => <li key={x}>{x}</li>)}</ul> : <div className="small">Not mapped yet.</div>}
                {p.tier2?.notes ? <div className="small" style={{marginTop:6}}>{p.tier2.notes}</div> : null}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card sticky">
            <h3 style={{marginTop:0}}>Request a quote</h3>
            <p className="muted" style={{marginTop:6}}>Add to Quote List or go straight to RFQ. Procurement-friendly, RFQ-first.</p>

            <div style={{display:'grid', gap:10, marginTop:10}}>
              <button className="btn primary" onClick={onAdd}>Add to Quote List</button>
              <Link className="btn" to={`/rfq?sku=${encodeURIComponent(p.sku)}`}>Request Quote</Link>
              <Link className="btn" to="/catalog">Back to catalog</Link>
            </div>

            <div className="mini-callout" style={{marginTop:14}}>
              <b>What to include for fastest quote</b>
              <div className="small" style={{marginTop:6}}>
                Quantity breaks, needed-by date, alternates allowed, and shipping pincode.
              </div>
            </div>

            <div style={{marginTop:12, display:'flex', gap:8, flexWrap:'wrap'}}>
              <Link className="pill" to="/shipping">Lead times</Link>
              <Link className="pill" to="/compliance">Compliance</Link>
              <Link className="pill" to="/returns">RMA</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop:14}}>
        <h3 style={{marginTop:0}}>Reference pricing & links (internal)</h3>
        <div className="small">Keep procurement links for internal research; publish only what you want customers to see.</div>
        <div style={{marginTop:10, display:'flex', flexWrap:'wrap', gap:10}}>
          {p.links?.amazonIN?.url ? <a className="btn" href={p.links.amazonIN.url} target="_blank" rel="noreferrer">Amazon</a> : null}
          {p.links?.alibaba?.url ? <a className="btn" href={p.links.alibaba.url} target="_blank" rel="noreferrer">Alibaba</a> : null}
          {p.links?.mouser?.url ? <a className="btn" href={p.links.mouser.url} target="_blank" rel="noreferrer">Mouser</a> : null}
          {p.links?.digikey?.url ? <a className="btn" href={p.links.digikey.url} target="_blank" rel="noreferrer">Digi‑Key</a> : null}
          {p.links?.lcsc?.url ? <a className="btn" href={p.links.lcsc.url} target="_blank" rel="noreferrer">LCSC</a> : null}
        </div>
      </div>
    </div>
  )
}
