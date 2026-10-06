import { useEffect, useState, type CSSProperties, type PointerEvent } from 'react'
import { education, experience, profile, projects, skillGroups, training } from './data'
import PersonalProjects from './PersonalProjects'

const nav = [
  { href: '#work', label: 'Work' },
  { href: '#built', label: 'Built' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
]

/** Scroll-reveal: content is fully visible without JS / with reduced motion. */
function useReveal() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) return
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const vh = window.innerHeight
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    for (const el of els) {
      // Only animate things that start below the fold; never hide what's already on screen.
      if (el.getBoundingClientRect().top > vh) {
        el.classList.add('will-reveal')
        io.observe(el)
      }
    }
    return () => io.disconnect()
  }, [])
}

function glow(e: PointerEvent<HTMLElement>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}

function CopyEmail() {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="btn btn-ghost"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(profile.email)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          window.location.href = `mailto:${profile.email}`
        }
      }}
    >
      {copied ? 'Copied ✓' : 'Copy email'}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Email address copied to clipboard' : ''}
      </span>
    </button>
  )
}

export default function App() {
  useReveal()
  const year = 2026

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="bg" aria-hidden="true">
        <div className="bg-grid" />
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
      </div>

      <header className="topbar">
        <div className="wrap topbar-inner">
          <a className="mark" href="#top">
            <span aria-hidden="true">LB</span>
            <span className="sr-only">Lawrence M. Bass, back to top</span>
          </a>
          <nav aria-label="Primary">
            <ul>
              {nav.map((n) => (
                <li key={n.href}>
                  <a href={n.href}>{n.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="hero wrap" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow intro" style={{ '--d': 0 } as CSSProperties}>
              <span className="pulse" aria-hidden="true" /> {profile.title}
            </p>
            <h1 id="hero-title" className="intro" style={{ '--d': 1 } as CSSProperties}>
              <span className="h1-line">Lawrence</span> <span className="h1-line grad">M. Bass</span>
            </h1>
            <p className="lede intro" style={{ '--d': 2 } as CSSProperties}>
              {profile.summary}
            </p>
            <div className="cta intro" style={{ '--d': 3 } as CSSProperties}>
              <a className="btn btn-primary" href="#work">
                View projects <span aria-hidden="true">→</span>
              </a>
              <a className="btn btn-ghost" href={`mailto:${profile.email}`}>
                Email me
              </a>
            </div>
          </div>

          <figure className="code-card intro" style={{ '--d': 4 } as CSSProperties} aria-label="Profile summary as a code snippet">
            <div className="code-head" aria-hidden="true">
              <span /> <span /> <span />
              <em>lawrence.ts</em>
            </div>
            <pre>
              <code>
                <span className="k">const</span> <span className="v">engineer</span> = {'{\n'}
                {'  '}name: <span className="s">'{profile.name}'</span>,{'\n'}
                {'  '}role: <span className="s">'{profile.title}'</span>,{'\n'}
                {'  '}experience: <span className="s">'11+ years'</span>,{'\n'}
                {'  '}core: [<span className="s">'React'</span>, <span className="s">'TypeScript'</span>, <span className="s">'Node.js'</span>],{'\n'}
                {'  '}focus: [{'\n'}
                {'    '}<span className="s">'planning & reporting UIs'</span>,{'\n'}
                {'    '}<span className="s">'API modernization'</span>,{'\n'}
                {'    '}<span className="s">'CI/test reliability'</span>,{'\n'}
                {'  '}],{'\n'}
                {'}'} <span className="k">satisfies</span> <span className="t">Senior</span>
              </code>
            </pre>
          </figure>
        </section>

        <section id="work" className="section wrap" aria-labelledby="work-title">
          <div className="section-head" data-reveal>
            <p className="kicker">01 — Selected work</p>
            <h2 id="work-title">Projects</h2>
            <p className="section-sub">
              Client work is described in general terms; no client names, data, or code are shown.
            </p>
          </div>
          <ol className="cards" role="list">
            {projects.map((p, i) => (
              <li key={p.id} className="card" onPointerMove={glow} data-reveal style={{ '--i': i % 2 } as CSSProperties}>
                <article aria-labelledby={`${p.id}-t`}>
                  <div className="card-top">
                    <span className="card-num" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="card-ctx">{p.context}</p>
                  </div>
                  <h3 id={`${p.id}-t`}>{p.title}</h3>
                  <p className="card-sum">{p.summary}</p>
                  <ul className="card-points">
                    {p.points.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>
                  {p.note && <p className="card-note">{p.note}</p>}
                  <ul className="tags" aria-label="Technologies">
                    {p.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </article>
              </li>
            ))}
          </ol>
        </section>

        <PersonalProjects />

        <section id="experience" className="section wrap" aria-labelledby="exp-title">
          <div className="section-head" data-reveal>
            <p className="kicker">02 — Career</p>
            <h2 id="exp-title">Experience</h2>
          </div>
          <div className="exp-grid">
            <ol className="timeline">
              {experience.map((x) => (
                <li key={x.org} data-reveal>
                  <p className="tl-dates">{x.dates}</p>
                  <h3>
                    {x.role} <span className="tl-org">· {x.org}</span>
                  </h3>
                  {x.detail && <p className="tl-detail">{x.detail}</p>}
                </li>
              ))}
            </ol>
            <aside className="side" aria-label="Education and training">
              <div className="panel" data-reveal>
                <h3 className="panel-title">Education</h3>
                <p className="panel-main">{education.degree}</p>
                <p className="panel-meta">
                  {education.school} · {education.dates}
                </p>
              </div>
              <div className="panel" data-reveal>
                <h3 className="panel-title">Training</h3>
                <ul className="tags tags-soft">
                  {training.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <section id="skills" className="section wrap" aria-labelledby="skills-title">
          <div className="section-head" data-reveal>
            <p className="kicker">03 — Toolkit</p>
            <h2 id="skills-title">Skills</h2>
          </div>
          <dl className="skills" data-reveal>
            {skillGroups.map((g) => (
              <div key={g.label} className="skill-group">
                <dt>{g.label}</dt>
                <dd>
                  <ul className="chips">
                    {g.items.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="contact" className="section wrap" aria-labelledby="contact-title">
          <div className="contact" data-reveal onPointerMove={glow}>
            <p className="kicker">04 — Contact</p>
            <h2 id="contact-title">
              Let’s build something <span className="grad">great</span>.
            </h2>
            <p className="section-sub">
              Open to Senior frontend and full-stack roles. The best way to reach me is email.
            </p>
            <a className="email-link" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <div className="cta">
              <a className="btn btn-primary" href={`mailto:${profile.email}`}>
                Send an email <span aria-hidden="true">→</span>
              </a>
              <CopyEmail />
            </div>
          </div>
        </section>
      </main>

      <footer className="footer wrap">
        <p>
          © {year} {profile.name}
        </p>
        <p>Built with React + TypeScript.</p>
      </footer>
    </>
  )
}
