import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChallengeCard from "@/components/ChallengeCard";
import { api } from "@/lib/api";

const FILTERS = ["All", "Marketing", "Finance", "Strategy", "Entrepreneurship"];

export default function BrowseChallenges() {
  const [filter, setFilter] = useState("All");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/challenges${filter !== "All" ? `?category=${filter}` : ""}`)
      .then((r) => setItems(r.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="App" data-testid="browse-page">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="mb-10">
          <span className="pf-tag mb-3 inline-block">All challenges</span>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tighter">Browse challenges</h1>
          <p className="text-base mt-3 max-w-2xl" style={{ color: "var(--pf-muted)" }}>
            Pick a brief, do the work, and earn a shot at an interview with real companies.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8" data-testid="filter-chips">
          {FILTERS.map((f) => {
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                data-testid={`filter-${f.toLowerCase()}`}
                className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                style={active
                  ? { background: "var(--pf-primary)", color: "#fff", border: "1px solid var(--pf-primary)" }
                  : { background: "transparent", color: "var(--pf-text)", border: "1px solid var(--pf-card-border)" }
                }
              >
                {f}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-16" style={{ color: "var(--pf-muted)" }}>Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--pf-muted)" }} data-testid="no-challenges">
            No challenges in this category yet.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="challenges-grid">
            {items.map((c) => <ChallengeCard key={c.id} challenge={c} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
