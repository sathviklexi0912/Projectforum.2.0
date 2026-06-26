import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/dashboard";

  useEffect(() => {
    if (user) navigate(decodeURIComponent(next), { replace: true });
  }, [user, navigate, next]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate(decodeURIComponent(next));
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" data-testid="login-page">
      <Navbar />
      <main className="max-w-md mx-auto px-6 py-16">
        <div className="mb-8">
          <span className="pf-tag mb-3 inline-block">Sign in</span>
          <h1 className="font-display text-4xl font-extrabold tracking-tighter mb-2">Welcome back</h1>
          <p className="text-sm" style={{ color: "var(--pf-muted)" }}>Pick up where you left off.</p>
        </div>
        <form onSubmit={submit} className="pf-card p-8 space-y-5" data-testid="login-form">
          <div>
            <label className="text-sm font-medium block mb-1.5">Email</label>
            <input type="email" className="pf-input" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="login-email" required/>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Password</label>
            <input type="password" className="pf-input" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="login-password" required/>
          </div>
          <button type="submit" disabled={loading} className="pf-btn-primary w-full" data-testid="login-submit">
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <div className="flex justify-between text-sm" style={{ color: "var(--pf-muted)" }}>
            <Link to="/signup" className="pf-link" data-testid="login-to-signup">Create account</Link>
            <Link to="/reset-password" className="pf-link" data-testid="login-to-reset">Reset password</Link>
          </div>
          <div className="text-xs text-center pt-2" style={{ color: "var(--pf-muted)" }}>
            Demo: <code>demo@projectforum.com</code> / <code>Demo@123</code>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
