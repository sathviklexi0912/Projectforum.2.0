import { useEffect, useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChallengeCard from "@/components/ChallengeCard";
import { api, categoryFilters } from "@/lib/api";
import usePageTitle from "@/lib/usePageTitle";


export default function BrowseChallenges() {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  usePageTitle("Browse challenges");

  useEffect(() => {
    setLoading(true);
    api.get("/challenges")
      .then((r) => setItems(r.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((c) => {
      // 1. Domain/Category filter
      const matchesCategory =
        filter === "All" || c.category?.toLowerCase() === filter.toLowerCase();

      if (!matchesCategory) return false;

      // 2. Real-time search query matching
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchesTitle = c.title?.toLowerCase().includes(q);
      const matchesDomain = c.category?.toLowerCase().includes(q);
      const matchesOrg = c.org?.toLowerCase().includes(q);
      const matchesDescription = c.description?.toLowerCase().includes(q);
      const matchesTags = Array.isArray(c.tags) && c.tags.some((tag) => tag.toLowerCase().includes(q));

      return matchesTitle || matchesDomain || matchesOrg || matchesDescription || matchesTags;
    });
  }, [items, filter, searchQuery]);

  return (
    <div className="App" data-testid="browse-page">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="mb-8">
          <span className="pf-tag mb-3 inline-block">All challenges</span>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tighter">Browse challenges</h1>
          <p className="text-base mt-3 max-w-2xl" style={{ color: "var(--pf-muted)" }}>
            Pick a brief, do the work, and earn a shot at an interview with real companies.
          </p>
        </div>

        {/* Search bar & Category filters container */}
        <div className="space-y-4 mb-8">
          {/* Search input field */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: "var(--pf-muted)" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, skill tags, domain, or company..."
              data-testid="search-input"
              className="pf-input pl-12 pr-10 py-3 text-base w-full rounded-2xl shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                data-testid="clear-search-btn"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" style={{ color: "var(--pf-muted)" }} />
              </button>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap gap-2" data-testid="filter-chips">
              {categoryFilters(items).map((f) => {
                const active = filter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    data-testid={`filter-${f.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
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

            {/* Results counter indicator */}
            {!loading && (
              <div className="text-xs font-semibold tracking-wide" style={{ color: "var(--pf-muted)" }} data-testid="results-count">
                Showing {filteredItems.length} {filteredItems.length === 1 ? "challenge" : "challenges"}
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16" style={{ color: "var(--pf-muted)" }}>Loading…</div>
        ) : filteredItems.length === 0 ? (
          <div className="pf-empty" data-testid="no-challenges">
            <h3 className="font-display">{searchQuery || filter !== "All" ? "Nothing matches that" : "New challenges are on the way"}</h3>
            <p className="mb-5">
              {searchQuery
                ? `No results matching "${searchQuery}"${filter !== "All" ? ` in ${filter}` : ""}.`
                : "We're lining up the next briefs with companies. Check back soon, or set up your profile so you're ready."}
            </p>
            {(searchQuery || filter !== "All") && (
              <button
                onClick={() => { setSearchQuery(""); setFilter("All"); }}
                className="pf-btn-secondary text-xs"
                data-testid="reset-search-filter"
              >
                Clear search & filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="challenges-grid">
            {filteredItems.map((c) => <ChallengeCard key={c.id} challenge={c} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

