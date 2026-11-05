import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { LogIn, Lock, Mail } from "lucide-react";
import usePageTitle from "@/lib/usePageTitle";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  usePageTitle("Log in");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="pf-card p-8 sm:p-10 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold">Welcome back</h1>
            <p className="text-sm mt-2" style={{ color: "var(--pf-muted)" }}>
              Log in to manage your submissions and portfolio
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--pf-muted)" }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  data-testid="login-email-input"
                  className="pf-input pl-10"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--pf-muted)" }}>
                  Password
                </label>
                <Link to="/reset-password" className="text-xs pf-link" data-testid="forgot-password-link">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--pf-muted)" }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  data-testid="login-password-input"
                  className="pf-input pl-10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pf-btn-primary w-full mt-2"
              data-testid="login-submit-btn"
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[var(--pf-card-border)] text-center text-sm" style={{ color: "var(--pf-muted)" }}>
            Don't have an account?{" "}
            <Link to="/signup" className="pf-link" data-testid="signup-link">
              Sign up
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
