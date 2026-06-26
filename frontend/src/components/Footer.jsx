import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      className="border-t mt-24"
      style={{ borderColor: "var(--pf-card-border)" }}
      data-testid="footer"
    >
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-display text-white"
              style={{ background: "linear-gradient(135deg, var(--pf-primary), var(--pf-secondary))" }}
            >P</div>
            <span className="font-display text-lg font-extrabold">ProjectForum</span>
          </div>
          <p className="text-sm" style={{ color: "var(--pf-muted)" }}>
            Your work speaks louder than your resume.
          </p>
        </div>
        <div>
          <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-3">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/challenges" className="pf-link" data-testid="footer-challenges">Browse Challenges</Link></li>
            <li><Link to="/submit-challenge" className="pf-link" data-testid="footer-submit">For Companies</Link></li>
            <li><Link to="/signup" className="pf-link" data-testid="footer-signup">Join as Student</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-bold text-sm uppercase tracking-wider mb-3">Resources</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/login" className="pf-link" data-testid="footer-login">Sign In</Link></li>
            <li><Link to="/reset-password" className="pf-link" data-testid="footer-reset">Reset Password</Link></li>
            <li><Link to="/admin" className="pf-link" data-testid="footer-admin">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t" style={{ borderColor: "var(--pf-card-border)" }}>
        <div className="max-w-7xl mx-auto px-6 py-6 text-xs flex justify-between" style={{ color: "var(--pf-muted)" }}>
          <span>© {new Date().getFullYear()} ProjectForum</span>
          <span>Built for students who do the work.</span>
        </div>
      </div>
    </footer>
  );
}
