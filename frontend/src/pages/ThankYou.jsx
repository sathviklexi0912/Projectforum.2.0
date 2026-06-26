import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ThankYou() {
  return (
    <div className="App" data-testid="thank-you-page">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6"
          style={{ background: "var(--pf-tag-bg)", color: "var(--pf-primary)" }}>
          <CheckCircle2 size={32}/>
        </div>
        <span className="pf-tag mb-3 inline-block">Submission received</span>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tighter mb-4">Nice work.</h1>
        <p className="text-base sm:text-lg mb-8" style={{ color: "var(--pf-muted)" }}>
          Our team reviews submissions within 5–7 days. If your work stands out, the company will reach out for a fast-tracked interview. Status updates appear on your dashboard.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/dashboard/submissions" className="pf-btn-primary" data-testid="ty-view-submissions">View my submissions</Link>
          <Link to="/challenges" className="pf-btn-secondary" data-testid="ty-browse-more">Browse more challenges</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
