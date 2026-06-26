import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, X, ExternalLink, LogOut, ShieldCheck, BadgeCheck, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { api, formatApiError } from "@/lib/api";

const STATUSES = ["Submitted", "Under Review", "Shortlisted", "Rejected"];
const STATUS_COLORS = {
  Submitted: { bg: "#EEEDFE", text: "#3C3489" },
  "Under Review": { bg: "#FFF4D6", text: "#7A5A00" },
  Shortlisted: { bg: "#D85A30", text: "#FFFFFF" },
  Rejected: { bg: "#FAECE7", text: "#712B13" },
};

function AdminLogin({ onLogin }) {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/admin/login", { password: pw });
      localStorage.setItem("pf_admin_password", pw);
      toast.success("Admin access granted");
      onLogin();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-6 py-20" data-testid="admin-login">
      <span className="pf-tag mb-3 inline-block">Admin</span>
      <h1 className="font-display text-4xl font-extrabold tracking-tighter mb-2">Admin sign-in</h1>
      <p className="text-sm mb-6" style={{ color: "var(--pf-muted)" }}>Enter the admin password to manage submissions and pending challenges.</p>
      <form onSubmit={submit} className="pf-card p-8 space-y-5">
        <div>
          <label className="text-sm font-medium block mb-1.5">Admin password</label>
          <input type="password" className="pf-input" value={pw} onChange={(e) => setPw(e.target.value)} data-testid="admin-password" required/>
        </div>
        <button type="submit" disabled={loading} className="pf-btn-primary w-full" data-testid="admin-login-submit">
          {loading ? "Verifying…" : "Sign in"}
        </button>
        <p className="text-xs text-center" style={{ color: "var(--pf-muted)" }}>Default password: <code>admin123</code></p>
      </form>
    </main>
  );
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("submissions");
  const [submissions, setSubmissions] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([
        api.get("/admin/submissions"),
        api.get("/admin/pending-challenges"),
      ]);
      setSubmissions(s.data);
      setPending(p.data);
      setAuthed(true);
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem("pf_admin_password");
        setAuthed(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("pf_admin_password")) load();
  }, []);

  const logout = () => {
    localStorage.removeItem("pf_admin_password");
    setAuthed(false);
    setSubmissions([]);
    setPending([]);
  };

  const updateStatus = async (sid, status) => {
    try {
      await api.patch(`/admin/submissions/${sid}`, { status });
      setSubmissions((xs) => xs.map((x) => x.id === sid ? { ...x, status } : x));
      toast.success("Status updated");
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const approve = async (pid) => {
    try {
      await api.post(`/admin/pending-challenges/${pid}/approve`);
      setPending((xs) => xs.filter((x) => x.id !== pid));
      toast.success("Approved & published");
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const reject = async (pid) => {
    try {
      await api.delete(`/admin/pending-challenges/${pid}`);
      setPending((xs) => xs.filter((x) => x.id !== pid));
      toast.success("Rejected");
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const [verifyTarget, setVerifyTarget] = useState(null); // submission obj or null
  const [verifierName, setVerifierName] = useState("");
  const [verifierTitle, setVerifierTitle] = useState("");
  const [verifying, setVerifying] = useState(false);

  const openVerify = (sub) => {
    setVerifyTarget(sub);
    setVerifierName(sub.verifier_name || "");
    setVerifierTitle(sub.verifier_title || "");
  };
  const closeVerify = () => {
    setVerifyTarget(null);
    setVerifierName("");
    setVerifierTitle("");
  };

  const submitVerify = async (e) => {
    e.preventDefault();
    if (!verifyTarget) return;
    setVerifying(true);
    try {
      await api.post(`/admin/submissions/${verifyTarget.id}/verify`, {
        verifier_name: verifierName,
        verifier_title: verifierTitle,
      });
      setSubmissions((xs) => xs.map((x) =>
        x.id === verifyTarget.id
          ? { ...x, verified: true, verifier_name: verifierName, verifier_title: verifierTitle }
          : x
      ));
      toast.success("Submission verified");
      closeVerify();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setVerifying(false);
    }
  };

  const unverify = async (sid) => {
    try {
      await api.delete(`/admin/submissions/${sid}/verify`);
      setSubmissions((xs) => xs.map((x) =>
        x.id === sid ? { ...x, verified: false, verifier_name: "", verifier_title: "" } : x
      ));
      toast.success("Verification removed");
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  const deleteSubmission = async (s) => {
    if (!window.confirm(`Permanently delete ${s.student_name}'s submission for "${s.challenge_title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/submissions/${s.id}`);
      setSubmissions((xs) => xs.filter((x) => x.id !== s.id));
      toast.success("Submission deleted");
    } catch (err) {
      toast.error(formatApiError(err));
    }
  };

  if (!authed) {
    return (
      <div className="App" data-testid="admin-page-login">
        <Navbar />
        <AdminLogin onLogin={load} />
      </div>
    );
  }

  return (
    <div className="App" data-testid="admin-page">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-3">
          <div>
            <span className="pf-tag mb-3 inline-block">Admin</span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tighter">Control room</h1>
          </div>
          <button onClick={logout} className="pf-btn-secondary" data-testid="admin-logout">
            <LogOut size={16}/> Sign out
          </button>
        </div>

        <div className="flex gap-2 mb-6 border-b" style={{ borderColor: "var(--pf-card-border)" }}>
          {[
            { k: "submissions", l: `Submissions (${submissions.length})` },
            { k: "pending", l: `Pending challenges (${pending.length})` },
          ].map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)} data-testid={`admin-tab-${t.k}`}
              className="px-5 py-3 font-display font-bold transition-colors"
              style={{
                color: tab === t.k ? "var(--pf-primary)" : "var(--pf-muted)",
                borderBottom: `3px solid ${tab === t.k ? "var(--pf-primary)" : "transparent"}`,
                marginBottom: "-1px",
              }}>
              {t.l}
            </button>
          ))}
        </div>

        {loading && <div className="text-center py-10" style={{ color: "var(--pf-muted)" }}>Loading…</div>}

        {tab === "submissions" && !loading && (
          <div className="pf-card overflow-hidden" data-testid="admin-submissions-table">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead style={{ background: "var(--pf-tag-bg)" }}>
                  <tr>
                    {["Student", "University", "Challenge", "Link", "Date", "Status", "Verify", ""].map((h) => (
                      <th key={h} className="text-left px-5 py-3 font-display font-bold text-xs uppercase tracking-wider" style={{ color: "var(--pf-secondary)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {submissions.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-12 text-sm" style={{ color: "var(--pf-muted)" }}>No submissions yet.</td></tr>
                  )}
                  {submissions.map((s) => {
                    const sc = STATUS_COLORS[s.status] || STATUS_COLORS.Submitted;
                    return (
                      <tr key={s.id} className="border-t" style={{ borderColor: "var(--pf-card-border)" }} data-testid={`admin-sub-${s.id}`}>
                        <td className="px-5 py-4 font-semibold">{s.student_name}</td>
                        <td className="px-5 py-4 text-xs" style={{ color: "var(--pf-muted)" }}>{s.student_university}</td>
                        <td className="px-5 py-4">{s.challenge_title}<br/><span className="text-xs" style={{ color: "var(--pf-muted)" }}>{s.challenge_org}</span></td>
                        <td className="px-5 py-4">
                          <a href={s.submission_link} target="_blank" rel="noreferrer" className="pf-link text-xs inline-flex items-center gap-1" data-testid={`admin-link-${s.id}`}>
                            <ExternalLink size={12}/> Open
                          </a>
                        </td>
                        <td className="px-5 py-4 text-xs" style={{ color: "var(--pf-muted)" }}>{new Date(s.submitted_at).toLocaleDateString()}</td>
                        <td className="px-5 py-4">
                          <select
                            value={s.status}
                            onChange={(e) => updateStatus(s.id, e.target.value)}
                            data-testid={`admin-status-${s.id}`}
                            className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider cursor-pointer border-none outline-none"
                            style={{ background: sc.bg, color: sc.text }}
                          >
                            {STATUSES.map((st) => <option key={st} value={st} style={{ background: "#fff", color: "#000" }}>{st}</option>)}
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          {s.verified ? (
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                                style={{ background: "#DBF5E5", color: "#1F6B3B" }}
                                title={`${s.verifier_name} · ${s.verifier_title}`}
                                data-testid={`admin-verified-badge-${s.id}`}
                              >
                                <BadgeCheck size={12}/> Verified
                              </span>
                              <button
                                onClick={() => unverify(s.id)}
                                className="text-[11px] underline opacity-60 hover:opacity-100"
                                data-testid={`admin-unverify-${s.id}`}
                              >
                                undo
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => openVerify(s)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors"
                              style={{ background: "var(--pf-tag-bg)", color: "var(--pf-secondary)" }}
                              data-testid={`admin-verify-btn-${s.id}`}
                            >
                              <ShieldCheck size={12}/> Verify
                            </button>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => deleteSubmission(s)}
                            className="inline-flex items-center gap-1 text-xs opacity-60 hover:opacity-100 hover:text-red-600 transition-colors"
                            data-testid={`admin-delete-sub-${s.id}`}
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

        {tab === "pending" && !loading && (
          <div className="grid lg:grid-cols-2 gap-5" data-testid="admin-pending-list">
            {pending.length === 0 && (
              <div className="lg:col-span-2 pf-card p-10 text-center text-sm" style={{ color: "var(--pf-muted)" }} data-testid="no-pending">
                No pending company submissions.
              </div>
            )}
            {pending.map((p) => (
              <div key={p.id} className="pf-card p-6" data-testid={`admin-pending-${p.id}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="pf-tag">{p.category}</span>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--pf-secondary)" }}>{p.difficulty}</span>
                </div>
                <h3 className="font-display text-xl font-extrabold mb-2">{p.title}</h3>
                <div className="text-sm font-semibold mb-1">{p.company_name}</div>
                <div className="text-xs mb-3" style={{ color: "var(--pf-muted)" }}>{p.contact_email} · Deadline: {p.deadline_preference}</div>
                <p className="text-sm mb-4 line-clamp-3" style={{ color: "var(--pf-muted)" }}>{p.problem_description}</p>
                <div className="flex gap-2">
                  <button onClick={() => approve(p.id)} className="pf-btn-primary text-sm" data-testid={`approve-${p.id}`}>
                    <Check size={16}/> Approve
                  </button>
                  <button onClick={() => reject(p.id)} className="pf-btn-secondary text-sm" data-testid={`reject-${p.id}`}>
                    <X size={16}/> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {verifyTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={closeVerify}
          data-testid="verify-modal"
        >
          <div className="pf-card p-8 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-display text-2xl font-extrabold tracking-tighter">Verify submission</h2>
                <p className="text-xs mt-1" style={{ color: "var(--pf-muted)" }}>
                  Endorsing {verifyTarget.student_name}&#39;s work on &ldquo;{verifyTarget.challenge_title}&rdquo;
                </p>
              </div>
              <button onClick={closeVerify} data-testid="verify-modal-close"><X size={18}/></button>
            </div>
            <form onSubmit={submitVerify} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Verifier&#39;s name</label>
                <input
                  className="pf-input"
                  value={verifierName}
                  onChange={(e) => setVerifierName(e.target.value)}
                  placeholder="e.g. Dr. Anjali Rao"
                  data-testid="verify-name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Title</label>
                <input
                  className="pf-input"
                  value={verifierTitle}
                  onChange={(e) => setVerifierTitle(e.target.value)}
                  placeholder="e.g. Professor / Industry Expert"
                  data-testid="verify-title"
                  required
                />
              </div>
              <button type="submit" disabled={verifying} className="pf-btn-primary w-full" data-testid="verify-submit">
                {verifying ? "Verifying…" : "Mark as verified"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
