import { useMemo } from 'react'

export function loadCart(){
  try{
    const raw = localStorage.getItem('marsaan_quote_cart')
    return raw ? JSON.parse(raw) : []
  }catch(e){ return [] }
}
export function saveCart(items){
  localStorage.setItem('marsaan_quote_cart', JSON.stringify(items))
}
export function addToCart(item){
  const cart = loadCart()
  const idx = cart.findIndex(x => x.sku === item.sku)
  if(idx >= 0){
    cart[idx].qty = (cart[idx].qty || 1) + 1
  }else{
    cart.push({ sku: item.sku, name: item.productName, model: item.modelPartNumber, category: item.category, qty: 1 })
  }
  saveCart(cart)
  return cart
}
export function removeFromCart(sku){
  const cart = loadCart().filter(x => x.sku !== sku)
  saveCart(cart)
  return cart
}
export function updateQty(sku, qty){
  const cart = loadCart().map(x => x.sku === sku ? { ...x, qty: Math.max(1, Number(qty || 1)) } : x)
  saveCart(cart)
  return cart
}

export default function QuoteCart({ items, onRemove, onQty }){
  const totalLines = useMemo(() => (items || []).length, [items])
  if(!totalLines){
    return <div className="card"><b>Quote Basket</b><p style={{marginTop:6}}>Add items from the catalog to build an RFQ quickly.</p></div>
  }
  return (
    <div className="card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap'}}>
        <b>Quote Basket</b>
        <span className="pill">{totalLines} line(s)</span>
      </div>
      <div style={{overflow:'auto', marginTop:10}}>
        <table className="table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Item</th>
              <th>Qty</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.sku}>
                <td><b>{x.sku}</b><div className="small">{x.category}</div></td>
                <td>{x.name}<div className="small">{x.model}</div></td>
                <td>
                  <input className="input" style={{width:90}} type="number" min="1"
                         value={x.qty || 1}
                         onChange={(e)=>onQty?.(x.sku, e.target.value)} />
                </td>
                <td>
                  <button className="btn" onClick={()=>onRemove?.(x.sku)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="small" style={{marginTop:10}}>Tip: You can also upload a BOM file below (CSV/XLSX) on the RFQ page.</div>
    </div>
  )
}
