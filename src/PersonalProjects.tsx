import type { CSSProperties, PointerEvent } from 'react'
import { personalProjects, sideProjectsIntro } from './personal'
import './personal.css'

function glow(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}

/** 02 — Side projects: Lawrence's own products, right after client work. */
export default function PersonalProjects() {
  return (
    <section id="side-projects" className="section wrap" aria-labelledby="side-title">
      <div className="section-head" data-reveal>
        <p className="kicker">02 — Side projects</p>
        <h2 id="side-title">Things I’ve built on my own time</h2>
        <p className="section-sub">{sideProjectsIntro}</p>
      </div>
      <ul className="cards pp-cards" role="list">
        {personalProjects.map((p, i) => (
          <li
            key={p.id}
            className={`card pp-card${p.featured ? ' pp-featured' : ''}`}
            onPointerMove={glow}
            data-reveal
            style={{ '--i': i % 2 } as CSSProperties}
          >
            <article aria-labelledby={`pp-${p.id}-t`}>
              <div className="card-top">
                <span className="pp-mark" aria-hidden="true">
                  {p.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase()}
                </span>
                <p className="card-ctx">{p.kind}</p>
                {p.live && (
                  <span className="pp-status">
                    <span className="pp-dot" aria-hidden="true" /> Live
                  </span>
                )}
              </div>
              <h3 id={`pp-${p.id}-t`}>{p.name}</h3>
              <p className="card-sum">{p.oneLiner}</p>
              <ul className="card-points">
                {p.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <ul className="tags" aria-label="Technologies">
                {p.stack.slice(0, 5).map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              {p.live && (
                <div className="pp-links">
                  <a className="pp-link pp-link-live" href={p.live} target="_blank" rel="noopener noreferrer">
                    Live site <span aria-hidden="true">↗</span>
                    <span className="sr-only">: {p.name} (opens in a new tab)</span>
                  </a>
                </div>
              )}
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
