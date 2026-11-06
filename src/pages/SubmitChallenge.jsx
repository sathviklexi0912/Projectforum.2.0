import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, Send, CheckCircle2, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { toast } from "sonner";
import usePageTitle from "@/lib/usePageTitle";

export default function SubmitChallenge() {
  const navigate = useNavigate();
  usePageTitle("Host a challenge");
  const [formData, setFormData] = useState({
    title: "",
    org: "",
    category: "Marketing",
    difficulty: "Intermediate",
    est_time: "10 hrs",
    description: "",
    problem_statement: "",
    deliverables: "",
    rubric: "",
    contact_email: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const deliverablesList = formData.deliverables.split("\n").filter(Boolean);
      const rubricList = formData.rubric.split("\n").filter(Boolean);

      await api.post("/pending-challenges", {
        ...formData,
        deliverables: deliverablesList,
        rubric: rubricList,
      });

      toast.success("Challenge proposal submitted for admin review!");
      navigate("/thank-you");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        <Link to="/challenges" className="pf-link text-sm inline-flex items-center gap-1.5 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Challenges
        </Link>

        <div className="pf-card p-8 sm:p-10">
          <div className="mb-8">
            <span className="pf-tag mb-2 inline-block">For Companies & Organizations</span>
            <h1 className="font-display text-3xl font-extrabold">Host a Real-World Challenge</h1>
            <p className="text-sm mt-2" style={{ color: "var(--pf-muted)" }}>
              Post a problem statement, crowdsource real strategies/code, and evaluate talented people on real work.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" data-testid="host-challenge-form">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                  Challenge Title *
                </label>
                <input
                  type="text"
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Tier-2 Market Expansion Strategy"
                  className="pf-input"
                  data-testid="host-title-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  name="org"
                  value={formData.org}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corp"
                  className="pf-input"
                  data-testid="host-org-input"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                  Domain Category
                </label>
                <select name="category" value={formData.category} onChange={handleChange} className="pf-input">
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="Strategy">Strategy</option>
                  <option value="Tech">Tech</option>
                  <option value="Entrepreneurship">Entrepreneurship</option>
                  <option value="Operations">Operations</option>
                  <option value="Design">Design</option>
                  <option value="Data & AI">Data &amp; AI</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                  Difficulty
                </label>
                <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="pf-input">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                  Est. Time
                </label>
                <input
                  type="text"
                  name="est_time"
                  value={formData.est_time}
                  onChange={handleChange}
                  placeholder="e.g. 10 hrs"
                  className="pf-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                Short Summary Description *
              </label>
              <textarea
                required
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="High-level 2-sentence summary of what contributors will solve..."
                className="pf-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                Full Problem Statement *
              </label>
              <textarea
                required
                rows={4}
                name="problem_statement"
                value={formData.problem_statement}
                onChange={handleChange}
                placeholder="Detailed background, current bottleneck, target metrics, and constraints..."
                className="pf-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                Deliverables (One per line)
              </label>
              <textarea
                rows={3}
                name="deliverables"
                value={formData.deliverables}
                onChange={handleChange}
                placeholder={"10-slide strategy deck\nFinancial model spreadsheet\nExecutive summary rationale"}
                className="pf-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                Evaluation Rubric Points (One per line)
              </label>
              <textarea
                rows={3}
                name="rubric"
                value={formData.rubric}
                onChange={handleChange}
                placeholder={"30% Depth of market research\n40% Unit economics feasibility\n30% Presentation clarity"}
                className="pf-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                Contact Email *
              </label>
              <input
                type="email"
                required
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="recruiter@company.com"
                className="pf-input"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="pf-btn-primary w-full py-3 mt-4"
              data-testid="submit-challenge-proposal-btn"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? "Submitting Proposal..." : "Submit Proposal for Admin Review"}</span>
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
