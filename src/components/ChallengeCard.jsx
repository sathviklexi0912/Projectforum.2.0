import { Link } from "react-router-dom";
import { Clock, ArrowUpRight, Hourglass } from "lucide-react";
import { daysRemaining, initialsFromName } from "@/lib/api";

function DifficultyBadge({ difficulty }) {
  const cls =
    difficulty === "Beginner" ? "pf-badge-beginner" :
    difficulty === "Advanced" ? "pf-badge-advanced" : "pf-badge-intermediate";
  return (
    <span className={`${cls} px-2 py-0.5 rounded-md text-[10px] uppercase whitespace-nowrap`}>
      {difficulty}
    </span>
  );
}

/* each category gets its own tile colour, so the board is easy to scan */
const CAT = {
  Marketing: ["#fbe9e2", "#8a3a1a"],
  Finance: ["#e2f3ea", "#17603f"],
  Strategy: ["#e7e8fb", "#33328f"],
  Entrepreneurship: ["#f8efd6", "#6e5208"],
  Tech: ["#e1f0f7", "#175470"],
  Engineering: ["#e1f0f7", "#175470"],
  "Data & AI": ["#eae6f7", "#4a3a8a"],
  Operations: ["#efece4", "#5a4a2a"],
  Design: ["#f7e6ee", "#7a2a50"],
};
export function categoryColors(cat) {
  return CAT[cat] || ["#e7e8f0", "#33364f"];
}

export default function ChallengeCard({ challenge, testId }) {
  const days = daysRemaining(challenge.deadline);
  const initials = initialsFromName(challenge.org);
  const urgent = typeof days === "number" && days <= 7;
  const [bg, fg] = categoryColors(challenge.category);
  return (
    <Link
      to={`/challenges/${challenge.id}`}
      className="pf-card p-5 flex flex-col gap-3.5 group overflow-hidden"
      data-testid={testId || `challenge-card-${challenge.id}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="px-2.5 py-1 rounded-md text-[.7rem] font-semibold uppercase tracking-[.07em]" style={{ background: bg, color: fg }}>
          {challenge.category}
        </span>
        <DifficultyBadge difficulty={challenge.difficulty} />
      </div>

      <h3 className="font-display text-[1.28rem] leading-[1.18] tracking-[-.025em]">
        {challenge.title}
      </h3>

      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-7 h-7 rounded-md grid place-items-center text-[.68rem] font-bold border shrink-0" style={{ borderColor: "var(--pf-card-border)" }}>
          {initials}
        </span>
        <span className="text-sm font-semibold truncate" style={{ color: "var(--pf-muted)" }}>{challenge.org}</span>
      </div>

      <p className="text-[.92rem] leading-relaxed line-clamp-2" style={{ color: "var(--pf-muted)" }}>
        {challenge.description}
      </p>

      {Array.isArray(challenge.tags) && challenge.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {challenge.tags.map((tag) => (
            <span key={tag} className="pf-tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="pt-3.5 mt-auto border-t flex items-center justify-between gap-3 text-xs pf-mono" style={{ borderColor: "var(--pf-rule)", color: "var(--pf-muted)" }}>
        <div className="flex items-center gap-4">
          <span className={`inline-flex items-center gap-1.5 ${urgent ? "font-bold" : ""}`} style={urgent ? { color: "#c2263e" } : undefined}>
            <Hourglass size={13} /> {days > 0 ? `${days}d left` : "Closing"}
          </span>
          {challenge.est_time && (
            <span className="inline-flex items-center gap-1.5"><Clock size={13} /> {challenge.est_time}</span>
          )}
        </div>
        <span
          className="w-8 h-8 rounded-lg grid place-items-center border transition-all group-hover:bg-[var(--pf-primary)] group-hover:text-[var(--pf-on-primary)]"
          style={{ borderColor: "var(--pf-card-border)", color: "var(--pf-text)" }}
          aria-hidden="true"
        >
          <ArrowUpRight size={16} className="group-hover:rotate-45 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

export { DifficultyBadge };
