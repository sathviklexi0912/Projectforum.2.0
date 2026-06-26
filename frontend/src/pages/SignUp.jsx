import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";

const SKILLS = ["Marketing", "Finance", "Consulting", "Entrepreneurship", "Analytics", "HR", "Operations", "Strategy"];
const YEARS = ["1st", "2nd", "3rd", "Final", "Postgrad"];

export default function SignUp() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    university: "", degree: "", year: "",
    linkedin: "", skills: [],
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleSkill = (s) => set("skills", form.skills.includes(s) ? form.skills.filter(x => x !== s) : [...form.skills, s]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Name, email and password are required");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success("Welcome to ProjectForum!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" data-testid="signup-page">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <span className="pf-tag mb-3 inline-block">Get started</span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tighter mb-2">Create your account</h1>
          <p className="text-sm" style={{ color: "var(--pf-muted)" }}>Join 4,200+ students building portfolios that get noticed.</p>
        </div>

        <form onSubmit={submit} className="pf-card p-8 space-y-5" data-testid="signup-form">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Full Name</label>
              <input className="pf-input" value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="signup-name" required/>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Email</label>
              <input type="email" className="pf-input" value={form.email} onChange={(e) => set("email", e.target.value)} data-testid="signup-email" required/>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Password</label>
            <input type="password" className="pf-input" value={form.password} onChange={(e) => set("password", e.target.value)} data-testid="signup-password" required minLength={6}/>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">University</label>
              <input className="pf-input" value={form.university} onChange={(e) => set("university", e.target.value)} data-testid="signup-university"/>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Degree</label>
              <input className="pf-input" value={form.degree} onChange={(e) => set("degree", e.target.value)} data-testid="signup-degree"/>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">Year of Study</label>
              <select className="pf-input" value={form.year} onChange={(e) => set("year", e.target.value)} data-testid="signup-year">
                <option value="">Select year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">LinkedIn (optional)</label>
              <input className="pf-input" placeholder="https://linkedin.com/in/…" value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} data-testid="signup-linkedin"/>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Skills</label>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((s) => {
                const active = form.skills.includes(s);
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => toggleSkill(s)}
                    data-testid={`signup-skill-${s.toLowerCase()}`}
                    className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all"
                    style={active ? { background: "var(--pf-primary)", color: "#fff", border: "1px solid var(--pf-primary)" }
                                  : { background: "transparent", color: "var(--pf-text)", border: "1px solid var(--pf-card-border)" }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" disabled={loading} className="pf-btn-primary w-full" data-testid="signup-submit">
            {loading ? "Creating account…" : "Create account"}
          </button>
          <p className="text-sm text-center" style={{ color: "var(--pf-muted)" }}>
            Already have one? <Link to="/login" className="pf-link" data-testid="signup-to-login">Sign in</Link>
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}
