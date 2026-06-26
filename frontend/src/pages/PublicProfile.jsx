import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Linkedin, GraduationCap, BookOpen, ExternalLink, BadgeCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, initialsFromName } from "@/lib/api";

export default function PublicProfile() {
  const { studentId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/profile/${studentId}`).then((r) => setData(r.data)).catch(() => setData(null)).finally(() => setLoading(false));
  }, [studentId]);

  if (loading) return <div className="App"><Navbar /><div className="text-center py-20" style={{ color: "var(--pf-muted)" }}>Loading…</div></div>;
  if (!data) return <div className="App"><Navbar /><div className="text-center py-20"><h2 className="font-display text-2xl font-extrabold">Profile not found</h2></div></div>;

  const u = data.user;
  return (
    <div className="App" data-testid="public-profile-page">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="pf-card p-8 lg:p-10 mb-8">
          <div className="flex flex-wrap items-center gap-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-display font-extrabold text-2xl text-white"
              style={{ background: "linear-gradient(135deg, var(--pf-secondary), var(--pf-primary))" }}>
              {initialsFromName(u.name)}
            </div>
            <div className="flex-1 min-w-[200px]">
              <h1 className="font-display text-4xl font-extrabold tracking-tighter mb-1">{u.name}</h1>
              {u.headline && (
                <div className="text-base font-semibold mb-2" style={{ color: "var(--pf-secondary)" }} data-testid="public-headline">
                  {u.headline}
                </div>
              )}
              {(u.university || u.location) && (
                <div className="text-sm inline-flex items-center gap-1.5 flex-wrap" style={{ color: "var(--pf-muted)" }}>
                  <GraduationCap size={14}/>
                  {u.university && <span>{u.university}</span>}
                  {u.university && u.location && <span>·</span>}
                  {u.location && <span data-testid="public-location">{u.location}</span>}
                  {u.degree && <span>· {u.degree}</span>}
                  {u.year && <span>· {u.year} year</span>}
                </div>
              )}
              {u.linkedin && (
                <a href={u.linkedin} target="_blank" rel="noreferrer" className="pf-link text-sm inline-flex items-center gap-1.5 mt-2" data-testid="profile-linkedin">
                  <Linkedin size={14}/> LinkedIn
                </a>
              )}
            </div>
          </div>
          {u.bio && (
            <p
              className="mt-5 text-base leading-relaxed max-w-3xl"
              style={{ color: "var(--pf-text)" }}
              data-testid="public-bio"
            >
              {u.bio}
            </p>
          )}
          {u.skills?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2" data-testid="profile-skills">
              {u.skills.map((s) => <span key={s} className="pf-tag">{s}</span>)}
            </div>
          )}
        </div>

        <section className="mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tighter mb-5">Completed challenges</h2>
          {data.completed_challenges.length === 0 ? (
            <div className="pf-card p-8 text-center text-sm" style={{ color: "var(--pf-muted)" }}>No completed challenges yet.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {data.completed_challenges.map((s) => (
                <div key={s.id} className="pf-card p-6" data-testid={`completed-${s.id}`}>
                  <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                    <span className="pf-tag">{s.challenge_org}</span>
                    <div className="flex items-center gap-2">
                      {s.verified && (
                        <span
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                          style={{ background: "#DBF5E5", color: "#1F6B3B" }}
                          title={`${s.verifier_name} · ${s.verifier_title}`}
                          data-testid={`verified-badge-${s.id}`}
                        >
                          <BadgeCheck size={12}/> Verified
                        </span>
                      )}
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--pf-primary)" }}>{s.status}</span>
                    </div>
                  </div>
                  <h3 className="font-display font-extrabold text-lg mb-2">{s.challenge_title}</h3>
                  {s.verified && (
                    <div className="text-xs mb-2" style={{ color: "var(--pf-muted)" }} data-testid={`verifier-${s.id}`}>
                      Endorsed by <span className="font-semibold" style={{ color: "var(--pf-secondary)" }}>{s.verifier_name}</span> · {s.verifier_title}
                    </div>
                  )}
                  {s.submission_link && (
                    <a href={s.submission_link} target="_blank" rel="noreferrer" className="pf-link text-sm inline-flex items-center gap-1.5">
                      <ExternalLink size={14}/> View work
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tighter mb-5">Projects showcase</h2>
          {data.projects.length === 0 ? (
            <div className="pf-card p-8 text-center text-sm" style={{ color: "var(--pf-muted)" }}>No projects added yet.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.projects.map((p) => (
                <div key={p.id} className="pf-card p-6" data-testid={`project-${p.id}`}>
                  <span className="pf-tag mb-3 inline-block">{p.category}</span>
                  <h3 className="font-display font-extrabold text-lg mb-2">{p.title}</h3>
                  <p className="text-sm mb-3" style={{ color: "var(--pf-muted)" }}>{p.description}</p>
                  <div className="text-xs mb-3 inline-flex items-center gap-1.5" style={{ color: "var(--pf-muted)" }}>
                    <BookOpen size={12}/> Completed {p.date_completed}
                  </div>
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noreferrer" className="pf-link text-sm inline-flex items-center gap-1.5">
                      <ExternalLink size={14}/> View project
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
