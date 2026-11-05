import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { KeyRound, Mail, ArrowLeft, Lock, Inbox, ShieldCheck, RefreshCw } from "lucide-react";
import usePageTitle from "@/lib/usePageTitle";

export default function PasswordReset() {
  usePageTitle("Reset password");
  const [step, setStep] = useState(1); // 1: Request reset code, 2: Enter code & new password
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  const handleRequestToken = async (e) => {
    e?.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/request-reset-token", { email });
      toast.success(res.data.message || "Check your email for your reset code.");
      // Ensure token input is empty — user must retrieve it from their email inbox
      setToken("");
      setStep(2);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Error sending reset email. Please verify the email address.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    setResending(true);
    try {
      const res = await api.post("/auth/request-reset-token", { email });
      toast.success(res.data.message || "A fresh reset code was sent to your email!");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not resend code. Please wait a moment.");
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error("Please enter the reset code sent to your email");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        reset_token: token.trim(),
        new_password: newPassword,
      });
      toast.success("Password reset successfully! Please log in with your new password.");
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Password reset failed. Please check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="pf-card p-8 sm:p-10 w-full max-w-md shadow-xl border border-[var(--pf-card-border)]">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[var(--pf-primary)]/10 text-[var(--pf-primary)] flex items-center justify-center mx-auto mb-4">
              {step === 1 ? <Mail className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              {step === 1 ? "Reset Password" : "Enter Verification Code"}
            </h1>
            <p className="text-xs sm:text-sm mt-2" style={{ color: "var(--pf-muted)" }}>
              {step === 1
                ? "Enter your registered email and we'll send you a verification code."
                : `We sent a reset code to ${email || "your email"}. Check your inbox to continue.`}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleRequestToken} className="space-y-4" data-testid="reset-request-form">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--pf-muted)" }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    data-testid="reset-email-input"
                    id="reset-email-input"
                    className="pf-input pl-10 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="pf-btn-primary w-full mt-2 cursor-pointer flex items-center justify-center gap-2"
                data-testid="reset-request-btn"
                id="reset-request-btn"
              >
                {loading ? "Sending reset code..." : "Send Reset Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4" data-testid="reset-password-form">
              {/* Inbox confirmation card */}
              <div className="p-3.5 rounded-xl bg-[var(--pf-card-border)]/25 border border-[var(--pf-card-border)] text-xs flex items-start gap-2.5">
                <Inbox className="w-4 h-4 text-[var(--pf-primary)] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold block text-[var(--pf-text)]">Check your email for a reset code</span>
                  <span style={{ color: "var(--pf-muted)" }}>
                    We dispatched your code to <strong>{email}</strong>. Codes expire in 15 minutes.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                  Verification Code (from email)
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--pf-muted)" }} />
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="e.g. 6-digit code"
                    data-testid="reset-token-input"
                    id="reset-token-input"
                    className="pf-input pl-10 text-sm font-mono tracking-wider"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--pf-muted)" }} />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    minLength={8}
                    autoComplete="new-password"
                    data-testid="reset-new-password-input"
                    id="reset-new-password-input"
                    className="pf-input pl-10 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--pf-muted)" }} />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    data-testid="reset-confirm-password-input"
                    id="reset-confirm-password-input"
                    className="pf-input pl-10 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="pf-btn-primary w-full mt-3 cursor-pointer"
                data-testid="reset-confirm-btn"
                id="reset-confirm-btn"
              >
                {loading ? "Updating Password..." : "Update Password"}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resending}
                  className="pf-link inline-flex items-center gap-1 cursor-pointer"
                  id="resend-code-btn"
                >
                  <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
                  <span>{resending ? "Sending..." : "Resend code"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[var(--pf-muted)] hover:text-[var(--pf-text)] transition-colors cursor-pointer"
                  id="change-email-btn"
                >
                  Change email
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-[var(--pf-card-border)] text-center">
            <Link to="/login" className="pf-link text-xs inline-flex items-center gap-1 font-semibold" id="back-to-login-link">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Log in
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

