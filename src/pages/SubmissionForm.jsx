import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Link as LinkIcon, Clock, Lightbulb, FileText, Send } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import usePageTitle from "@/lib/usePageTitle";

export default function SubmissionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  usePageTitle(challenge?.title ? `Submit: ${challenge.title}` : "Submit your solution");

  const [submissionLink, setSubmissionLink] = useState("");
  const [explanation, setExplanation] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [keyLearning, setKeyLearning] = useState("");

  useEffect(() => {
    if (!user) {
      toast.error("Please log in to submit a challenge response.");
      navigate("/login");
      return;
    }
    api.get(`/challenges/${id}`)
      .then((res) => setChallenge(res.data))
      .catch(() => {
        toast.error("Challenge not found");
        navigate("/challenges");
      })
      .finally(() => setLoading(false));
  }, [id, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionLink.trim() || !explanation.trim()) {
      toast.error("Please provide both submission link and explanation");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/submissions", {
        challenge_id: id,
        submission_link: submissionLink,
        explanation: explanation,
        time_spent: timeSpent || "10 hrs",
        key_learning: keyLearning,
      });
      toast.success("Challenge submitted successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col" data-testid="submission-page">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        <Link to={`/challenges/${id}`} className="pf-link text-sm inline-flex items-center gap-1.5 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Challenge
        </Link>

        <div className="pf-card p-8 sm:p-10">
          <div className="mb-8">
            <span className="pf-tag mb-2 inline-block">Submitting to</span>
            <h1 className="font-display text-3xl font-extrabold">{challenge?.title}</h1>
            <p className="text-sm mt-1" style={{ color: "var(--pf-muted)" }}>
              Hosted by <strong className="text-[var(--pf-text)]">{challenge?.org}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="submission-form">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--pf-muted)" }}>
                Submission / Deliverable Link *
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--pf-muted)" }} />
                <input
                  type="url"
                  required
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  placeholder="https://google-drive.com/deck or https://github.com/repo"
                  data-testid="submission-link-input"
                  className="pf-input pl-10"
                />
              </div>
              <p className="text-xs mt-1.5" style={{ color: "var(--pf-muted)" }}>
                Link to your pitch deck, Notion document, Figma file, or GitHub repository.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--pf-muted)" }}>
                Executive Rationale & Overview *
              </label>
              <textarea
                required
                rows={5}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain your approach, core assumptions, channel strategy or key findings..."
                data-testid="submission-explanation-input"
                className="pf-input py-3"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--pf-muted)" }}>
                  Estimated Time Spent
                </label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--pf-muted)" }} />
                  <input
                    type="text"
                    value={timeSpent}
                    onChange={(e) => setTimeSpent(e.target.value)}
                    placeholder="e.g. 12 hrs"
                    data-testid="submission-time-input"
                    className="pf-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--pf-muted)" }}>
                  Key Learning / Takeaway
                </label>
                <div className="relative">
                  <Lightbulb className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--pf-muted)" }} />
                  <input
                    type="text"
                    value={keyLearning}
                    onChange={(e) => setKeyLearning(e.target.value)}
                    placeholder="e.g. Tier 2 consumer behavior in India"
                    data-testid="submission-learning-input"
                    className="pf-input pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--pf-card-border)] flex items-center justify-end gap-3">
              <Link to={`/challenges/${id}`} className="pf-btn-secondary text-xs">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="pf-btn-primary text-sm py-2.5 px-6"
                data-testid="submit-final-btn"
              >
                {submitting ? "Submitting..." : "Submit Project"}
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
