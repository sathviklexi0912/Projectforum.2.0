import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, formatApiError } from "@/lib/api";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (pw !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, new_password: pw });
      toast.success("Password updated. Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" data-testid="reset-page">
      <Navbar />
      <main className="max-w-md mx-auto px-6 py-16">
        <div className="mb-8">
          <span className="pf-tag mb-3 inline-block">Reset password</span>
          <h1 className="font-display text-4xl font-extrabold tracking-tighter mb-2">Set a new password</h1>
          <p className="text-sm" style={{ color: "var(--pf-muted)" }}>Enter your account email and a new password.</p>
        </div>
        <form onSubmit={submit} className="pf-card p-8 space-y-5" data-testid="reset-form">
          <div>
            <label className="text-sm font-medium block mb-1.5">Email</label>
            <input type="email" className="pf-input" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="reset-email" required/>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">New password</label>
            <input type="password" className="pf-input" value={pw} onChange={(e) => setPw(e.target.value)} data-testid="reset-new-password" required minLength={6}/>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Confirm password</label>
            <input type="password" className="pf-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} data-testid="reset-confirm-password" required/>
          </div>
          <button type="submit" disabled={loading} className="pf-btn-primary w-full" data-testid="reset-submit">
            {loading ? "Updating…" : "Update password"}
          </button>
          <p className="text-sm text-center" style={{ color: "var(--pf-muted)" }}>
            Remembered it? <Link to="/login" className="pf-link">Sign in</Link>
          </p>
        </form>
      </main>
      <Footer />
    </div>
  );
}
