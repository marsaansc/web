export default function Blueprint(){
  const imgs = Array.from({length:16}).map((_,i)=>`/blueprint/Blueprint-${String(i+1).padStart(2,'0')}.png`)
  return (
    <div>
      <div className="section-title">
        <h2>Blueprint Gallery (uploaded)</h2>
        <span>reference</span>
      </div>
      <div className="card">
        <p className="small">If an image number is missing, it wasn't found in the uploaded set. This page is optional for internal review.</p>
      </div>
      <div className="grid" style={{gridTemplateColumns:'repeat(12,1fr)', marginTop:14}}>
        {imgs.map((src)=> (
          <div key={src} className="card" style={{gridColumn:'span 6'}}>
            <img src={src} alt={src} style={{width:'100%', borderRadius:12, border:'1px solid var(--line)'}} />
            <div className="small" style={{marginTop:8}}>{src}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
