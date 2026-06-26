import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Calendar, Clock, Building2, CheckCircle2, ListChecks } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DifficultyBadge } from "@/components/ChallengeCard";
import { api, daysRemaining, initialsFromName } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ChallengeDetail() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/challenges/${id}`).then((r) => setC(r.data)).catch(() => setC(null)).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="App"><Navbar /><div className="max-w-4xl mx-auto px-6 py-20 text-center" style={{ color: "var(--pf-muted)" }}>Loading…</div></div>
    );
  }
  if (!c) {
    return (
      <div className="App"><Navbar />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h2 className="font-display text-3xl font-extrabold mb-3">Challenge not found</h2>
          <Link to="/challenges" className="pf-link">Back to all challenges</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(`/submit/${c.id}`)}`);
    } else {
      navigate(`/submit/${c.id}`);
    }
  };

  return (
    <div className="App" data-testid="challenge-detail-page">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <Link to="/challenges" className="pf-link text-sm mb-4 inline-block">← Back to challenges</Link>

        <div className="pf-card p-8 lg:p-10 mb-8">
          <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center font-display font-bold text-white"
                style={{ background: "linear-gradient(135deg, var(--pf-secondary), var(--pf-primary))" }}>
                {initialsFromName(c.org)}
              </div>
              <div>
                <div className="text-sm font-semibold inline-flex items-center gap-2"><Building2 size={14}/> {c.org}</div>
                <span className="pf-tag mt-1.5 inline-block">{c.category}</span>
              </div>
            </div>
            <DifficultyBadge difficulty={c.difficulty} />
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tighter mb-5" data-testid="challenge-title">{c.title}</h1>

          <div className="flex flex-wrap gap-5 text-sm mb-6" style={{ color: "var(--pf-muted)" }}>
            <span className="inline-flex items-center gap-1.5"><Calendar size={14}/> {daysRemaining(c.deadline)} days left</span>
            <span className="inline-flex items-center gap-1.5"><Clock size={14}/> {c.est_time}</span>
            {c.tags?.length > 0 && (
              <span>· {c.tags.join(" · ")}</span>
            )}
          </div>

          <section className="mb-7">
            <h3 className="font-display font-extrabold text-xl mb-3">Problem statement</h3>
            <p className="leading-relaxed" data-testid="problem-statement">{c.problem_statement}</p>
          </section>

          <section className="mb-7">
            <h3 className="font-display font-extrabold text-xl mb-3 inline-flex items-center gap-2">
              <ListChecks size={20}/> Deliverables
            </h3>
            <ul className="space-y-2">
              {c.deliverables.map((d, i) => (
                <li key={i} className="flex gap-2.5 items-start text-sm">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: "var(--pf-primary)" }}/>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-2">
            <h3 className="font-display font-extrabold text-xl mb-3">Evaluation rubric</h3>
            <ul className="space-y-2">
              {c.rubric.map((r, i) => (
                <li key={i} className="flex gap-2.5 items-start text-sm">
                  <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: "var(--pf-secondary)" }}/>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <button onClick={handleSubmit} className="pf-btn-primary w-full sm:w-auto" data-testid="submit-work-btn">
          Submit your work
        </button>
      </main>
      <Footer />
    </div>
  );
}
