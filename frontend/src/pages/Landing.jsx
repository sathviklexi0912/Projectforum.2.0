import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Target, Trophy, Sparkles, Zap, Brain, Calendar, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChallengeCard, { DifficultyBadge } from "@/components/ChallengeCard";
import { api, daysRemaining } from "@/lib/api";

export default function Landing() {
  const [challenges, setChallenges] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    api.get("/challenges").then((r) => setChallenges(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (challenges.length <= 1) return;
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActiveIdx((i) => (i + 1) % challenges.length);
        setFading(false);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [challenges.length]);

  const hero = challenges[activeIdx];

  return (
    <div className="App" data-testid="landing-page">
      <Navbar />
      <main>
        {/* HERO */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 pt-16 pb-24">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 pf-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full pf-tag mb-6" data-testid="hero-badge">
                <Sparkles size={14}/> Real challenges. Real shortlists.
              </div>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.95] tracking-tighter mb-6">
                Your work <span style={{ color: "var(--pf-primary)" }}>speaks louder</span> than your resume.
              </h1>
              <p className="text-lg sm:text-xl leading-relaxed max-w-2xl mb-8" style={{ color: "var(--pf-muted)" }}>
                ProjectForum is where students complete real business challenges posted by companies — and get fast-tracked
                straight to interviews based on the quality of their work.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/challenges" className="pf-btn-primary" data-testid="hero-browse-btn">
                  Browse Challenges <ArrowRight size={18}/>
                </Link>
                <Link to="/signup" className="pf-btn-secondary" data-testid="hero-getstarted-btn">
                  Get Started
                </Link>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm" style={{ color: "var(--pf-muted)" }}>
                <span><b style={{ color: "var(--pf-text)" }}>4,200+</b> students</span>
                <span><b style={{ color: "var(--pf-text)" }}>120+</b> companies</span>
                <span><b style={{ color: "var(--pf-text)" }}>1 in 4</b> interviewed</span>
              </div>
            </div>

            {/* Visual: rotating live challenge card + stat tiles */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4 pf-fade-up pf-delay-2">
              <div
                className="pf-card p-5 col-span-2 transition-opacity duration-300"
                style={{ opacity: fading ? 0 : 1, minHeight: 168 }}
                data-testid="hero-rotating-card"
              >
                {hero ? (
                  <Link to={`/challenges/${hero.id}`} className="block">
                    <div className="flex items-center justify-between mb-3">
                      <span className="pf-tag" data-testid="hero-card-category">{hero.category}</span>
                      <DifficultyBadge difficulty={hero.difficulty} />
                    </div>
                    <div className="text-sm font-semibold mb-1" data-testid="hero-card-org">{hero.org}</div>
                    <h3 className="font-display font-extrabold text-lg leading-snug mb-3 line-clamp-2" data-testid="hero-card-title">
                      {hero.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-xs" style={{ color: "var(--pf-muted)" }}>
                      <span className="inline-flex items-center gap-1.5" data-testid="hero-card-days">
                        <Calendar size={12}/> {daysRemaining(hero.deadline)} days left
                      </span>
                      <span className="inline-flex items-center gap-1.5" data-testid="hero-card-time">
                        <Clock size={12}/> {hero.est_time}
                      </span>
                    </div>
                    {challenges.length > 1 && (
                      <div className="flex gap-1.5 mt-4">
                        {challenges.map((_, i) => (
                          <span
                            key={i}
                            className="h-1 rounded-full transition-all duration-300"
                            style={{
                              width: i === activeIdx ? 20 : 6,
                              background: i === activeIdx ? "var(--pf-primary)" : "var(--pf-card-border)",
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </Link>
                ) : (
                  <div className="text-sm" style={{ color: "var(--pf-muted)" }}>Loading challenges…</div>
                )}
              </div>
              <div className="pf-card p-5">
                <div className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: "var(--pf-muted)" }}>Active</div>
                <div className="font-display text-4xl font-extrabold" style={{ color: "var(--pf-primary)" }}>{challenges.length || 0}</div>
                <div className="text-sm mt-1">Live challenges</div>
              </div>
              <div className="pf-card p-5">
                <div className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: "var(--pf-muted)" }}>Interview Rate</div>
                <div className="font-display text-4xl font-extrabold" style={{ color: "var(--pf-secondary)" }}>26%</div>
                <div className="text-sm mt-1">Top submissions</div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
          <div className="mb-12">
            <span className="pf-tag mb-3 inline-block">How it works</span>
            <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tighter max-w-2xl">
              Three steps to your next interview.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Target, title: "Pick a challenge", desc: "Browse real briefs from companies — marketing, finance, strategy, and more." },
              { icon: Brain, title: "Do the work", desc: "Spend a few hours building a portfolio-worthy submission with clear deliverables." },
              { icon: Trophy, title: "Get shortlisted", desc: "The best submissions get a direct interview path with the company team." },
            ].map((s, i) => (
              <div key={s.title} className={`pf-card p-7 pf-fade-up pf-delay-${i+1}`} data-testid={`how-step-${i+1}`}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: "var(--pf-tag-bg)", color: "var(--pf-secondary)" }}>
                  <s.icon size={22}/>
                </div>
                <div className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: "var(--pf-muted)" }}>Step {i+1}</div>
                <h3 className="font-display font-extrabold text-2xl mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--pf-muted)" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CHALLENGES PREVIEW */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="pf-tag mb-3 inline-block">Live challenges</span>
              <h2 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tighter">Real briefs, real companies.</h2>
            </div>
            <Link to="/challenges" className="pf-link inline-flex items-center gap-1" data-testid="see-all-challenges">
              See all challenges <ArrowRight size={16}/>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.slice(0, 3).map((c, i) => (
              <div key={c.id} className={`pf-fade-up pf-delay-${i+1}`}>
                <ChallengeCard challenge={c} />
              </div>
            ))}
            {challenges.length === 0 && (
              <div className="col-span-full text-center py-12" style={{ color: "var(--pf-muted)" }}>
                Loading challenges…
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
          <div className="pf-card p-10 lg:p-16 text-center" style={{ background: "var(--pf-tag-bg)", borderColor: "var(--pf-secondary)" }}>
            <Zap size={28} className="mx-auto mb-4" style={{ color: "var(--pf-primary)" }}/>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tighter mb-4">
              Stop applying. Start showing.
            </h2>
            <p className="max-w-2xl mx-auto mb-7 text-base sm:text-lg" style={{ color: "var(--pf-muted)" }}>
              Build your portfolio with work that matters. Companies see the output — not the cover letter.
            </p>
            <Link to="/signup" className="pf-btn-primary" data-testid="cta-get-started">
              Create your free account <ArrowRight size={18}/>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
