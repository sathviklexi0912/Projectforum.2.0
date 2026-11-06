import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, GraduationCap, Briefcase, ShieldCheck, Linkedin, ArrowRight, User, Filter, CheckCircle2, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import usePageTitle from "@/lib/usePageTitle";
import { profileSubtitle } from "@/components/ProfileTypeFields";

const SKILL_FILTERS = ["All", "Marketing", "Finance", "Strategy", "Analytics", "Tech", "GTM"];

export default function TalentDirectory() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [openToOppOnly, setOpenToOppOnly] = useState(false);
  usePageTitle("Talent directory");

  useEffect(() => {
    setLoading(true);
    api.get("/talent")
      .then((res) => setStudents(res.data))
      .catch(() => setStudents([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // 1. Open to Opportunities Filter
      if (openToOppOnly && !s.open_to_opportunities) {
        return false;
      }

      // 2. Skill/Domain Filter
      if (selectedSkill !== "All") {
        const matchesSkill = Array.isArray(s.skills) && s.skills.some(
          (sk) => sk.toLowerCase() === selectedSkill.toLowerCase()
        );
        if (!matchesSkill) return false;
      }

      // 3. Search Query Filter
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const matchesName = s.name?.toLowerCase().includes(q);
      const matchesHeadline = s.headline?.toLowerCase().includes(q);
      const matchesUniversity = s.university?.toLowerCase().includes(q);
      const matchesBio = s.bio?.toLowerCase().includes(q);
      const matchesSkills = Array.isArray(s.skills) && s.skills.some(
        (sk) => sk.toLowerCase().includes(q)
      );

      return matchesName || matchesHeadline || matchesUniversity || matchesBio || matchesSkills;
    });
  }, [students, openToOppOnly, selectedSkill, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col" data-testid="talent-directory-page">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 lg:px-10 py-12 w-full">
        {/* Header */}
        <div className="mb-10">
          <span className="pf-tag mb-3 inline-block">Verified Contributors</span>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight">Talent Directory</h1>
          <p className="text-base mt-3 max-w-2xl" style={{ color: "var(--pf-muted)" }}>
            Discover people who have completed real challenges and built a record of verified work.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="space-y-4 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--pf-muted)" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, skill, institution or keyword..."
                data-testid="talent-search-input"
                className="pf-input pl-11 pr-10 py-3 text-sm rounded-2xl shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                  title="Clear search"
                  data-testid="clear-talent-search"
                >
                  <X className="w-4 h-4" style={{ color: "var(--pf-muted)" }} />
                </button>
              )}
            </div>

            {/* Open to Opportunities Toggle */}
            <label className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl border border-[var(--pf-card-border)] bg-[var(--pf-card-bg)] cursor-pointer hover:border-[var(--pf-primary)] transition-all select-none">
              <input
                type="checkbox"
                checked={openToOppOnly}
                onChange={(e) => setOpenToOppOnly(e.target.checked)}
                data-testid="open-to-opp-toggle"
                className="w-4 h-4 rounded text-[var(--pf-primary)] focus:ring-[var(--pf-primary)] cursor-pointer"
              />
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Open to Opportunities Only</span>
              </div>
            </label>
          </div>

          {/* Skill Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap gap-2" data-testid="skill-chips">
              {SKILL_FILTERS.map((s) => {
                const active = selectedSkill === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedSkill(s)}
                    data-testid={`skill-filter-${s.toLowerCase()}`}
                    className="px-4 py-2 rounded-full text-xs font-bold transition-all"
                    style={active
                      ? { background: "var(--pf-secondary)", color: "#fff", border: "1px solid var(--pf-secondary)" }
                      : { background: "transparent", color: "var(--pf-text)", border: "1px solid var(--pf-card-border)" }
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            {!loading && (
              <span className="text-xs font-semibold" style={{ color: "var(--pf-muted)" }} data-testid="talent-count">
                Showing {filteredStudents.length} {filteredStudents.length === 1 ? "candidate" : "candidates"}
              </span>
            )}
          </div>
        </div>

        {/* Talent Grid */}
        {loading ? (
          <div className="py-20 text-center flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--pf-primary)]"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="pf-empty" data-testid="no-talent">
            <div className="pf-empty-icon"><User className="w-5 h-5" /></div>
            <h3 className="font-display">{searchQuery || openToOppOnly || selectedSkill !== "All" ? "No one matches those filters" : "The first profiles are coming"}</h3>
            <p className="mb-5">
              {searchQuery || openToOppOnly || selectedSkill !== "All"
                ? "Try adjusting your search query or filters."
                : "Contributors appear here once they sign up. Completing a challenge puts verified work on their card."}
            </p>
            {(searchQuery || openToOppOnly || selectedSkill !== "All") ? <button
              onClick={() => { setSearchQuery(""); setSelectedSkill("All"); setOpenToOppOnly(false); }}
              className="pf-btn-secondary text-xs"
              data-testid="reset-talent-filters"
            >
              Reset filters
            </button> : <Link to="/signup" className="pf-btn-primary">Create your profile</Link>}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="talent-grid">
            {filteredStudents.map((student) => (
              <div key={student.id} className="pf-card p-6 flex flex-col justify-between" data-testid={`talent-card-${student.id}`}>
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--pf-tag-bg)] text-[var(--pf-primary)] flex items-center justify-center font-bold text-lg border border-[var(--pf-primary)]">
                        {student.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold flex items-center gap-1.5">
                          <span>{student.name}</span>
                          {student.verified_submissions_count > 0 && (
                            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" title="Verified Contributor" />
                          )}
                        </h3>
                        {(student.university || profileSubtitle(student)) && (
                          <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "var(--pf-muted)" }}>
                            {student.profile_type === "professional"
                              ? <Briefcase className="w-3.5 h-3.5 text-[var(--pf-secondary)] shrink-0" />
                              : <GraduationCap className="w-3.5 h-3.5 text-[var(--pf-secondary)] shrink-0" />}
                            <span className="truncate">{student.profile_type === "professional" ? [student.current_role, student.university].filter(Boolean).join(" · ") : student.university}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {student.open_to_opportunities && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 whitespace-nowrap">
                        Open to Work
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold mb-3 line-clamp-2" style={{ color: "var(--pf-muted)" }}>
                    {student.headline || "ProjectForum contributor"}
                  </p>

                  {student.skills && student.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {student.skills.map((sk) => (
                        <span key={sk} className="text-[10px] font-semibold px-2 py-0.5 rounded-md" style={{ background: "var(--pf-tag-bg)", color: "var(--pf-tag-text)" }}>
                          #{sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[var(--pf-card-border)] flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-600">
                    {student.verified_submissions_count} Verified {student.verified_submissions_count === 1 ? "Project" : "Projects"}
                  </span>
                  <Link
                    to={`/profile/${student.id}`}
                    className="pf-link inline-flex items-center gap-1 text-xs font-bold"
                    data-testid={`view-profile-btn-${student.id}`}
                  >
                    View Portfolio <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
