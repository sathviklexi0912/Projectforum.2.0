import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon, LogOut, Menu, X } from "lucide-react";
import { burst } from "@/components/Interactions";
import Logo from "@/components/Logo";

const LINKS = [
  { to: "/challenges", label: "Challenges", testId: "nav-challenges" },
  { to: "/talent", label: "Talent", testId: "nav-talent" },
  { to: "/submit-challenge", label: "Host a challenge", testId: "nav-host" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const onTheme = (e) => {
    burst(e.currentTarget);
    toggleTheme();
  };

  const links = user ? [...LINKS, { to: "/dashboard", label: "Dashboard", testId: "nav-dashboard" }] : LINKS;

  const pill = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg transition-colors ${
      isActive
        ? "text-[var(--pf-primary)] bg-[var(--pf-tag-bg)]"
        : "text-[var(--pf-muted)] hover:text-[var(--pf-text)]"
    }`;

  return (
    <>
    <header
      className="sticky top-0 z-50 border-b transition-colors"
      style={{
        background: "color-mix(in srgb, var(--pf-bg) 88%, transparent)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderColor: "var(--pf-card-border)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Logo testId="nav-logo" />

        <nav className="hidden md:flex items-center gap-1 text-[.9rem] font-semibold" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={pill} data-testid={l.testId}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onTheme}
            className="w-10 h-10 grid place-items-center rounded-[10px] border border-[var(--pf-card-border)] bg-[var(--pf-card-bg)] hover:border-[var(--pf-primary)] transition-colors"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title="Switch theme"
            data-testid="theme-toggle"
          >
            {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to={`/profile/${user.id}`}
                className="flex items-center gap-2 text-[.82rem] font-semibold pl-1 pr-3 py-1 rounded-[10px] border border-[var(--pf-card-border)] bg-[var(--pf-card-bg)] transition-all max-w-[180px]"
                data-testid="nav-user-profile"
              >
                <span className="w-7 h-7 rounded-[7px] grid place-items-center text-[.75rem] font-bold shrink-0" style={{ background: "var(--pf-primary)", color: "var(--pf-on-primary)" }}>
                  {(user.name || "?").trim().charAt(0).toUpperCase()}
                </span>
                <span className="truncate">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-10 h-10 grid place-items-center rounded-[10px] border border-[var(--pf-card-border)] bg-[var(--pf-card-bg)] text-[var(--pf-muted)] hover:text-red-500 transition-all"
                aria-label="Log out"
                title="Log out"
                data-testid="nav-logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1">
              <Link to="/login" className="px-3 py-2 text-[.88rem] font-semibold text-[var(--pf-muted)] hover:text-[var(--pf-text)] transition-colors" data-testid="nav-login">
                Log in
              </Link>
              <Link to="/signup" className="pf-btn-primary !py-2 !px-4 !text-[.85rem]" data-testid="nav-signup">
                Sign up
              </Link>
            </div>
          )}

          <button
            className="md:hidden w-10 h-10 grid place-items-center rounded-[10px] border border-[var(--pf-card-border)] bg-[var(--pf-card-bg)]"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            data-testid="nav-menu-toggle"
          >
            {open ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
          </button>
        </div>
      </div>
    </header>

      {open && (
        <div
          id="mobile-menu"
          className="md:hidden fixed inset-x-0 top-16 bottom-0 z-40 px-4 pt-4 pb-8 overflow-y-auto pf-fade-up"
          style={{ background: "var(--pf-bg)" }}
        >
          <nav className="flex flex-col" aria-label="Mobile">
            {links.map((l, i) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `flex items-baseline justify-between py-4 border-b font-display font-bold text-[1.8rem] leading-none tracking-[-.03em] ${
                    isActive ? "text-[var(--pf-primary)]" : "text-[var(--pf-text)]"
                  }`
                }
              >
                {l.label}
                <span className="pf-mono text-xs text-[var(--pf-muted)]">0{i + 1}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 grid gap-3">
            {user ? (
              <>
                <Link to={`/profile/${user.id}`} className="pf-btn-secondary w-full">View my public profile</Link>
                <button onClick={handleLogout} className="pf-btn-secondary w-full !text-red-500">
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/signup" className="pf-btn-primary w-full">Create your profile</Link>
                <Link to="/login" className="pf-btn-secondary w-full">Log in</Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
