import { Link } from "react-router-dom";

/* KIVO wordmark: a "K" tile + the name */
export default function Logo({ size = "md", testId }) {
  const big = size === "lg";
  return (
    <Link to="/" className="inline-flex items-center gap-2.5 shrink-0 group" data-testid={testId} aria-label="KIVO home">
      <span
        className={`relative grid place-items-center font-display font-bold rounded-[9px] ${big ? "w-10 h-10 text-xl" : "w-8 h-8 text-[1.05rem]"}`}
        style={{ background: "var(--pf-primary)", color: "var(--pf-on-primary)" }}
        aria-hidden="true"
      >
        K
        <span className="absolute right-[5px] bottom-[5px] w-[5px] h-[5px] rounded-full" style={{ background: "var(--pf-accent)" }} />
      </span>
      <span className={`font-display font-bold tracking-[-.03em] text-[var(--pf-text)] ${big ? "text-[1.7rem]" : "text-[1.25rem]"}`}>
        KIVO
      </span>
    </Link>
  );
}
