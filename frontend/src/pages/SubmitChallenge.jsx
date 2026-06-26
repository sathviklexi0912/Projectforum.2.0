import { useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, formatApiError } from "@/lib/api";

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];
const CATEGORIES = ["Marketing", "Finance", "Strategy", "Entrepreneurship", "Consulting", "Analytics", "HR", "Operations"];

export default function SubmitChallenge() {
  const [form, setForm] = useState({
    company_name: "", contact_email: "", title: "",
    problem_description: "", deliverables: "", evaluation_criteria: "",
    est_time: "", difficulty: "Intermediate", category: "Marketing",
    deadline_preference: "21 days",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/pending-challenges", form);
      setSent(true);
      toast.success("Challenge submitted for review");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="App" data-testid="submit-challenge-success">
        <Navbar />
        <main className="max-w-2xl mx-auto px-6 py-20 text-center">
          <span className="pf-tag mb-4 inline-block">Received</span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tighter mb-4">Thanks — we&#39;ve got it.</h1>
          <p className="text-base mb-8" style={{ color: "var(--pf-muted)" }}>
            Your challenge is under review. We&#39;ll publish it within 48 hours and email you when it goes live.
          </p>
          <a href="/" className="pf-btn-secondary">Back to home</a>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="App" data-testid="submit-challenge-page">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <span className="pf-tag mb-3 inline-block">For companies</span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tighter mb-2">Submit a challenge</h1>
          <p className="text-sm" style={{ color: "var(--pf-muted)" }}>Reach 4,200+ business students. We&#39;ll review and publish your brief within 48 hours.</p>
        </div>

        <form onSubmit={submit} className="pf-card p-8 space-y-5" data-testid="submit-challenge-form">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Company Name</label>
              <input className="pf-input" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} data-testid="sc-company" required/>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Contact Email</label>
              <input type="email" className="pf-input" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} data-testid="sc-email" required/>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Challenge Title</label>
            <input className="pf-input" value={form.title} onChange={(e) => set("title", e.target.value)} data-testid="sc-title" required/>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Problem Description</label>
            <textarea rows={4} className="pf-input" value={form.problem_description} onChange={(e) => set("problem_description", e.target.value)} data-testid="sc-problem" required/>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">What Students Should Deliver (comma separated)</label>
            <textarea rows={2} className="pf-input" placeholder="e.g. Channel strategy, Pricing plan, KPIs" value={form.deliverables} onChange={(e) => set("deliverables", e.target.value)} data-testid="sc-deliverables" required/>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Evaluation Criteria (comma separated)</label>
            <textarea rows={2} className="pf-input" placeholder="e.g. Strategic clarity, Feasibility, Communication" value={form.evaluation_criteria} onChange={(e) => set("evaluation_criteria", e.target.value)} data-testid="sc-rubric" required/>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Estimated Time</label>
              <input className="pf-input" placeholder="e.g. 8–12 hrs" value={form.est_time} onChange={(e) => set("est_time", e.target.value)} data-testid="sc-est-time" required/>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Deadline Preference</label>
              <select className="pf-input" value={form.deadline_preference} onChange={(e) => set("deadline_preference", e.target.value)} data-testid="sc-deadline">
                {["14 days", "21 days", "28 days", "35 days", "45 days", "60 days"].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Difficulty</label>
              <select className="pf-input" value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)} data-testid="sc-difficulty">
                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Category</label>
              <select className="pf-input" value={form.category} onChange={(e) => set("category", e.target.value)} data-testid="sc-category">
                {CATEGORIES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="pf-btn-primary w-full" data-testid="sc-submit">
            {loading ? "Submitting…" : "Submit challenge for review"}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
