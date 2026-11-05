import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { User, GraduationCap, Linkedin, Award, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import usePageTitle from "@/lib/usePageTitle";

export default function PublicProfile() {
  const { student_id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  usePageTitle(profile?.user?.name ? `${profile.user.name}'s profile` : "Profile");

  useEffect(() => {
    setLoading(true);
    api.get(`/profile/${student_id}`)
      .then((res) => setProfile(res.data))
      .catch(() => setError("Profile not found"))
      .finally(() => setLoading(false));
  }, [student_id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--pf-primary)]"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-xl font-bold mb-4">{error || "Profile not found"}</p>
          <Link to="/talent" className="pf-btn-secondary">Browse Talent Directory</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const { user, completed_challenges, projects } = profile;

  return (
    <div className="min-h-screen flex flex-col" data-testid="public-profile-page">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-6 lg:px-10 py-12 w-full">
        {/* Profile Header */}
        <div className="pf-card p-8 sm:p-10 mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-[var(--pf-tag-bg)] text-[var(--pf-primary)] flex items-center justify-center font-bold text-3xl border-2 border-[var(--pf-primary)]">
                {user.name?.charAt(0) || "U"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-3xl font-extrabold">{user.name}</h1>
                  {(completed_challenges?.some((c) => c.verified) || projects?.some((p) => p.verified)) && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold" data-testid="verified-contributor-badge">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Contributor
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold mt-1" style={{ color: "var(--pf-muted)" }}>
                  {user.headline || "ProjectForum contributor"}
                </p>

                {(user.university || user.year) && (
                  <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: "var(--pf-muted)" }}>
                    <GraduationCap className="w-4 h-4 text-[var(--pf-secondary)]" />
                    {[user.university, user.degree, user.year].filter(Boolean).join(" • ")}
                  </p>
                )}
              </div>
            </div>

            {user.linkedin && (
              <a
                href={user.linkedin}
                target="_blank"
                rel="noreferrer"
                className="pf-btn-secondary text-xs py-2 px-4 inline-flex items-center gap-2"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn Profile</span>
              </a>
            )}
          </div>
        </div>

        {/* Portfolio Projects / Challenge Submissions */}
        <div className="space-y-8">
          <div>
            <span className="pf-tag mb-2 inline-block">Verified Work</span>
            <h2 className="font-display text-2xl font-bold">Completed Challenges & Projects</h2>
          </div>

          {projects && projects.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {projects.map((proj) => (
                <div key={proj.id} className="pf-card p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="pf-tag text-[10px]">{proj.category || "General"}</span>
                      {proj.verified && (
                        <span className="text-xs font-bold text-emerald-600 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Company Verified
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-xl font-bold mb-2">{proj.title}</h3>
                    <p className="text-xs leading-relaxed mb-4 line-clamp-3" style={{ color: "var(--pf-muted)" }}>
                      {proj.description || proj.explanation}
                    </p>
                    {proj.verified && proj.verifier_name && (
                      <div
                        className="mb-4 rounded-lg px-3 py-2 text-xs flex items-start gap-2"
                        style={{ background: "color-mix(in srgb, var(--pf-ok) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--pf-ok) 30%, transparent)" }}
                        data-testid={`verified-by-${proj.id}`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "var(--pf-ok)" }} />
                        <span>
                          Verified by <b>{proj.verifier_name}</b>
                          {proj.verifier_title ? <span style={{ color: "var(--pf-muted)" }}>, {proj.verifier_title}</span> : null}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[var(--pf-card-border)] flex items-center justify-between">
                    <span className="text-xs font-medium" style={{ color: "var(--pf-muted)" }}>
                      Org: {proj.org || "ProjectForum"}
                    </span>
                    {proj.link && (
                      <a
                        href={proj.link}
                        target="_blank"
                        rel="noreferrer"
                        className="pf-link text-xs inline-flex items-center gap-1"
                      >
                        View Deliverable <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="pf-empty">
              <h3 className="font-display">No projects on show yet</h3>
              <p>{user?.name ? user.name.split(" ")[0] : "This person"} hasn't added any work here yet. Completed challenges and projects will appear in this space.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
