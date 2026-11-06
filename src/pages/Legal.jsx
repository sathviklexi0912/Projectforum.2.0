import { Fragment } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import usePageTitle from "@/lib/usePageTitle";
import { LAST_UPDATED } from "@/content/legal";

/* Renders **bold** segments inside a plain string. */
function Rich({ text }) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <Fragment key={i}>{p}</Fragment>
  );
}

export default function Legal({ doc, otherLink }) {
  usePageTitle(doc.title);
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 grid gap-10 lg:grid-cols-[230px_1fr]">
        <aside className="lg:sticky lg:top-24 self-start">
          <span className="pf-kicker">Legal</span>
          <nav className="mt-3 grid gap-1 text-sm" aria-label="On this page">
            {doc.sections.map((s, i) => (
              <a key={s.id} href={`#${s.id}`} className="py-1 hover:text-[var(--pf-primary)] transition-colors" style={{ color: "var(--pf-muted)" }}>
                {i + 1}. {s.title}
              </a>
            ))}
          </nav>
          {otherLink && (
            <Link to={otherLink.to} className="pf-link text-sm mt-4 inline-block">{otherLink.label} →</Link>
          )}
        </aside>

        <article className="min-w-0 max-w-[70ch]" data-testid="legal-page">
          <h1 className="font-display text-[clamp(2.2rem,5vw,3.2rem)]">{doc.title}</h1>
          <p className="pf-mono text-xs mt-2" style={{ color: "var(--pf-muted)" }}>Last updated {LAST_UPDATED}</p>
          <div className="mt-6 grid gap-4 text-[1.02rem] leading-relaxed">
            {doc.intro.map((t, i) => <p key={i}><Rich text={t} /></p>)}
          </div>

          {doc.sections.map((s, i) => (
            <section key={s.id} id={s.id} className="mt-10 scroll-mt-24">
              <h2 className="font-display text-[1.45rem] leading-tight">{i + 1}. {s.title}</h2>
              <div className="mt-3 grid gap-3 text-[1rem] leading-relaxed" style={{ color: "var(--pf-text)" }}>
                {s.body.map((b, j) =>
                  typeof b === "string" ? (
                    <p key={j}><Rich text={b} /></p>
                  ) : (
                    <ul key={j} className="grid gap-2 pl-5 list-disc marker:text-[var(--pf-primary)]">
                      {b.list.map((li, k) => <li key={k}><Rich text={li} /></li>)}
                    </ul>
                  )
                )}
              </div>
            </section>
          ))}
        </article>
      </main>
      <Footer />
    </div>
  );
}
