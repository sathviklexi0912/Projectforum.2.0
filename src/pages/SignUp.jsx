import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { User, Mail, Lock, Linkedin } from "lucide-react";
import usePageTitle from "@/lib/usePageTitle";
import ProfileTypeFields from "@/components/ProfileTypeFields";

export default function SignUp() {
  usePageTitle("Create your profile");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    university: "",
    degree: "",
    year: "",
    linkedin: "",
    headline: "",
    profile_type: "student",
    current_role: "",
    experience_years: "",
  });
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accepted) {
      toast.error("Please confirm you are 18 or older and accept the Terms and Privacy Policy.");
      return;
    }
    setLoading(true);
    try {
      await register({ ...formData, accept_terms: true });
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="pf-card p-8 sm:p-10 w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold">Create your profile</h1>
            <p className="text-sm mt-2" style={{ color: "var(--pf-muted)" }}>
              Show organisations and hiring teams what you can do
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="signup-form">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--pf-muted)" }} />
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  data-testid="signup-name-input"
                  className="pf-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                Email address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--pf-muted)" }} />
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  data-testid="signup-email-input"
                  className="pf-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--pf-muted)" }} />
                <input
                  type="password"
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  minLength={8}
                  autoComplete="new-password"
                  data-testid="signup-password-input"
                  className="pf-input pl-10"
                />
              </div>
              <p className="text-xs mt-1.5" style={{ color: "var(--pf-muted)" }}>Use at least 8 characters.</p>
            </div>

            <ProfileTypeFields value={formData} onChange={setFormData} idPrefix="signup" />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                Headline / One-liner
              </label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                placeholder="e.g. Marketing student who loves go-to-market problems"
                data-testid="signup-headline-input"
                className="pf-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <Linkedin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--pf-muted)" }} />
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  data-testid="signup-linkedin-input"
                  className="pf-input pl-10"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm pt-2 cursor-pointer" htmlFor="signup-accept-terms">
              <input
                id="signup-accept-terms"
                type="checkbox"
                required
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 shrink-0 accent-[var(--pf-primary)]"
                data-testid="signup-accept-terms"
              />
              <span style={{ color: "var(--pf-muted)" }}>
                I am 18 or older and I agree to the{" "}
                <Link to="/terms" target="_blank" className="pf-link">Terms of Service</Link> and{" "}
                <Link to="/privacy" target="_blank" className="pf-link">Privacy Policy</Link>.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="pf-btn-primary w-full mt-4"
              data-testid="signup-submit-btn"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[var(--pf-card-border)] text-center text-sm" style={{ color: "var(--pf-muted)" }}>
            Already have an account?{" "}
            <Link to="/login" className="pf-link" data-testid="login-link">
              Log in
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
