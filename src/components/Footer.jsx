import { Link } from "react-router-dom";
import Logo from "@/components/Logo";

export default function Footer() {
  const link = "text-[var(--pf-muted)] hover:text-[var(--pf-text)] transition-colors";
  return (
    <footer className="relative mt-24 border-t" style={{ borderColor: "var(--pf-card-border)", background: "var(--pf-card-bg)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-8 grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-[34ch] text-[.95rem]" style={{ color: "var(--pf-muted)" }}>
            Real briefs from organisations. Verified work from people who want to prove their skills.
          </p>
        </div>

        <nav className="grid gap-2 text-[.92rem] font-medium content-start" aria-label="For contributors">
          <span className="pf-kicker mb-1">Contributors</span>
          <Link to="/challenges" className={link}>Browse challenges</Link>
          <Link to="/signup" className={link}>Create your profile</Link>
          <Link to="/dashboard" className={link}>Dashboard</Link>
        </nav>

        <nav className="grid gap-2 text-[.92rem] font-medium content-start" aria-label="For organisations">
          <span className="pf-kicker mb-1">Organisations</span>
          <Link to="/submit-challenge" className={link}>Host a challenge</Link>
          <Link to="/talent" className={link}>Talent directory</Link>
        </nav>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8 pt-5 flex flex-wrap justify-between gap-2 text-xs border-t" style={{ color: "var(--pf-muted)", borderColor: "var(--pf-rule)" }}>
        <span>© {new Date().getFullYear()} ProjectForum. All rights reserved.</span>
        <span className="pf-mono">Built in Bengaluru</span>
      </div>
    </footer>
  );
}
