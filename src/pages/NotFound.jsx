import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import usePageTitle from "@/lib/usePageTitle";

export default function NotFound() {
  usePageTitle("Page not found");
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 grid place-items-center px-4 py-20">
        <div className="text-center max-w-md" data-testid="not-found">
          <span className="pf-mono text-sm" style={{ color: "var(--pf-muted)" }}>404</span>
          <h1 className="font-display text-[clamp(2.2rem,6vw,3.4rem)] mt-2">This page doesn't exist</h1>
          <p className="mt-3" style={{ color: "var(--pf-muted)" }}>
            The link may be mistyped, or the page may have been moved or removed.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/" className="pf-btn-primary">Go to the homepage</Link>
            <Link to="/challenges" className="pf-btn-secondary"><Compass className="w-4 h-4" /> Browse challenges</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
