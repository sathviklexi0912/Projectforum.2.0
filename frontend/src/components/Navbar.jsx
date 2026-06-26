import { Link, NavLink, useNavigate } from "react-router-dom";
import { Moon, Sun, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const linkBase = "font-medium text-[15px] transition-colors";
  const navClass = ({ isActive }) =>
    `${linkBase} ${isActive ? "text-[var(--pf-primary)]" : "text-[var(--pf-text)] hover:text-[var(--pf-primary)]"}`;

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl border-b"
      style={{
        backgroundColor: theme === "dark" ? "rgba(13,11,26,0.8)" : "rgba(245,244,255,0.8)",
        borderColor: "var(--pf-card-border)",
      }}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" data-testid="logo-home">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-display text-white text-lg"
            style={{ background: "linear-gradient(135deg, var(--pf-primary), var(--pf-secondary))" }}
          >
            P
          </div>
          <span className="font-display text-xl font-extrabold">ProjectForum</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={navClass} data-testid="nav-home">Home</NavLink>
          <NavLink to="/challenges" className={navClass} data-testid="nav-challenges">Challenges</NavLink>
          <NavLink to="/submit-challenge" className={navClass} data-testid="nav-submit-challenge">Submit a Challenge</NavLink>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[var(--pf-tag-bg)] transition-colors"
            data-testid="theme-toggle"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {user ? (
            <>
              <Link to="/dashboard" className="pf-link" data-testid="nav-dashboard">Dashboard</Link>
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="pf-btn-secondary"
                data-testid="logout-btn"
              >
                <LogOut size={16}/> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="pf-btn-secondary" data-testid="nav-signin">Sign In</Link>
              <Link to="/signup" className="pf-btn-primary" data-testid="nav-get-started">Get Started</Link>
            </>
          )}
        </div>

        <button
          className="md:hidden w-10 h-10 flex items-center justify-center"
          onClick={() => setOpen((o) => !o)}
          data-testid="mobile-menu-toggle"
          aria-label="Menu"
        >
          {open ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t" style={{ borderColor: "var(--pf-card-border)" }}>
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3">
            <Link to="/" onClick={() => setOpen(false)} className={linkBase} data-testid="mobile-nav-home">Home</Link>
            <Link to="/challenges" onClick={() => setOpen(false)} className={linkBase} data-testid="mobile-nav-challenges">Challenges</Link>
            <Link to="/submit-challenge" onClick={() => setOpen(false)} className={linkBase} data-testid="mobile-nav-submit">Submit a Challenge</Link>
            {user ? (
              <Link to="/dashboard" onClick={() => setOpen(false)} className={linkBase} data-testid="mobile-nav-dashboard">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className={linkBase} data-testid="mobile-nav-signin">Sign In</Link>
                <Link to="/signup" onClick={() => setOpen(false)} className={linkBase} data-testid="mobile-nav-signup">Get Started</Link>
              </>
            )}
            <button onClick={toggle} className="text-left text-[var(--pf-secondary)] font-medium" data-testid="mobile-theme-toggle">
              Switch to {theme === "dark" ? "light" : "dark"} mode
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
