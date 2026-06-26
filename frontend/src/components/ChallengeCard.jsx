import { Link } from "react-router-dom";
import { Clock, Calendar, ArrowUpRight } from "lucide-react";
import { daysRemaining, initialsFromName } from "@/lib/api";

function DifficultyBadge({ difficulty }) {
  const cls =
    difficulty === "Beginner" ? "pf-badge-beginner" :
    difficulty === "Advanced" ? "pf-badge-advanced" : "pf-badge-intermediate";
  return (
    <span className={`${cls} px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
      {difficulty}
    </span>
  );
}

export default function ChallengeCard({ challenge, testId }) {
  const days = daysRemaining(challenge.deadline);
  const initials = initialsFromName(challenge.org);
  return (
    <Link
      to={`/challenges/${challenge.id}`}
      className="pf-card p-6 flex flex-col gap-4 group"
      data-testid={testId || `challenge-card-${challenge.id}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center font-display font-bold text-white text-sm"
            style={{ background: "linear-gradient(135deg, var(--pf-secondary), var(--pf-primary))" }}
          >
            {initials}
          </div>
          <div>
            <div className="text-sm font-semibold">{challenge.org}</div>
            <span className="pf-tag mt-1">{challenge.category}</span>
          </div>
        </div>
        <DifficultyBadge difficulty={challenge.difficulty} />
      </div>

      <h3 className="font-display font-extrabold text-xl leading-snug group-hover:text-[var(--pf-primary)] transition-colors">
        {challenge.title}
      </h3>
      <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--pf-muted)" }}>
        {challenge.description}
      </p>

      <div className="flex items-center gap-4 text-xs" style={{ color: "var(--pf-muted)" }}>
        <span className="inline-flex items-center gap-1.5"><Calendar size={14}/> {days} days left</span>
        <span className="inline-flex items-center gap-1.5"><Clock size={14}/> {challenge.est_time}</span>
      </div>

      <div className="pt-3 mt-auto border-t flex items-center justify-between" style={{ borderColor: "var(--pf-card-border)" }}>
        <span className="text-sm font-bold text-[var(--pf-primary)]">View Challenge</span>
        <ArrowUpRight size={18} className="text-[var(--pf-primary)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"/>
      </div>
    </Link>
  );
}

export { DifficultyBadge };
