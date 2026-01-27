import { Link } from 'react-router-dom'

const notes = [
  {
    title: 'How to structure a BOM for fastest RFQ turnaround',
    points: ['Include MPN, manufacturer, package', 'Add quantity breaks', 'Mark alternates allowed', 'Specify needed-by date and shipping pincode']
  },
  {
    title: 'Counterfeit risk controls (practical checklist)',
    points: ['Authorized-first sourcing', 'Packaging photos & lot codes', 'COC/traceability on request', 'DOA terms captured before purchase']
  },
  {
    title: 'Lead times & alternates',
    points: ['Split BOM by critical vs flexible items', 'Approve alternates for passives/regulators', 'Use local stock for prototypes', 'Plan authorized supply for production']
  }
]

export default function ApplicationNotes(){
  return (
    <div>
      <div className="section-title">
        <h2>Application Notes</h2>
        <span>Practical procurement + engineering guidance</span>
      </div>

      <div className="grid" style={{gridTemplateColumns:'repeat(12,1fr)'}}>
        {notes.map(n => (
          <div key={n.title} className="card" style={{gridColumn:'span 6'}}>
            <h3 style={{marginTop:0}}>{n.title}</h3>
            <ul>
              {n.points.map(p => <li key={p}>{p}</li>)}
            </ul>
          </div>
        ))}
        <div className="card" style={{gridColumn:'span 12'}}>
          <h3 style={{marginTop:0}}>Need a custom note for your BOM?</h3>
          <p className="small">Upload your BOM and select “Engineering support” in the notes. We’ll respond with alternates, risk flags and lead-time options.</p>
          <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:10}}>
            <Link className="btn primary" to="/rfq">Upload BOM</Link>
            <Link className="btn" to="/engineering-support">Talk to an engineer</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
