import { Link, useParams } from 'react-router-dom'
import data from '../data/products.json'
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
  const p = (data.products || []).find(x => x.sku === sku)

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

  function onAdd(){
    addToCart(p)
    alert('Added to quote basket. Go to RFQ page to submit.')
  }

  return (
    <div>
      <div className="section-title">
        <h2>{p.productName}</h2>
        <span><b>{p.sku}</b></span>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="pill">{p.category} • {p.productType}</div>
          <h3 style={{marginTop:10}}>{p.manufacturer} — {p.modelPartNumber}</h3>
          <p style={{marginTop:10}}>{p.keySpecs || '—'}</p>

          <div style={{display:'flex',gap:12,flexWrap:'wrap',marginTop:12}}>
            <button className="btn primary" onClick={onAdd}>Add to Quote</button>
            <Link className="btn" to={`/rfq?sku=${encodeURIComponent(p.sku)}`}>Request Quote</Link>
            <Link className="btn" to="/catalog">Back</Link>
          </div>

          <div style={{marginTop:14}}>
            <div className="section-title"><h2>Use case</h2><span>who buys this</span></div>
            <p>{p.useCase || '—'}</p>
            <div className="small">Target customers: {p.targetCustomers || '—'}</div>
          </div>
        </div>

        <div className="card">
          <h3>RFQ routing (from your mapping)</h3>
          <p>Start with Tier‑1 authorized sources for lowest counterfeit risk; use Tier‑2 for urgent local stock in India.</p>
          <div style={{marginTop:10}}>
            <div><b>Tier‑1 (Authorized)</b></div>
            {tier1.length ? (
              <ul>{tier1.map(x => <li key={x}>{x}</li>)}</ul>
            ) : <div className="small">Not mapped yet.</div>}
            {p.tier1?.notes ? <div className="small">{p.tier1.notes}</div> : null}

            <div style={{marginTop:10}}><b>Tier‑2 (India stockists)</b></div>
            {tier2.length ? (
              <ul>{tier2.map(x => <li key={x}>{x}</li>)}</ul>
            ) : <div className="small">Not mapped yet.</div>}
            {p.tier2?.notes ? <div className="small">{p.tier2.notes}</div> : null}
          </div>
        </div>
      </div>

      <div className="card" style={{marginTop:14}}>
        <h3>Reference pricing & links (for internal research)</h3>
        <div className="small">Keep procurement links for internal use; publish only what you want customers to see.</div>
        <div style={{marginTop:8}}>
          <LinkLine label="Amazon India" url={p.links?.amazonIN?.url} price={p.links?.amazonIN?.priceINR ? `₹${Math.round(p.links.amazonIN.priceINR)}` : ''} />
          <LinkLine label="Alibaba" url={p.links?.alibaba?.url} price={p.links?.alibaba?.priceUSD ? `$${p.links.alibaba.priceUSD}` : ''} />
          <LinkLine label="LCSC" url={p.links?.lcsc?.url} price={p.links?.lcsc?.priceUSD ? `$${p.links.lcsc.priceUSD}` : ''} />
          <LinkLine label="Mouser" url={p.links?.mouser?.url} price={p.links?.mouser?.priceUSD ? `$${p.links.mouser.priceUSD}` : ''} />
          <LinkLine label="Digi-Key" url={p.links?.digikey?.url} price={p.links?.digikey?.priceUSD ? `$${p.links.digikey.priceUSD}` : ''} />
        </div>
      </div>
    </div>
  )
}
