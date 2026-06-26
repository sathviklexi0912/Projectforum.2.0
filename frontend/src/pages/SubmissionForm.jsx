import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, formatApiError } from "@/lib/api";

const TIME_OPTIONS = ["Under 3 hrs", "3–6 hrs", "6–10 hrs", "10–20 hrs", "20+ hrs"];

export default function SubmissionForm({ mode = "create" }) {
  const { challengeId, submissionId } = useParams();
  const [challenge, setChallenge] = useState(null);
  const navigate = useNavigate();
  const [form, setForm] = useState({ submission_link: "", explanation: "", time_spent: "3–6 hrs", key_learning: "" });
  const [loading, setLoading] = useState(false);
  const isEdit = mode === "edit";

  useEffect(() => {
    if (isEdit) {
      api.get(`/submissions/${submissionId}`)
        .then(async (r) => {
          const sub = r.data;
          setForm({
            submission_link: sub.submission_link || "",
            explanation: sub.explanation || "",
            time_spent: sub.time_spent || "3–6 hrs",
            key_learning: sub.key_learning || "",
          });
          const cr = await api.get(`/challenges/${sub.challenge_id}`);
          setChallenge(cr.data);
        })
        .catch(() => {
          toast.error("Submission not found");
          navigate("/dashboard/submissions");
        });
    } else {
      api.get(`/challenges/${challengeId}`).then((r) => setChallenge(r.data)).catch(() => setChallenge(null));
    }
  }, [isEdit, submissionId, challengeId, navigate]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await api.patch(`/submissions/${submissionId}`, { challenge_id: challenge.id, ...form });
        toast.success("Submission updated");
        navigate("/dashboard/submissions");
      } else {
        await api.post("/submissions", { challenge_id: challengeId, ...form });
        toast.success("Submission received!");
        navigate("/thank-you");
      }
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" data-testid="submission-form-page">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-6">
          <span className="pf-tag mb-3 inline-block">{isEdit ? "Editing submission" : "Submitting work"}</span>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tighter">{challenge?.title || (isEdit ? "Edit submission" : "Submit your work")}</h1>
          {challenge?.org && (
            <p className="text-sm mt-2" style={{ color: "var(--pf-muted)" }}>for <span className="font-semibold" style={{ color: "var(--pf-secondary)" }}>{challenge.org}</span></p>
          )}
        </div>

        <form onSubmit={submit} className="pf-card p-8 space-y-5" data-testid="submission-form">
          <div>
            <label className="text-sm font-medium block mb-1.5">Work link (Google Drive / GitHub / Figma / Notion)</label>
            <input type="url" className="pf-input" placeholder="https://…" value={form.submission_link} onChange={(e) => set("submission_link", e.target.value)} data-testid="submission-link" required/>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Approach explanation (2–5 sentences)</label>
            <textarea rows={4} className="pf-input" value={form.explanation} onChange={(e) => set("explanation", e.target.value)} data-testid="submission-explanation" required/>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Time spent</label>
            <select className="pf-input" value={form.time_spent} onChange={(e) => set("time_spent", e.target.value)} data-testid="submission-time">
              {TIME_OPTIONS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Key learning</label>
            <input className="pf-input" placeholder="What was your biggest takeaway?" value={form.key_learning} onChange={(e) => set("key_learning", e.target.value)} data-testid="submission-learning" required/>
          </div>
          <button type="submit" disabled={loading} className="pf-btn-primary w-full" data-testid="submission-submit">
            {loading ? (isEdit ? "Saving…" : "Submitting…") : (isEdit ? "Save changes" : "Send submission")}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
