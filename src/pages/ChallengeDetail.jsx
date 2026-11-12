import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, CheckCircle2, Award, Send } from "lucide-react";
import { DifficultyBadge, HostLine, categoryColors } from "@/components/ChallengeCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, initialsFromName } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import usePageTitle from "@/lib/usePageTitle";

export default function ChallengeDetail() {
  const { id } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  usePageTitle(challenge?.title || "Challenge");

  useEffect(() => {
    setLoading(true);
    api.get(`/challenges/${id}`)
      .then((res) => setChallenge(res.data))
      .catch((err) => setError("Challenge not found or removed."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto px-6 py-16 w-full flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--pf-primary)]"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-5xl mx-auto px-6 py-16 w-full text-center">
          <p className="text-xl font-bold mb-4">{error || "Challenge not found"}</p>
          <Link to="/challenges" className="pf-btn-secondary">
            Back to All Challenges
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const deadlineDate = new Date(challenge.deadline);
  const daysLeft = Math.max(0, Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24)));
  const deadlineLabel = deadlineDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const fullBrief = challenge.problem_statement && challenge.problem_statement.trim() !== (challenge.description || "").trim()
    ? challenge.problem_statement
    : "";
  const reviewer = challenge.is_practice ? "the KIVO team" : challenge.org;

  const submitCta = challenge.is_closed ? (
    <span
      className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-5 py-3 rounded-[10px] border w-full"
      style={{ borderColor: "var(--pf-card-border)", color: "var(--pf-muted)", background: "var(--pf-tag-bg)" }}
      data-testid="challenge-closed"
    >
      This challenge is closed
    </span>
  ) : (
    <Link
      to={`/submit/${challenge.id}`}
      className="pf-btn-primary text-sm py-3 px-6 w-full justify-center"
      data-testid="submit-solution-btn"
    >
      <Send className="w-4 h-4" />
      <span>Submit your work</span>
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col" data-testid="challenge-detail-page">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-5 sm:px-6 lg:px-10 py-10 sm:py-12 w-full">
        <Link to="/challenges" className="pf-link text-sm inline-flex items-center gap-1.5 mb-8">
          <ArrowLeft className="w-4 h-4" /> All challenges
        </Link>

        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="px-2.5 py-1 rounded-md text-[.7rem] font-semibold uppercase tracking-[.07em]" style={{ background: categoryColors(challenge.category)[0], color: categoryColors(challenge.category)[1] }}>
              {challenge.category}
            </span>
            <DifficultyBadge difficulty={challenge.difficulty} />
            {challenge.is_practice && (
              <span className="px-2 py-0.5 rounded-md text-[10px] uppercase pf-mono border" style={{ borderColor: "var(--pf-card-border)", color: "var(--pf-muted)" }} data-testid="practice-badge">
                Practice
              </span>
            )}
          </div>

          <h1 className="font-display text-[2rem] sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.08] mb-4">
            {challenge.title}
          </h1>

          <div className="mb-5">
            <HostLine challenge={challenge} initials={initialsFromName(challenge.org)} />
          </div>

          <p className="text-[1.05rem] leading-relaxed max-w-3xl" style={{ color: "var(--pf-muted)" }}>
            {challenge.description}
          </p>

          {challenge.is_practice && (
            <p className="mt-4 text-sm max-w-3xl px-4 py-3 rounded-lg border" style={{ borderColor: "var(--pf-card-border)", color: "var(--pf-muted)", background: "var(--pf-tag-bg)" }} data-testid="practice-note">
              This is a practice brief written by KIVO. Any company named in it is fictional. Your work is reviewed by the KIVO team, and verified work still goes on your profile.
            </p>
          )}
        </header>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {/* Main column */}
          <div className="md:col-span-2 space-y-6 order-2 md:order-1">
            {fullBrief && (
              <section className="pf-card p-6 sm:p-8">
                <h2 className="font-display text-xl sm:text-2xl font-bold mb-3">The brief</h2>
                <p className="text-[.95rem] leading-relaxed whitespace-pre-line">{fullBrief}</p>
              </section>
            )}

            <section className="pf-card p-6 sm:p-8">
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-4">What to hand in</h2>
              <ul className="space-y-3 text-[.95rem]">
                {challenge.deliverables?.map((del, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[var(--pf-primary)] shrink-0 mt-0.5" />
                    <span>{del}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 pt-5 border-t text-sm" style={{ borderColor: "var(--pf-rule)", color: "var(--pf-muted)" }}>
                <strong className="text-[var(--pf-text)]">Format:</strong> one shareable link (Google Drive, Docs, Slides, Notion or GitHub) set to "anyone with the link can view", plus a short note on your approach.
              </p>
            </section>

            {challenge.rubric?.length > 0 && (
              <section className="pf-card p-6 sm:p-8">
                <h2 className="font-display text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-[var(--pf-secondary)]" /> How it's judged
                </h2>
                <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-[.95rem]">
                  {challenge.rubric.map((rub, idx) => (
                    <li key={idx} className="flex items-baseline gap-3">
                      <span className="pf-mono text-xs" style={{ color: "var(--pf-primary)" }}>{String(idx + 1).padStart(2, "0")}</span>
                      <span>{rub}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </div>

          {/* Sidebar: key facts + the one submit button */}
          <aside className="order-1 md:order-2">
            <div className="pf-card p-6 md:sticky md:top-24 space-y-5">
              <dl className="grid grid-cols-2 md:grid-cols-1 gap-4 text-sm">
                <div>
                  <dt className="pf-mono text-[.7rem] uppercase tracking-wider mb-1" style={{ color: "var(--pf-muted)" }}>Deadline</dt>
                  <dd className="font-semibold inline-flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[var(--pf-primary)]" />{deadlineLabel}</dd>
                  {!challenge.is_closed && <dd className="text-xs mt-0.5" style={{ color: "var(--pf-muted)" }}>{daysLeft} days left</dd>}
                </div>
                {challenge.est_time && (
                  <div>
                    <dt className="pf-mono text-[.7rem] uppercase tracking-wider mb-1" style={{ color: "var(--pf-muted)" }}>Time needed</dt>
                    <dd className="font-semibold inline-flex items-center gap-1.5"><Clock className="w-4 h-4 text-[var(--pf-secondary)]" />{challenge.est_time}</dd>
                  </div>
                )}
              </dl>

              {submitCta}

              <div className="pt-5 border-t" style={{ borderColor: "var(--pf-rule)" }}>
                <h3 className="text-sm font-bold mb-3">What happens next</h3>
                <ol className="space-y-2.5 text-sm" style={{ color: "var(--pf-muted)" }}>
                  <li className="flex gap-2.5"><span className="pf-mono text-xs mt-0.5" style={{ color: "var(--pf-primary)" }}>1</span>You submit a link and a short note.</li>
                  <li className="flex gap-2.5"><span className="pf-mono text-xs mt-0.5" style={{ color: "var(--pf-primary)" }}>2</span>It appears on your profile straight away as "Submitted".</li>
                  <li className="flex gap-2.5"><span className="pf-mono text-xs mt-0.5" style={{ color: "var(--pf-primary)" }}>3</span>Once {reviewer} reviews it, it's marked verified with the reviewer's name.</li>
                </ol>
              </div>

              {challenge.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {challenge.tags.map((t) => <span key={t} className="pf-tag">{t}</span>)}
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
