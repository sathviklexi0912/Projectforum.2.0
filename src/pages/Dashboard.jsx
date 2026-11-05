import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { LayoutDashboard, Grid3x3, FileText, Briefcase, User, Plus, X, ExternalLink, Linkedin, Copy, Trash2, Pencil, Lock, Link2, Search } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import ChallengeCard from "@/components/ChallengeCard";
import { api, formatApiError, initialsFromName, daysRemaining } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import usePageTitle from "@/lib/usePageTitle";

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
const FILTERS = ["All", "Marketing", "Finance", "Strategy", "Entrepreneurship", "Tech"];

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
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return challenges.filter((c) => {
      const matchesCategory = filter === "All" || c.category === filter;
      if (!matchesCategory) return false;

      if (!query.trim()) return true;

      const q = query.toLowerCase().trim();
      const matchesTitle = c.title?.toLowerCase().includes(q);
      const matchesDomain = c.category?.toLowerCase().includes(q);
      const matchesOrg = c.org?.toLowerCase().includes(q);
      const matchesDescription = c.description?.toLowerCase().includes(q);
      const matchesTags = Array.isArray(c.tags) && c.tags.some((tag) => tag.toLowerCase().includes(q));

      return matchesTitle || matchesDomain || matchesOrg || matchesDescription || matchesTags;
    });
  }, [challenges, filter, query]);

  return (
    <div data-testid="challenges-tab">
      <h1 className="font-display text-4xl font-extrabold tracking-tighter mb-6">All challenges</h1>

      <div className="space-y-4 mb-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--pf-muted)" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search challenges by title, skill tags, domain, company..."
            data-testid="dash-search-input"
            className="pf-input pl-10 pr-9 py-2.5 text-sm w-full rounded-xl"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" style={{ color: "var(--pf-muted)" }} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
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
      </div>

      {filtered.length === 0 ? (
        <div className="pf-card p-10 text-center text-sm" style={{ color: "var(--pf-muted)" }}>
          {query ? `No challenges found matching "${query}".` : "No challenges in this category."}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((c) => <ChallengeCard key={c.id} challenge={c} />)}
        </div>
      )}
    </div>
  );
}

function SubmissionsTab({ submissions, onDelete, challengesById, navigate }) {
  return (
    <div data-testid="submissions-tab">
      <h1 className="font-display text-4xl font-extrabold tracking-tighter mb-6">My submissions</h1>
      {submissions.length === 0 ? (
        <div className="pf-empty" data-testid="no-submissions">
          <h3 className="font-display">Nothing submitted yet</h3>
          <p className="mb-5">Pick a challenge that fits what you want to do next. Your first submission is the hardest one.</p>
          <Link to="/challenges" className="pf-btn-primary">Browse challenges</Link>
        </div>
      ) : (
        <div className="pf-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: "var(--pf-tag-bg)" }}>
                <tr>
                  {["Challenge", "Company", "Date", "Status", "Link", "Edit", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-display font-bold text-xs uppercase tracking-wider" style={{ color: "var(--pf-secondary)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => {
                  const sc = STATUS_COLORS[s.status] || STATUS_COLORS.Submitted;
                  const challenge = challengesById[s.challenge_id];
                  const canEdit = challenge ? daysRemaining(challenge.deadline) > 0 : false;
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
                        {canEdit ? (
                          <button
                            onClick={() => navigate(`/submit/${s.challenge_id}`)}
                            className="inline-flex items-center gap-1 text-xs font-semibold transition-colors hover:text-[var(--pf-primary)]"
                            style={{ color: "var(--pf-secondary)" }}
                            data-testid={`edit-submission-${s.id}`}
                          >
                            <Pencil size={14}/> Edit
                          </button>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-xs opacity-50 cursor-not-allowed"
                            title="Deadline passed"
                            data-testid={`locked-submission-${s.id}`}
                          >
                            <Lock size={14}/>
                          </span>
                        )}
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

function ProjectsTab({ projects, onAdd, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ title: "", description: "", link: "", category: "Marketing", date_completed: "" });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const isEdit = !!editTarget;
  const isLinked = isEdit && (!!editTarget.source_submission_id || !!editTarget.submission_linked);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ title: "", description: "", link: "", category: "Marketing", date_completed: "" });
    setOpen(true);
  };
  const openEdit = (p) => {
    setEditTarget(p);
    setForm({
      title: p.title || "",
      description: p.description || "",
      link: p.link || "",
      category: p.category || "Marketing",
      date_completed: p.date_completed || "",
    });
    setOpen(true);
  };
  const close = () => { setOpen(false); setEditTarget(null); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        const payload = isLinked
          ? { title: form.title, description: form.description, category: form.category }
          : form;
        await onUpdate(editTarget.id, payload);
      } else {
        await onAdd(form);
      }
      close();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="projects-tab">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-4xl font-extrabold tracking-tighter">My projects</h1>
        <button onClick={openCreate} className="pf-btn-primary" data-testid="add-project-btn">
          <Plus size={16}/> Add project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="pf-empty" data-testid="no-projects">
          <h3 className="font-display">No projects yet</h3>
          <p>Add work you've already built, like a work project, college project, internship deliverable or side project, so your profile isn't empty while you take on challenges.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <div key={p.id} className="pf-card p-6" data-testid={`my-project-${p.id}`}>
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="pf-tag">{p.category}</span>
                  {(p.source_submission_id || p.submission_linked) && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                      style={{ background: "#DBF5E5", color: "#1F6B3B" }}
                      title="Auto-linked from a challenge submission"
                      data-testid={`linked-badge-${p.id}`}
                    >
                      <Link2 size={10}/> Linked
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(p)}
                    className="text-xs opacity-60 hover:opacity-100"
                    title="Edit"
                    data-testid={`edit-project-${p.id}`}
                  >
                    <Pencil size={14}/>
                  </button>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="text-xs opacity-50 hover:opacity-100"
                    title="Delete"
                    data-testid={`delete-project-${p.id}`}
                  >
                    <X size={14}/>
                  </button>
                </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={close}>
          <div className="pf-card p-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()} data-testid="project-modal">
            <div className="flex justify-between items-center mb-5">
              <h2 className="font-display text-2xl font-extrabold">{isEdit ? "Edit project" : "Add project"}</h2>
              <button onClick={close} data-testid="close-project-modal"><X size={20}/></button>
            </div>
            {isLinked && (
              <div className="mb-4 px-3 py-2 rounded-lg text-xs" style={{ background: "var(--pf-tag-bg)", color: "var(--pf-secondary)" }} data-testid="linked-edit-note">
                This project is linked to a challenge submission. The link and completion date are managed in My Submissions.
              </div>
            )}
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
                <label className="text-sm font-medium block mb-1.5">
                  Project link {isLinked && <span className="text-[10px] uppercase tracking-wider ml-2" style={{ color: "var(--pf-muted)" }}>locked</span>}
                </label>
                <input
                  type="url"
                  className="pf-input"
                  value={form.link}
                  onChange={(e) => set("link", e.target.value)}
                  disabled={isLinked}
                  style={isLinked ? { opacity: 0.55, cursor: "not-allowed" } : undefined}
                  data-testid="proj-link"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-1.5">Category</label>
                  <select className="pf-input" value={form.category} onChange={(e) => set("category", e.target.value)} data-testid="proj-category">
                    {PROJECT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1.5">
                    Date completed {isLinked && <span className="text-[10px] uppercase tracking-wider ml-2" style={{ color: "var(--pf-muted)" }}>locked</span>}
                  </label>
                  <input
                    type="month"
                    className="pf-input"
                    value={form.date_completed}
                    onChange={(e) => set("date_completed", e.target.value)}
                    disabled={isLinked}
                    style={isLinked ? { opacity: 0.55, cursor: "not-allowed" } : undefined}
                    data-testid="proj-date"
                    required={!isEdit}
                  />
                </div>
              </div>
              <button type="submit" disabled={saving} className="pf-btn-primary w-full" data-testid="save-project">
                {saving ? "Saving…" : (isEdit ? "Save changes" : "Save project")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileTab({ user, submissions, projects, navigate }) {
  const profileFields = ["name", "email", "university", "degree", "year", "linkedin", "skills", "bio", "location", "headline"];
  const filled = profileFields.filter((k) => {
    const v = user[k];
    return Array.isArray(v) ? v.length > 0 : !!v;
  }).length;
  const pct = Math.round((filled / profileFields.length) * 100);

  const completedSubs = submissions;

  const copyProfileLink = () => {
    const url = `${window.location.origin}/profile/${user.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Public profile link copied");
  };

  return (
    <div className="space-y-8" data-testid="profile-tab">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="font-display text-4xl font-extrabold tracking-tighter mb-2">My profile</h1>
          <button onClick={copyProfileLink} className="pf-link text-sm inline-flex items-center gap-1.5" data-testid="copy-public-link">
            <Copy size={14}/> Copy public profile link
          </button>
        </div>
        <button
          onClick={() => navigate("/edit-profile")}
          className="pf-btn-primary"
          data-testid="edit-profile-btn"
        >
          <Pencil size={14}/> Edit profile
        </button>
      </div>

      <div className="pf-card p-7">
        <div className="flex items-center gap-5 mb-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-extrabold text-xl text-white"
            style={{ background: "linear-gradient(135deg, var(--pf-secondary), var(--pf-primary))" }}>
            {initialsFromName(user.name || user.email)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-2xl font-extrabold">{user.name || "Unnamed"}</div>
            {user.headline && (
              <div className="text-sm font-semibold mt-0.5" style={{ color: "var(--pf-secondary)" }} data-testid="profile-headline-display">{user.headline}</div>
            )}
            <div className="text-xs mt-1" style={{ color: "var(--pf-muted)" }}>{user.email}</div>
          </div>
        </div>

        {user.bio && (
          <p className="text-sm leading-relaxed mb-5" data-testid="profile-bio-display" style={{ color: "var(--pf-muted)" }}>{user.bio}</p>
        )}

        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm mb-5">
          {user.university && <div><span className="font-semibold">Institution:</span> <span style={{ color: "var(--pf-muted)" }}>{user.university}</span></div>}
          {user.location && <div data-testid="profile-location-display"><span className="font-semibold">Location:</span> <span style={{ color: "var(--pf-muted)" }}>{user.location}</span></div>}
          {user.degree && <div><span className="font-semibold">Degree:</span> <span style={{ color: "var(--pf-muted)" }}>{user.degree}</span></div>}
          {user.year && <div><span className="font-semibold">Year:</span> <span style={{ color: "var(--pf-muted)" }}>{user.year}</span></div>}
          {user.linkedin && (
            <div className="sm:col-span-2">
              <span className="font-semibold">LinkedIn:</span>{" "}
              <a href={user.linkedin} target="_blank" rel="noreferrer" className="pf-link inline-flex items-center gap-1"><Linkedin size={12}/> {user.linkedin}</a>
            </div>
          )}
        </div>

        {user.skills?.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {user.skills.map((s) => <span key={s} className="pf-tag" data-testid={`profile-skill-tag-${s.toLowerCase()}`}>{s}</span>)}
          </div>
        )}

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Profile completion</span>
            <span className="font-bold" style={{ color: "var(--pf-primary)" }}>{pct}%</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: "var(--pf-card-border)" }}>
            <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: "var(--pf-primary)" }} data-testid="profile-progress"/>
          </div>
        </div>
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
  usePageTitle("Dashboard");

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

  const updateProject = async (pid, payload) => {
    try {
      const { data } = await api.patch(`/projects/${pid}`, payload);
      setProjects((p) => p.map((x) => (x.id === pid ? data : x)));
      toast.success("Project updated");
    } catch (err) {
      toast.error(formatApiError(err));
      throw err;
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
          {active === "submissions" && <SubmissionsTab submissions={submissions} onDelete={deleteSubmission} challengesById={Object.fromEntries(challenges.map(c => [c.id, c]))} navigate={navigate} />}
          {active === "projects" && <ProjectsTab projects={projects} onAdd={addProject} onUpdate={updateProject} onDelete={deleteProject} />}
          {active === "profile" && <ProfileTab user={user} submissions={submissions} projects={projects} navigate={navigate} />}
        </main>
      </div>
    </div>
  );
}
