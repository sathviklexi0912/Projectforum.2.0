import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, Grid3x3, FileText, Briefcase, User, Plus, X, ExternalLink, Linkedin, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import ChallengeCard from "@/components/ChallengeCard";
import { api, formatApiError, initialsFromName } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "challenges", label: "Challenges", icon: Grid3x3 },
  { key: "submissions", label: "My Submissions", icon: FileText },
  { key: "projects", label: "My Projects", icon: Briefcase },
  { key: "profile", label: "My Profile", icon: User },
];

const STATUS_COLORS = {
  Submitted: { bg: "#EEEDFE", text: "#3C3489" },
  "Under Review": { bg: "#FFF4D6", text: "#7A5A00" },
  Shortlisted: { bg: "#D85A30", text: "#FFFFFF" },
  Rejected: { bg: "#FAECE7", text: "#712B13" },
};

const SKILLS = ["Marketing", "Finance", "Consulting", "Entrepreneurship", "Analytics", "HR", "Operations", "Strategy"];
const YEARS = ["1st", "2nd", "3rd", "Final", "Postgrad"];
const PROJECT_CATEGORIES = ["Marketing", "Finance", "Strategy", "Design", "Tech", "Other"];
const FILTERS = ["All", "Marketing", "Finance", "Strategy", "Entrepreneurship"];

function StatCard({ label, value, color, testId }) {
  return (
    <div className="pf-card p-5" data-testid={testId}>
      <div className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: "var(--pf-muted)" }}>{label}</div>
      <div className="font-display text-4xl font-extrabold" style={{ color }}>{value}</div>
    </div>
  );
}

function Sidebar({ active, onNavigate }) {
  return (
    <aside className="lg:w-60 lg:fixed lg:left-0 lg:top-[73px] lg:bottom-0 lg:border-r p-4 lg:px-5 lg:py-8"
      style={{ borderColor: "var(--pf-card-border)", background: "var(--pf-bg)" }}
      data-testid="dashboard-sidebar">
      <div className="text-xs uppercase tracking-wider font-bold mb-4 hidden lg:block" style={{ color: "var(--pf-muted)" }}>Workspace</div>
      <nav className="flex lg:flex-col gap-2 overflow-x-auto">
        {TABS.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              onClick={() => onNavigate(t.key)}
              data-testid={`tab-${t.key}`}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
              style={isActive
                ? { background: "var(--pf-primary)", color: "#fff" }
                : { color: "var(--pf-text)" }}
            >
              <t.icon size={16}/> {t.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

function OverviewTab({ user, submissions, recommended, navigate }) {
  const profileFields = ["name", "email", "university", "degree", "year", "linkedin", "skills"];
  const filled = profileFields.filter((k) => {
    const v = user?.[k];
    return Array.isArray(v) ? v.length > 0 : !!v;
  }).length;
  const profilePct = Math.round((filled / profileFields.length) * 100);
  const shortlisted = submissions.filter((s) => s.status === "Shortlisted").length;
  const firstName = (user?.name || "").split(" ")[0] || "there";

  return (
    <div className="space-y-8" data-testid="overview-tab">
      <div>
        <span className="pf-tag mb-3 inline-block">Dashboard</span>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tighter">Welcome back, {firstName}.</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Attempted" value={submissions.length} color="var(--pf-secondary)" testId="stat-attempted"/>
        <StatCard label="Submissions" value={submissions.length} color="var(--pf-primary)" testId="stat-submissions"/>
        <StatCard label="Shortlisted" value={shortlisted} color="var(--pf-primary)" testId="stat-shortlisted"/>
        <StatCard label="Profile %" value={`${profilePct}%`} color="var(--pf-secondary)" testId="stat-profile"/>
      </div>

      <div>
        <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tighter">Recommended for you</h2>
          <button onClick={() => navigate("challenges")} className="pf-link text-sm" data-testid="see-all-recommended">See all</button>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {recommended.slice(0, 4).map((c) => <ChallengeCard key={c.id} challenge={c} />)}
        </div>
      </div>
    </div>
  );
}

function ChallengesTab({ challenges, filter, setFilter }) {
  const filtered = filter === "All" ? challenges : challenges.filter((c) => c.category === filter);
  return (
    <div data-testid="challenges-tab">
      <h1 className="font-display text-4xl font-extrabold tracking-tighter mb-6">All challenges</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} data-testid={`dash-filter-${f.toLowerCase()}`}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={f === filter
              ? { background: "var(--pf-primary)", color: "#fff" }
              : { background: "transparent", border: "1px solid var(--pf-card-border)", color: "var(--pf-text)" }}>
            {f}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="pf-card p-10 text-center text-sm" style={{ color: "var(--pf-muted)" }}>No challenges in this category.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((c) => <ChallengeCard key={c.id} challenge={c} />)}
        </div>
      )}
    </div>
  );
}

function SubmissionsTab({ submissions, onDelete }) {
  return (
    <div data-testid="submissions-tab">
      <h1 className="font-display text-4xl font-extrabold tracking-tighter mb-6">My submissions</h1>
      {submissions.length === 0 ? (
        <div className="pf-card p-10 text-center" data-testid="no-submissions">
          <p className="mb-4" style={{ color: "var(--pf-muted)" }}>No submissions yet. Take on your first challenge.</p>
          <Link to="/challenges" className="pf-btn-primary">Browse challenges</Link>
        </div>
      ) : (
        <div className="pf-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: "var(--pf-tag-bg)" }}>
                <tr>
                  {["Challenge", "Company", "Date", "Status", "Link", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-display font-bold text-xs uppercase tracking-wider" style={{ color: "var(--pf-secondary)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => {
                  const sc = STATUS_COLORS[s.status] || STATUS_COLORS.Submitted;
                  return (
                    <tr key={s.id} className="border-t" style={{ borderColor: "var(--pf-card-border)" }} data-testid={`row-${s.id}`}>
                      <td className="px-5 py-4 font-semibold">{s.challenge_title}</td>
                      <td className="px-5 py-4" style={{ color: "var(--pf-muted)" }}>{s.challenge_org}</td>
                      <td className="px-5 py-4" style={{ color: "var(--pf-muted)" }}>{new Date(s.submitted_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                          style={{ background: sc.bg, color: sc.text }}>{s.status}</span>
                      </td>
                      <td className="px-5 py-4">
                        <a href={s.submission_link} target="_blank" rel="noreferrer" className="pf-link text-xs inline-flex items-center gap-1">
                          <ExternalLink size={12}/> View
                        </a>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => onDelete(s)}
                          className="inline-flex items-center gap-1 text-xs opacity-60 hover:opacity-100 hover:text-red-600 transition-colors"
                          data-testid={`delete-submission-${s.id}`}
                          title="Delete submission"
                        >
                          <Trash2 size={14}/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectsTab({ projects, onAdd, onDelete }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", link: "", category: "Marketing", date_completed: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onAdd(form);
      setOpen(false);
      setForm({ title: "", description: "", link: "", category: "Marketing", date_completed: "" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="projects-tab">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-4xl font-extrabold tracking-tighter">My projects</h1>
        <button onClick={() => setOpen(true)} className="pf-btn-primary" data-testid="add-project-btn">
          <Plus size={16}/> Add project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="pf-card p-10 text-center text-sm" style={{ color: "var(--pf-muted)" }} data-testid="no-projects">
          No projects yet. Showcase work you&#39;ve already built.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <div key={p.id} className="pf-card p-6" data-testid={`my-project-${p.id}`}>
              <div className="flex items-start justify-between mb-2">
                <span className="pf-tag">{p.category}</span>
                <button onClick={() => onDelete(p.id)} className="text-xs opacity-50 hover:opacity-100" title="Delete" data-testid={`delete-project-${p.id}`}>
                  <X size={14}/>
                </button>
              </div>
              <h3 className="font-display font-extrabold text-lg mb-2">{p.title}</h3>
              <p className="text-sm mb-3 line-clamp-3" style={{ color: "var(--pf-muted)" }}>{p.description}</p>
              <div className="text-xs mb-3" style={{ color: "var(--pf-muted)" }}>Completed {p.date_completed}</div>
              {p.link && (
                <a href={p.link} target="_blank" rel="noreferrer" className="pf-link text-sm inline-flex items-center gap-1.5">
                  <ExternalLink size={14}/> View project
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setOpen(false)}>
          <div className="pf-card p-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()} data-testid="add-project-modal">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-display text-2xl font-extrabold">Add project</h2>
              <button onClick={() => setOpen(false)} data-testid="close-project-modal"><X size={20}/></button>
            </div>
            <form onSubmit={save} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Title</label>
                <input className="pf-input" value={form.title} onChange={(e) => set("title", e.target.value)} data-testid="proj-title" required/>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Short description</label>
                <textarea rows={3} className="pf-input" value={form.description} onChange={(e) => set("description", e.target.value)} data-testid="proj-desc" required/>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Project link</label>
                <input type="url" className="pf-input" value={form.link} onChange={(e) => set("link", e.target.value)} data-testid="proj-link"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Category</label>
                  <select className="pf-input" value={form.category} onChange={(e) => set("category", e.target.value)} data-testid="proj-category">
                    {PROJECT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">Date completed</label>
                  <input type="month" className="pf-input" value={form.date_completed} onChange={(e) => set("date_completed", e.target.value)} data-testid="proj-date" required/>
                </div>
              </div>
              <button type="submit" disabled={saving} className="pf-btn-primary w-full" data-testid="save-project">
                {saving ? "Saving…" : "Save project"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileTab({ user, updateUser, submissions, projects }) {
  const [form, setForm] = useState({
    name: user.name || "", university: user.university || "", degree: user.degree || "",
    year: user.year || "", linkedin: user.linkedin || "", skills: user.skills || [],
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleSkill = (s) => set("skills", form.skills.includes(s) ? form.skills.filter(x => x !== s) : [...form.skills, s]);

  const profileFields = ["name", "email", "university", "degree", "year", "linkedin", "skills"];
  const filled = profileFields.filter((k) => {
    const v = k === "email" ? user.email : form[k];
    return Array.isArray(v) ? v.length > 0 : !!v;
  }).length;
  const pct = Math.round((filled / profileFields.length) * 100);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch("/auth/me", form);
      updateUser(data);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const completedSubs = submissions;

  const copyProfileLink = () => {
    const url = `${window.location.origin}/profile/${user.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Public profile link copied");
  };

  return (
    <div className="space-y-8" data-testid="profile-tab">
      <div>
        <h1 className="font-display text-4xl font-extrabold tracking-tighter mb-2">My profile</h1>
        <button onClick={copyProfileLink} className="pf-link text-sm inline-flex items-center gap-1.5" data-testid="copy-public-link">
          <Copy size={14}/> Copy public profile link
        </button>
      </div>

      <div className="pf-card p-7">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-extrabold text-xl text-white"
            style={{ background: "linear-gradient(135deg, var(--pf-secondary), var(--pf-primary))" }}>
            {initialsFromName(form.name || user.email)}
          </div>
          <div>
            <div className="font-display text-2xl font-extrabold">{form.name || "Unnamed"}</div>
            <div className="text-sm" style={{ color: "var(--pf-muted)" }}>{user.email}</div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Profile completion</span>
            <span className="font-bold" style={{ color: "var(--pf-primary)" }}>{pct}%</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: "var(--pf-card-border)" }}>
            <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: "var(--pf-primary)" }} data-testid="profile-progress"/>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Name</label>
            <input className="pf-input" value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="profile-name"/>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">University</label>
            <input className="pf-input" value={form.university} onChange={(e) => set("university", e.target.value)} data-testid="profile-university"/>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Degree</label>
            <input className="pf-input" value={form.degree} onChange={(e) => set("degree", e.target.value)} data-testid="profile-degree"/>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Year</label>
            <select className="pf-input" value={form.year} onChange={(e) => set("year", e.target.value)} data-testid="profile-year">
              <option value="">Select</option>
              {YEARS.map((y) => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium block mb-1.5">LinkedIn</label>
            <input className="pf-input" value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} data-testid="profile-linkedin"/>
          </div>
        </div>

        <div className="mt-5">
          <label className="text-sm font-medium block mb-2">Skills</label>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map((s) => {
              const active = form.skills.includes(s);
              return (
                <button key={s} onClick={() => toggleSkill(s)} type="button"
                  className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all"
                  data-testid={`profile-skill-${s.toLowerCase()}`}
                  style={active
                    ? { background: "var(--pf-primary)", color: "#fff", border: "1px solid var(--pf-primary)" }
                    : { background: "transparent", color: "var(--pf-text)", border: "1px solid var(--pf-card-border)" }}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={save} disabled={saving} className="pf-btn-primary mt-7" data-testid="save-profile">
          {saving ? "Saving…" : "Save profile"}
        </button>
      </div>

      <section>
        <h2 className="font-display text-2xl font-extrabold tracking-tighter mb-4">Completed challenges</h2>
        {completedSubs.length === 0 ? (
          <div className="pf-card p-7 text-center text-sm" style={{ color: "var(--pf-muted)" }}>Complete a challenge to feature it here.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {completedSubs.map((s) => (
              <div key={s.id} className="pf-card p-5">
                <div className="flex justify-between items-center mb-2">
                  <span className="pf-tag">{s.challenge_org}</span>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--pf-primary)" }}>{s.status}</span>
                </div>
                <div className="font-display font-extrabold">{s.challenge_title}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl font-extrabold tracking-tighter mb-4">Projects showcase</h2>
        {projects.length === 0 ? (
          <div className="pf-card p-7 text-center text-sm" style={{ color: "var(--pf-muted)" }}>Add projects in the My Projects tab.</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div key={p.id} className="pf-card p-5">
                <span className="pf-tag mb-2 inline-block">{p.category}</span>
                <div className="font-display font-extrabold mb-1">{p.title}</div>
                <p className="text-xs" style={{ color: "var(--pf-muted)" }}>{p.date_completed}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const { tab } = useParams();
  const navigate = useNavigate();
  const active = TABS.find((t) => t.key === tab) ? tab : "overview";

  const [challenges, setChallenges] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    api.get("/challenges").then((r) => setChallenges(r.data)).catch(() => {});
    api.get("/submissions/mine").then((r) => setSubmissions(r.data)).catch(() => {});
    api.get("/projects/mine").then((r) => setProjects(r.data)).catch(() => {});
  }, []);

  const navTo = (k) => navigate(`/dashboard/${k}`);

  const addProject = async (form) => {
    try {
      const { data } = await api.post("/projects", form);
      setProjects((p) => [data, ...p]);
      toast.success("Project added");
    } catch (err) {
      toast.error(formatApiError(err));
      throw err;
    }
  };

  const deleteProject = async (pid) => {
    try {
      await api.delete(`/projects/${pid}`);
      setProjects((p) => p.filter((x) => x.id !== pid));
      toast.success("Deleted");
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const deleteSubmission = async (s) => {
    if (!window.confirm(`Permanently delete your submission for "${s.challenge_title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/submissions/${s.id}`);
      setSubmissions((xs) => xs.filter((x) => x.id !== s.id));
      toast.success("Submission deleted");
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  if (!user) return null;

  return (
    <div className="App" data-testid="dashboard-page">
      <Navbar />
      <div className="lg:flex">
        <Sidebar active={active} onNavigate={navTo} />
        <main className="flex-1 lg:ml-60 px-6 lg:px-10 py-10">
          {active === "overview" && <OverviewTab user={user} submissions={submissions} recommended={challenges} navigate={navTo} />}
          {active === "challenges" && <ChallengesTab challenges={challenges} filter={filter} setFilter={setFilter} />}
          {active === "submissions" && <SubmissionsTab submissions={submissions} onDelete={deleteSubmission} />}
          {active === "projects" && <ProjectsTab projects={projects} onAdd={addProject} onDelete={deleteProject} />}
          {active === "profile" && <ProfileTab user={user} updateUser={updateUser} submissions={submissions} projects={projects} />}
        </main>
      </div>
    </div>
  );
}
