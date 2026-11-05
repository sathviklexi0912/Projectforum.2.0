import { useEffect, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  Building2,
  User,
  ExternalLink,
  KeyRound,
  LogOut,
  Eye,
  Clock,
  BookOpen,
  FileText,
  GraduationCap,
  Calendar,
  Sparkles,
  Link2,
  CheckCircle2,
  UserCheck,
  Award,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { toast } from "sonner";
import usePageTitle from "@/lib/usePageTitle";

export default function Admin() {
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [verifierName, setVerifierName] = useState("");
  const [verifierTitle, setVerifierTitle] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  usePageTitle("Admin");

  const handleLogin = (e) => {
    e.preventDefault();
    if (!adminPassword) return;
    fetchData(adminPassword);
  };

  const handleLogout = () => {
    setIsAuth(false);
    setAdminPassword("");
    setProposals([]);
    setSubmissions([]);
    setSelectedSubmission(null);
    sessionStorage.removeItem("pf_admin_auth");
    localStorage.removeItem("pf_admin_auth");
    toast.info("Logged out of Admin Portal");
  };

  const fetchData = (pass) => {
    setLoading(true);
    const headers = { "x-admin-password": pass };

    Promise.all([
      api.get("/admin/proposals", { headers }),
      api.get("/admin/submissions", { headers }),
    ])
      .then(([resP, resS]) => {
        setProposals(resP.data);
        setSubmissions(resS.data);
        setIsAuth(true);
        toast.success("Admin authenticated!");
        // Update selected submission if modal is open
        if (selectedSubmission) {
          const updated = resS.data.find((s) => s.id === selectedSubmission.id);
          if (updated) setSelectedSubmission(updated);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.detail || "Invalid admin password");
        setIsAuth(false);
      })
      .finally(() => setLoading(false));
  };

  const handleApproveProposal = async (id) => {
    try {
      await api.post(`/admin/proposals/${id}/approve`, {}, {
        headers: { "x-admin-password": adminPassword },
      });
      toast.success("Proposal approved and published!");
      fetchData(adminPassword);
    } catch (err) {
      toast.error("Failed to approve proposal");
    }
  };

  const handleOpenDetailModal = (sub) => {
    setSelectedSubmission(sub);
    setVerifierName(sub.verifier_name || sub.challenge_org ? `${sub.challenge_org} Lead` : "Platform Admin");
    setVerifierTitle(sub.verifier_title || "Verified Reviewer");
  };

  const handleCloseModal = () => {
    setSelectedSubmission(null);
  };

  const handleToggleVerification = async (sid, customName, customTitle) => {
    setActionLoading(true);
    try {
      const payload = customName && customTitle ? { verifier_name: customName, verifier_title: customTitle } : {};
      const res = await api.patch(`/admin/submissions/${sid}/verify`, payload, {
        headers: { "x-admin-password": adminPassword },
      });
      toast.success(`Submission ${res.data.verified ? "verified" : "unverified"}!`);
      fetchData(adminPassword);
      if (selectedSubmission && selectedSubmission.id === sid) {
        setSelectedSubmission((prev) =>
          prev
            ? {
                ...prev,
                verified: res.data.verified,
                verifier_name: res.data.verified ? customName || prev.verifier_name || "Platform Admin" : "",
                verifier_title: res.data.verified ? customTitle || prev.verifier_title || "Verified Reviewer" : "",
              }
            : null
        );
      }
    } catch (err) {
      toast.error("Failed to toggle verification");
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="pf-card p-8 sm:p-10 w-full max-w-md text-center">
            <ShieldCheck className="w-12 h-12 text-[var(--pf-primary)] mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">Admin Portal</h1>
            <p className="text-xs mb-6" style={{ color: "var(--pf-muted)" }}>
              Enter admin key to review challenge proposals & verify submissions
            </p>

            <form onSubmit={handleLogin} className="space-y-4" data-testid="admin-auth-form">
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--pf-muted)" }} />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="pf-input pl-10 text-sm"
                  data-testid="admin-password-input"
                  id="admin-password-input"
                />
              </div>

              <button type="submit" disabled={loading} className="pf-btn-primary w-full text-xs py-2.5" id="admin-auth-submit-btn">
                {loading ? "Authenticating..." : "Authenticate"}
              </button>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" data-testid="admin-panel">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-6 lg:px-10 py-12 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-[var(--pf-card-border)]">
          <div>
            <span className="pf-tag mb-2 inline-block">Management</span>
            <h1 className="font-display text-3xl font-extrabold">Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer"
            data-testid="admin-logout-btn"
            id="admin-logout-btn"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>

        <div className="space-y-12">
          {/* Company Challenge Proposals */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[var(--pf-primary)]" />
              <span>Pending Host Proposals ({proposals.filter((p) => p.status === "pending").length})</span>
            </h2>

            {proposals.length === 0 ? (
              <div className="pf-card p-8 text-center text-sm" style={{ color: "var(--pf-muted)" }}>
                No host proposals submitted yet.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {proposals.map((p) => (
                  <div key={p.id} className="pf-card p-6 flex flex-col justify-between" id={`proposal-card-${p.id}`} data-testid={`proposal-card-${p.id}`}>
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="pf-tag text-[10px]">{p.category}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${p.status === "approved" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
                          {p.status}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold">{p.title}</h3>
                      <p className="text-xs font-medium mb-3" style={{ color: "var(--pf-muted)" }}>
                        Company: {p.org} | Contact: {p.contact_email}
                      </p>
                      <p className="text-xs line-clamp-3 mb-4" style={{ color: "var(--pf-text)" }}>
                        {p.description}
                      </p>
                    </div>

                    {p.status === "pending" && (
                      <div className="pt-4 border-t border-[var(--pf-card-border)] flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApproveProposal(p.id)}
                          className="pf-btn-primary text-xs py-1.5 px-4"
                          id={`approve-proposal-${p.id}`}
                          data-testid={`approve-proposal-${p.id}`}
                        >
                          Approve & Publish
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Student Submissions Audit */}
          <section>
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="font-display text-2xl font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-[var(--pf-secondary)]" />
                <span>Submissions & Verification ({submissions.length})</span>
              </h2>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                {submissions.filter((s) => s.verified).length} Verified
              </span>
            </div>

            {submissions.length === 0 ? (
              <div className="pf-card p-8 text-center text-sm" style={{ color: "var(--pf-muted)" }}>
                No submissions yet.
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    id={`submission-card-${sub.id}`}
                    data-testid={`submission-card-${sub.id}`}
                    className="pf-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[var(--pf-primary)]/40 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-sm font-bold">{sub.student_name}</span>
                        {sub.student_university && (
                          <span className="text-xs px-2 py-0.5 rounded bg-[var(--pf-card-border)]/40 font-medium" style={{ color: "var(--pf-muted)" }}>
                            {sub.student_university}
                          </span>
                        )}
                        {sub.student_email && (
                          <span className="text-xs" style={{ color: "var(--pf-muted)" }}>
                            ({sub.student_email})
                          </span>
                        )}
                        {sub.verified ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/20">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        )}
                      </div>

                      <p className="text-sm font-bold text-[var(--pf-primary)] truncate mb-1">
                        Challenge: {sub.challenge_title}
                        {sub.challenge_org && <span className="font-normal text-xs ml-1.5 opacity-80">({sub.challenge_org})</span>}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mt-1" style={{ color: "var(--pf-muted)" }}>
                        {sub.time_spent && <span>Time Spent: <strong className="text-[var(--pf-text)]">{sub.time_spent}</strong></span>}
                        {sub.submitted_at && <span>Submitted: {new Date(sub.submitted_at).toLocaleDateString()}</span>}
                        {sub.key_learning && (
                          <span className="truncate max-w-md">
                            Key Learning: {sub.key_learning}
                          </span>
                        )}
                      </div>

                      {sub.submission_link && (
                        <div className="mt-2.5 flex items-center gap-3">
                          <a
                            href={sub.submission_link}
                            target="_blank"
                            rel="noreferrer"
                            className="pf-link text-xs inline-flex items-center gap-1 font-semibold"
                            id={`card-deliverable-link-${sub.id}`}
                          >
                            <ExternalLink className="w-3 h-3" /> Deliverable Link
                          </a>
                          <a
                            href={`/profile/${sub.student_id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs inline-flex items-center gap-1 text-[var(--pf-muted)] hover:text-[var(--pf-primary)] transition-colors"
                          >
                            <User className="w-3 h-3" /> View Profile
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-[var(--pf-card-border)]">
                      <button
                        onClick={() => handleOpenDetailModal(sub)}
                        className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[var(--pf-card-border)]/50 hover:bg-[var(--pf-card-border)] text-[var(--pf-text)] transition-all inline-flex items-center gap-1.5 cursor-pointer"
                        id={`open-detail-btn-${sub.id}`}
                        data-testid={`open-detail-btn-${sub.id}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review Full Details</span>
                      </button>

                      <button
                        onClick={() => handleToggleVerification(sub.id)}
                        disabled={actionLoading}
                        className={`text-xs font-semibold py-2 px-3.5 rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                          sub.verified
                            ? "bg-emerald-500 text-white hover:bg-emerald-600"
                            : "border border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
                        }`}
                        id={`card-verify-btn-${sub.id}`}
                        data-testid={`card-verify-btn-${sub.id}`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{sub.verified ? "Verified ✓" : "Mark Verified"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Full Submission Detail & Verification Modal */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
          id="submission-detail-modal"
          data-testid="submission-detail-modal"
          onClick={handleCloseModal}
        >
          <div
            className="pf-card w-full max-w-3xl max-h-[90vh] flex flex-col my-auto overflow-hidden shadow-2xl border border-[var(--pf-card-border)] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
            data-testid="submission-modal-content"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[var(--pf-card-border)] flex items-start justify-between gap-4 bg-[var(--pf-card-bg)]">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="pf-tag text-[10px]">Submission Detail</span>
                  {selectedSubmission.verified ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30" data-testid="modal-verified-badge">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Contributor Credential
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20" data-testid="modal-unverified-badge">
                      <Clock className="w-3.5 h-3.5" /> Pending Verification
                    </span>
                  )}
                </div>
                <h2 className="font-display text-2xl font-bold" data-testid="modal-challenge-title">
                  {selectedSubmission.challenge_title}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--pf-muted)" }}>
                  Company Host: <strong className="text-[var(--pf-text)]">{selectedSubmission.challenge_org || "Partner Org"}</strong>
                  {selectedSubmission.challenge_category && <span className="ml-2">| Category: {selectedSubmission.challenge_category}</span>}
                </p>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-[var(--pf-muted)] hover:text-[var(--pf-text)] hover:bg-[var(--pf-card-border)]/40 transition-all cursor-pointer"
                id="modal-close-btn"
                data-testid="modal-close-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Student Profile Overview */}
              <div className="p-4 rounded-xl bg-[var(--pf-card-border)]/20 border border-[var(--pf-card-border)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[var(--pf-primary)]" />
                      <span className="font-bold text-base" data-testid="modal-student-name">{selectedSubmission.student_name}</span>
                    </div>
                    <div className="text-xs space-y-0.5 mt-1" style={{ color: "var(--pf-muted)" }}>
                      <p data-testid="modal-student-university">
                        University: <strong className="text-[var(--pf-text)]">{selectedSubmission.student_university || "Not provided"}</strong>
                        {selectedSubmission.student_degree && ` • ${selectedSubmission.student_degree}`}
                        {selectedSubmission.student_year && ` (${selectedSubmission.student_year})`}
                      </p>
                      {selectedSubmission.student_email && (
                        <p data-testid="modal-student-email">Email: {selectedSubmission.student_email}</p>
                      )}
                    </div>
                  </div>

                  <a
                    href={`/profile/${selectedSubmission.student_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--pf-card-border)] bg-[var(--pf-card-bg)] hover:border-[var(--pf-primary)] text-[var(--pf-text)] transition-all self-start sm:self-center"
                    id="modal-view-public-profile-link"
                    data-testid="modal-view-public-profile-link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> View Public Profile
                  </a>
                </div>
              </div>

              {/* Submission Metadata Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-[var(--pf-card-border)] bg-[var(--pf-card-bg)]">
                  <span className="text-[11px] font-semibold flex items-center gap-1.5" style={{ color: "var(--pf-muted)" }}>
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> Time Invested
                  </span>
                  <p className="font-bold text-sm mt-1" data-testid="modal-time-spent">
                    {selectedSubmission.time_spent || "Not specified"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--pf-card-border)] bg-[var(--pf-card-bg)]">
                  <span className="text-[11px] font-semibold flex items-center gap-1.5" style={{ color: "var(--pf-muted)" }}>
                    <Calendar className="w-3.5 h-3.5 text-blue-500" /> Submitted On
                  </span>
                  <p className="font-bold text-sm mt-1" data-testid="modal-submitted-at">
                    {selectedSubmission.submitted_at
                      ? new Date(selectedSubmission.submitted_at).toLocaleString()
                      : "Recently"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-[var(--pf-card-border)] bg-[var(--pf-card-bg)]">
                  <span className="text-[11px] font-semibold flex items-center gap-1.5" style={{ color: "var(--pf-muted)" }}>
                    <Award className="w-3.5 h-3.5 text-emerald-500" /> Current Status
                  </span>
                  <p className="font-bold text-sm mt-1" data-testid="modal-status-text">
                    {selectedSubmission.verified ? "Verified & Certified" : selectedSubmission.status || "Submitted"}
                  </p>
                </div>
              </div>

              {/* Deliverable Link Banner */}
              <div className="p-4 rounded-xl border border-[var(--pf-primary)]/30 bg-[var(--pf-primary)]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-[var(--pf-primary)] uppercase tracking-wider flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5" /> Project Deliverable Link
                  </span>
                  <p className="text-xs font-mono truncate mt-1 text-[var(--pf-text)]" data-testid="modal-deliverable-url">
                    {selectedSubmission.submission_link || "No link attached"}
                  </p>
                </div>

                {selectedSubmission.submission_link && (
                  <a
                    href={selectedSubmission.submission_link}
                    target="_blank"
                    rel="noreferrer"
                    className="pf-btn-primary text-xs py-2 px-4 inline-flex items-center justify-center gap-1.5 self-start sm:self-center"
                    id="modal-open-deliverable-btn"
                    data-testid="modal-open-deliverable-btn"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open Deliverable
                  </a>
                )}
              </div>

              {/* Written Solution Rationale & Approach */}
              <div>
                <h3 className="font-display font-bold text-base mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[var(--pf-primary)]" />
                  <span>Solution Explanation & Technical Approach</span>
                </h3>
                <div className="p-4 rounded-xl bg-[var(--pf-card-bg)] border border-[var(--pf-card-border)] text-xs leading-relaxed whitespace-pre-wrap" data-testid="modal-explanation-content">
                  {selectedSubmission.explanation || "No written explanation provided."}
                </div>
              </div>

              {/* Key Learnings */}
              <div>
                <h3 className="font-display font-bold text-base mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <span>Key Learnings & Takeaways</span>
                </h3>
                <div className="p-4 rounded-xl bg-[var(--pf-card-bg)] border border-[var(--pf-card-border)] text-xs leading-relaxed whitespace-pre-wrap" data-testid="modal-key-learning-content">
                  {selectedSubmission.key_learning || "No key learnings recorded."}
                </div>
              </div>

              {/* Verification & Evaluator Credentials Section */}
              <div className="p-5 rounded-xl border border-[var(--pf-card-border)] bg-[var(--pf-card-border)]/20 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-base flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                    <span>Company Evaluation & Verification Credentials</span>
                  </h3>
                  {selectedSubmission.verified && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Active on Public Profile
                    </span>
                  )}
                </div>

                {selectedSubmission.verified ? (
                  <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    <p className="font-bold text-emerald-800 dark:text-emerald-300">
                      Verified by {selectedSubmission.verifier_name || "Platform Admin"} ({selectedSubmission.verifier_title || "Evaluator"})
                    </p>
                    <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                      This badge is displayed publicly on the contributor's profile under verified showcase projects.
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold mb-1" style={{ color: "var(--pf-muted)" }}>
                        Verifier Name
                      </label>
                      <input
                        type="text"
                        value={verifierName}
                        onChange={(e) => setVerifierName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="pf-input text-xs w-full"
                        id="modal-verifier-name-input"
                        data-testid="modal-verifier-name-input"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1" style={{ color: "var(--pf-muted)" }}>
                        Verifier Title / Role
                      </label>
                      <input
                        type="text"
                        value={verifierTitle}
                        onChange={(e) => setVerifierTitle(e.target.value)}
                        placeholder="e.g. Senior Director of Engineering"
                        className="pf-input text-xs w-full"
                        id="modal-verifier-title-input"
                        data-testid="modal-verifier-title-input"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-6 border-t border-[var(--pf-card-border)] bg-[var(--pf-card-bg)] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs" style={{ color: "var(--pf-muted)" }}>
                Submission ID: <code className="text-[10px] font-mono">{selectedSubmission.id}</code>
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--pf-card-border)] hover:bg-[var(--pf-card-border)]/40 transition-all cursor-pointer"
                  id="modal-cancel-btn"
                  data-testid="modal-cancel-btn"
                >
                  Close
                </button>

                <button
                  onClick={() => handleToggleVerification(selectedSubmission.id, verifierName, verifierTitle)}
                  disabled={actionLoading}
                  className={`px-5 py-2 text-xs font-semibold rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm ${
                    selectedSubmission.verified
                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                  id="modal-verify-toggle-btn"
                  data-testid="modal-verify-toggle-btn"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {actionLoading
                      ? "Updating..."
                      : selectedSubmission.verified
                      ? "Revoke Verification"
                      : "Verify & Certify Submission"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

