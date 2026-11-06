import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, Building2, Tag, ArrowLeft, CheckCircle2, Award, ExternalLink, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
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

  return (
    <div className="min-h-screen flex flex-col" data-testid="challenge-detail-page">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-6 lg:px-10 py-12 w-full">
        <Link to="/challenges" className="pf-link text-sm inline-flex items-center gap-1.5 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Browse Challenges
        </Link>

        {/* Header Banner */}
        <div className="pf-card p-8 sm:p-10 mb-10 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="pf-tag">{challenge.category}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold pf-badge-${challenge.difficulty?.toLowerCase()}`}>
                {challenge.difficulty}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold" style={{ color: "var(--pf-muted)" }}>
              <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[var(--pf-primary)]" /> {daysLeft} days remaining</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4 text-[var(--pf-secondary)]" /> {challenge.est_time}</span>
            </div>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            {challenge.title}
          </h1>

          <p className="text-base font-semibold flex items-center gap-2 mb-6" style={{ color: "var(--pf-muted)" }}>
            <Building2 className="w-4 h-4 text-[var(--pf-primary)]" /> Hosted by <span className="text-[var(--pf-text)] font-bold">{challenge.org}</span>
          </p>

          <p className="text-base leading-relaxed max-w-3xl mb-8" style={{ color: "var(--pf-muted)" }}>
            {challenge.description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[var(--pf-card-border)]">
            <div className="flex flex-wrap gap-2">
              {challenge.tags?.map((t) => (
                <span key={t} className="text-xs px-2.5 py-1 rounded-md font-medium" style={{ background: "var(--pf-tag-bg)", color: "var(--pf-tag-text)" }}>
                  #{t}
                </span>
              ))}
            </div>

            {challenge.is_closed ? (
              <span
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-[10px] border"
                style={{ borderColor: "var(--pf-card-border)", color: "var(--pf-muted)", background: "var(--pf-tag-bg)" }}
                data-testid="challenge-closed"
              >
                This challenge is closed
              </span>
            ) : (
              <Link
                to={`/submit/${challenge.id}`}
                className="pf-btn-primary text-sm py-3 px-6 shadow-md"
                data-testid="submit-solution-btn"
              >
                <Send className="w-4 h-4" />
                <span>Submit Solution</span>
              </Link>
            )}
          </div>
        </div>

        {/* Challenge Breakdown */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section className="pf-card p-8">
              <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
                <span>Problem Statement</span>
              </h2>
              <div className="prose prose-slate dark:prose-invert text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--pf-text)" }}>
                {challenge.problem_statement || challenge.description}
              </div>
            </section>

            <section className="pf-card p-8">
              <h2 className="font-display text-2xl font-bold mb-4">Required Deliverables</h2>
              <ul className="space-y-3 text-sm">
                {challenge.deliverables?.map((del, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[var(--pf-primary)] shrink-0 mt-0.5" />
                    <span>{del}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Right Evaluation Rubric Sidebar */}
          <div className="space-y-6">
            <section className="pf-card p-6">
              <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[var(--pf-secondary)]" />
                <span>Evaluation Rubric</span>
              </h3>
              <ul className="space-y-2.5 text-xs">
                {challenge.rubric?.map((rub, idx) => (
                  <li key={idx} className="p-3 rounded-xl border border-[var(--pf-card-border)] bg-[var(--pf-bg)] font-medium">
                    {rub}
                  </li>
                ))}
              </ul>
            </section>

            <section className="pf-card p-6 text-center">
              <h4 className="font-display text-lg font-bold mb-2">Ready to submit?</h4>
              <p className="text-xs mb-4" style={{ color: "var(--pf-muted)" }}>
                Submit your pitch, deck link, or code repository to get evaluated.
              </p>
              <Link to={`/submit/${challenge.id}`} className="pf-btn-primary text-xs w-full py-2.5">
                Submit Project
              </Link>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
