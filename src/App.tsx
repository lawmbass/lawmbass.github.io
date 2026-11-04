import { useEffect, useState, type CSSProperties, type PointerEvent } from 'react'
import { education, experience, profile, projects, skillGroups, socialLinks, training, work } from './data'
import PersonalProjects from './PersonalProjects'

// Skills is one scroll below Experience, so it stays out of the nav to leave room for Resume at 360-390px.
const nav = [
  { href: '#work', label: 'Work' },
  { href: '#side-projects', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#contact', label: 'Contact' },
]

declare const __BUILD_YEAR__: number

function ResumeLink({ className = 'btn btn-ghost' }: { className?: string }) {
  return (
    <a className={className} href={profile.resume} type="application/pdf">
      Resume (PDF)
    </a>
  )
}

/**
 * Scroll-reveal: a small upward slide for content that starts below the fold.
 * Transform only: nothing is ever hidden (no opacity 0), and it is skipped entirely
 * with reduced motion or without JS.
 */
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
            const el = e.target as HTMLElement
            el.classList.add('is-in')
            io.unobserve(el)
            // Once the staggered slide is done, drop the reveal classes so hover transitions are instant again.
            const i = Number(getComputedStyle(el).getPropertyValue('--i')) || 0
            window.setTimeout(() => el.classList.remove('will-reveal', 'is-in'), 900 + i * 90)
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

function SocialIcon({ id }: { id: (typeof socialLinks)[number]['id'] }) {
  if (id === 'github') {
    return (
      <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8"
        />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  )
}

function SocialLinks() {
  return (
    <ul className="socials">
      {socialLinks.map((s) => (
        <li key={s.id}>
          <a
            className="social-link"
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${s.label} (opens in a new tab)`}
          >
            <SocialIcon id={s.id} />
          </a>
        </li>
      ))}
    </ul>
  )
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
  const year = __BUILD_YEAR__

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
              <li>
                <a className="nav-resume" href={profile.resume} type="application/pdf">
                  Resume
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="hero wrap" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="pulse" aria-hidden="true" /> {profile.eyebrow}
            </p>
            <h1 id="hero-title">
              <span className="h1-line">Lawrence</span> <span className="h1-line grad">M. Bass</span>
            </h1>
            <p className="hero-tag">{profile.headline}</p>
            <p className="lede">{profile.summary}</p>
            <div className="cta">
              <a className="btn btn-primary" href="#work">
                See my work <span aria-hidden="true">→</span>
              </a>
              <ResumeLink />
              <a className="btn btn-ghost" href={`mailto:${profile.email}`}>
                Email me
              </a>
              <SocialLinks />
            </div>
          </div>

          <figure className="code-card" aria-label="Profile summary as a code snippet">
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
                {'  '}core: [<span className="s">'React'</span>, <span className="s">'TypeScript'</span>, <span className="s">'Node'</span>],{'\n'}
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
            <p className="kicker">01 — Work</p>
            <h2 id="work-title">Client work</h2>
            <p className="section-sub">{work.intro}</p>
          </div>
          <ol className="cards work-cards" role="list">
            {projects.map((p, i) => (
              <li
                key={p.id}
                className={`card work-${p.size}`}
                onPointerMove={glow}
                data-reveal
                style={{ '--i': i === 0 ? 0 : i - 1 } as CSSProperties}
              >
                <article aria-labelledby={`${p.id}-t`}>
                  <div className="card-top">
                    <span className="card-num" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {p.context && <p className="card-ctx">{p.context}</p>}
                  </div>
                  <h3 id={`${p.id}-t`}>{p.title}</h3>
                  <p className="card-sum">{p.summary}</p>
                  {p.points && (
                    <ul className="card-points">
                      {p.points.map((pt) => (
                        <li key={pt}>{pt}</li>
                      ))}
                    </ul>
                  )}
                  <ul className="tags" aria-label="Technologies">
                    {p.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </article>
              </li>
            ))}
          </ol>
          <ul className="one-liners" role="list" data-reveal>
            {work.oneLiners.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <PersonalProjects />

        <section id="experience" className="section wrap" aria-labelledby="exp-title">
          <div className="section-head" data-reveal>
            <p className="kicker">03 — Experience</p>
            <h2 id="exp-title">Where I’ve worked</h2>
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
            <p className="kicker">04 — Skills</p>
            <h2 id="skills-title">Toolkit</h2>
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
            <p className="kicker">05 — Contact</p>
            <h2 id="contact-title">
              Hiring for a <span className="grad">senior frontend or full-stack</span> role?
            </h2>
            <p className="section-sub">Email is the best way to reach me.</p>
            <a className="email-link" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <div className="cta">
              <a className="btn btn-primary" href={`mailto:${profile.email}`}>
                Email me <span aria-hidden="true">→</span>
              </a>
              <CopyEmail />
              <ResumeLink />
              <SocialLinks />
            </div>
          </div>
        </section>
      </main>

      <footer className="footer wrap">
        <p>
          © {year} {profile.name} · Built with React and TypeScript, prerendered for speed.
        </p>
        <SocialLinks />
      </footer>
    </>
  )
}
