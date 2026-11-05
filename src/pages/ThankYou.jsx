import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import usePageTitle from "@/lib/usePageTitle";

export default function ThankYou() {
  usePageTitle("Thank you");
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="pf-card p-10 max-w-lg w-full">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
          <h1 className="font-display text-3xl font-extrabold mb-3">Proposal Received!</h1>
          <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--pf-muted)" }}>
            Thank you for submitting your challenge proposal. Our admin review team will review the details and publish it to the active challenge board.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/challenges" className="pf-btn-primary text-xs py-3 px-6">
              Browse Active Challenges <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
