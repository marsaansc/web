import { Link } from 'react-router-dom'

export default function PageHero({ title, subtitle, kicker, crumbs, actions }){
  return (
    <section className="page-hero">
      <div className="page-hero-inner">
        <div className="page-hero-top">
          <div className="page-hero-left">
            {crumbs ? (
              <div className="breadcrumbs">
                {crumbs.map((c, idx) => (
                  <span key={idx}>
                    {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
                    {idx < crumbs.length - 1 ? <span className="bc-sep">/</span> : null}
                  </span>
                ))}
              </div>
            ) : null}

            {kicker ? <div className="kicker">{kicker}</div> : null}
            <h1 className="page-hero-title">{title}</h1>
            {subtitle ? <p className="page-hero-sub">{subtitle}</p> : null}
          </div>

          {actions ? <div className="page-hero-actions">{actions}</div> : null}
        </div>
      </div>
    </section>
  )
}
