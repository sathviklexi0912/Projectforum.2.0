import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, Shuffle, Check, Compass, FileText, BadgeCheck, Search, Link2, Users, Building2, GraduationCap, Hourglass,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChallengeCard, { categoryColors, DifficultyBadge } from "@/components/ChallengeCard";
import EmptyState from "@/components/EmptyState";
import { burst } from "@/components/Interactions";
import { useAuth } from "@/context/AuthContext";
import usePageTitle from "@/lib/usePageTitle";
import { api, daysRemaining } from "@/lib/api";

/* ---------- hero: a deck of real briefs you can shuffle ---------- */
const POSE = [
  { s: 1, y: 0, z: 3, o: 1 },
  { s: 0.95, y: 22, z: 2, o: 0.9 },
  { s: 0.9, y: 42, z: 1, o: 0.75 },
];

function BriefDeck({ items }) {
  const navigate = useNavigate();
  const [order, setOrder] = useState([0, 1, 2]);
  const deck = items.slice(0, 3);

  const shuffle = (e) => {
    burst(e.currentTarget, 10);
    setOrder((o) => [o[1], o[2], o[0]]);
  };

  if (deck.length === 0) {
    return (
      <div className="pf-card p-8 text-center">
        <span className="pf-sticker">Briefs coming soon</span>
        <p className="mt-4 font-display text-xl">New challenges are being lined up with companies.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative h-[330px] sm:h-[340px] max-w-[460px] mx-auto">
        {deck.map((c, i) => {
          const pos = order.indexOf(i);
          const p = POSE[pos] || POSE[2];
          const [bg, fg] = categoryColors(c.category);
          const days = daysRemaining(c.deadline);
          return (
            <button
              type="button"
              key={c.id}
              onClick={() => (pos === 0 ? navigate(`/challenges/${c.id}`) : setOrder((o) => [i, ...o.filter((v) => v !== i)]))}
              className="pf-card absolute inset-x-0 top-0 text-left p-5 sm:p-6 flex flex-col gap-3 h-[280px] sm:h-[290px]"
              style={{
                transform: `translateY(${p.y}px) scale(${p.s})`,
                transformOrigin: "50% 100%",
                zIndex: p.z,
                opacity: p.o,
                transition: "transform .5s cubic-bezier(.3,1.2,.5,1), opacity .3s, box-shadow .2s",
                boxShadow: pos === 0 ? "var(--pf-shadow-lg)" : "var(--pf-shadow)",
              }}
              aria-label={pos === 0 ? `Open challenge: ${c.title}` : `Bring forward: ${c.title}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-md text-[.7rem] font-semibold uppercase tracking-[.07em]" style={{ background: bg, color: fg }}>
                  {c.category}
                </span>
                <DifficultyBadge difficulty={c.difficulty} />
              </div>
              <p className="font-display font-semibold text-[1.4rem] leading-[1.15] tracking-[-.025em]">{c.title}</p>
              <p className="text-sm font-semibold" style={{ color: "var(--pf-muted)" }}>{c.is_practice ? "Practice brief · by KIVO" : `Hosted by ${c.org}`}</p>
              <div className="flex flex-wrap gap-1.5">
                {(c.deliverables || []).slice(0, 3).map((d) => <span key={d} className="pf-tag">{d}</span>)}
              </div>
              <div className="mt-auto flex items-center justify-between pf-mono text-xs" style={{ color: "var(--pf-muted)", visibility: pos === 0 ? "visible" : "hidden" }}>
                <span className="inline-flex items-center gap-1.5"><Hourglass size={13} /> {days}d left · {c.est_time}</span>
                {pos === 0 && <span className="font-bold" style={{ color: "var(--pf-primary)" }}>Open →</span>}
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex justify-center mt-2">
        <button type="button" onClick={shuffle} className="pf-btn-secondary !py-2 !px-4 !text-sm" data-testid="shuffle-briefs">
          <Shuffle className="w-4 h-4" /> Next brief
        </button>
      </div>
    </div>
  );
}

const STEPS = [
  { icon: Compass, title: "Pick a brief", text: "Every challenge sets out a business problem, what to hand in and the rubric it's judged on." },
  { icon: FileText, title: "Do the work", text: "Submit your deck, model or repository with a short note on your approach." },
  { icon: BadgeCheck, title: "Get verified", text: "Your work is reviewed by the host, or by the KIVO team for practice briefs. Verified work goes on your profile with the reviewer's name." },
];

export default function Landing() {
  usePageTitle(null);
  const { user } = useAuth();
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("All");

  useEffect(() => {
    api.get("/challenges")
      .then((res) => setAll(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(all.map((c) => c.category).filter(Boolean)))], [all]);
  const shown = useMemo(() => (cat === "All" ? all : all.filter((c) => c.category === cat)).slice(0, 6), [all, cat]);
  const tickerItems = all.length ? [...all, ...all] : [];

  return (
    <div className="min-h-screen flex flex-col" data-testid="landing-page">
      <Navbar />

      <main className="flex-1">
        {/* ---------- HERO ---------- */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 md:pt-16 pb-14 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-10 items-center">
          <div className="pf-fade-up">
            <span className="pf-sticker">
              <span className="pf-dot" aria-hidden="true" /> Early access · Bengaluru
            </span>

            <h1 className="font-display text-[clamp(2.5rem,5.6vw,4.3rem)] mt-6 max-w-[16ch]">
              Prove your skills on <span className="pf-mark">real</span> business problems.
            </h1>

            <p className="mt-6 text-[1.12rem] max-w-[46ch]" style={{ color: "var(--pf-muted)" }}>
              KIVO connects people who want to show what they can do with organisations that have problems to solve. Complete a brief, get your work reviewed, and build a profile that speaks for you.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/challenges" className="pf-btn-primary !text-base !px-6 !py-3.5" data-testid="hero-explore-btn">
                Find a challenge <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/submit-challenge" className="pf-btn-secondary !text-base !px-6 !py-3.5" data-testid="hero-host-btn">
                Post a challenge
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium" style={{ color: "var(--pf-muted)" }}>
              {["Free to join", "Every submission reviewed", "One profile to share"].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <Check className="w-4 h-4" style={{ color: "var(--pf-ok)" }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="pf-fade-up" style={{ animationDelay: "150ms" }}>
            {loading ? <div className="h-[330px]" /> : <BriefDeck items={all} />}
          </div>
        </section>

        {/* ---------- TICKER (real challenge titles) ---------- */}
        {tickerItems.length > 0 && (
          <div className="pf-ticker" aria-label="Open challenges">
            <div className="pf-ticker-track py-3">
              {tickerItems.map((c, i) => (
                <Link key={`${c.id}-${i}`} to={`/challenges/${c.id}`} className="flex items-center gap-3 px-5 whitespace-nowrap text-[.92rem] font-medium hover:text-[var(--pf-primary)]" tabIndex={i >= all.length ? -1 : 0}>
                  <span className="pf-mono text-[.68rem] uppercase tracking-[.06em]" style={{ color: "var(--pf-muted)" }}>{c.category}</span>
                  {c.title}
                  <span style={{ color: "var(--pf-card-border)" }} aria-hidden="true">|</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ---------- HOW IT WORKS ---------- */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 md:pt-20">
          <div className="max-w-2xl" data-reveal>
            <span className="pf-kicker">How it works</span>
            <h2 className="font-display text-[clamp(2rem,4.2vw,3rem)] leading-[1.05] mt-2">Three steps from brief to proof.</h2>
          </div>
          <ol className="mt-9 grid md:grid-cols-3 gap-5">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={s.title} className="pf-card pf-lift p-6 relative" data-reveal={i}>
                  <div className="flex items-center justify-between">
                    <span className="w-11 h-11 rounded-lg grid place-items-center border" style={{ background: "var(--pf-tag-bg)", color: "var(--pf-primary)", borderColor: "var(--pf-card-border)" }}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="pf-mono text-sm font-semibold" style={{ color: "var(--pf-muted)" }} aria-hidden="true">Step {i + 1}</span>
                  </div>
                  <h3 className="font-display text-[1.35rem] mt-5">{s.title}</h3>
                  <p className="mt-1.5 text-[.95rem]" style={{ color: "var(--pf-muted)" }}>{s.text}</p>
                </li>
              );
            })}
          </ol>
        </section>

        {/* ---------- THE BOARD ---------- */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-24">
          <div className="flex flex-wrap items-end justify-between gap-5 mb-8" data-reveal>
            <div>
              <span className="pf-kicker">The board</span>
              <h2 className="font-display text-[clamp(2rem,4.2vw,3rem)] leading-[1.05] mt-2">What's open right now</h2>
            </div>
            {categories.length > 2 && (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
                {categories.map((c) => {
                  const on = cat === c;
                  const [bg, fg] = categoryColors(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCat(c)}
                      aria-pressed={on}
                      className="px-3.5 py-1.5 rounded-lg border text-[.88rem] font-semibold transition-colors"
                      style={
                        on
                          ? { background: c === "All" ? "var(--pf-primary)" : bg, color: c === "All" ? "var(--pf-on-primary)" : fg, borderColor: c === "All" ? "var(--pf-primary)" : fg }
                          : { color: "var(--pf-muted)", borderColor: "var(--pf-card-border)", background: "var(--pf-card-bg)" }
                      }
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => <div key={i} className="pf-card h-[300px] animate-pulse" style={{ opacity: 0.5 }} />)}
            </div>
          ) : shown.length === 0 ? (
            <EmptyState
              icon={Compass}
              title="New challenges are on the way"
              text="We're lining up the next briefs with companies. Create your profile now so you're ready when they go live."
              action={user ? "Go to your dashboard" : "Create your profile"}
              to={user ? "/dashboard" : "/signup"}
              testId="landing-empty"
            />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {shown.map((c, i) => (
                <div key={c.id} data-reveal={i % 3} className={`${i >= 3 ? "hidden md:flex" : "flex"} [&>a]:flex-1`}>
                  <ChallengeCard challenge={c} />
                </div>
              ))}
            </div>
          )}

          {all.length > 3 && (
            <div className="mt-8 flex justify-center">
              <Link to="/challenges" className={`pf-btn-secondary ${all.length > shown.length ? "" : "md:hidden"}`}>See all {all.length} challenges <ArrowRight className="w-4 h-4" /></Link>
            </div>
          )}
        </section>

        {/* ---------- TWO SIDES ---------- */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-24">
          <div className="max-w-2xl mb-9" data-reveal>
            <span className="pf-kicker">Who it's for</span>
            <h2 className="font-display text-[clamp(2rem,4.2vw,3rem)] leading-[1.05] mt-2">Built for both sides of hiring.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: GraduationCap, label: "Contributors", head: "Show what you can do, not just what you've studied.",
                sub: "Students, graduates, working professionals and career-switchers.",
                bg: "var(--pf-primary)", fg: "var(--pf-on-primary)",
                points: [[Compass, "Briefs built around real business problems"], [BadgeCheck, "Every submission reviewed, verified work signed by the reviewer"], [Link2, "One profile to share with any employer"]],
                cta: [user ? "Find a challenge" : "Create your profile", user ? "/challenges" : "/signup"],
              },
              {
                icon: Building2, label: "Organisations", head: "See how candidates think before the first interview.",
                sub: "Companies, startups, recruiters and hiring teams.",
                bg: "var(--pf-card-bg)", fg: "var(--pf-text)",
                points: [[FileText, "Post a problem your team actually has"], [Search, "Search people by skill, not by pedigree"], [Users, "Shortlist from completed, verified work"]],
                cta: ["Host a challenge", "/submit-challenge"],
              },
            ].map((side, i) => (
              <div key={side.label} className="pf-card p-7 sm:p-8 flex flex-col" style={{ background: side.bg, color: side.fg, borderColor: i ? "var(--pf-card-border)" : "var(--pf-primary)" }} data-reveal={i}>
                <span className="inline-flex items-center gap-2 pf-mono text-xs font-bold uppercase tracking-[.08em]" style={{ opacity: 0.85 }}>
                  <side.icon className="w-4 h-4" /> For {side.label.toLowerCase()}
                </span>
                <p className="font-display font-semibold text-[1.6rem] leading-[1.15] tracking-[-.025em] mt-3 max-w-[22ch]">{side.head}</p>
                <p className="mt-2 text-[.92rem]" style={{ opacity: 0.8 }}>{side.sub}</p>
                <ul className="mt-6 grid gap-2.5">
                  {side.points.map(([Icon, t]) => (
                    <li key={t} className="flex items-center gap-3 font-medium">
                      <span className="w-8 h-8 rounded-lg grid place-items-center" style={{ background: "color-mix(in srgb, currentColor 12%, transparent)" }}><Icon className="w-4 h-4" /></span>
                      {t}
                    </li>
                  ))}
                </ul>
                <Link
                  to={side.cta[1]}
                  className={`mt-8 self-start ${i ? "pf-btn-primary" : "pf-btn-secondary"}`}
                  style={i ? undefined : { borderColor: "transparent" }}
                >
                  {side.cta[0]} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- CLOSING ---------- */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-24">
          <div className="pf-card p-8 sm:p-12 text-center relative overflow-hidden" style={{ background: "color-mix(in srgb, var(--pf-primary) 13%, var(--pf-card-bg))", borderColor: "color-mix(in srgb, var(--pf-primary) 45%, transparent)" }} data-reveal>
            <h2 className="font-display text-[clamp(2rem,4.6vw,3.2rem)] leading-[1.06] max-w-[20ch] mx-auto">
              Start building a verified record of your work.
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to={user ? "/challenges" : "/signup"} className="pf-btn-primary !text-base !px-6 !py-3.5">
                {user ? "Browse challenges" : "Create a free profile"} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/submit-challenge" className="pf-btn-secondary !text-base !px-6 !py-3.5">
                Post a challenge
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
