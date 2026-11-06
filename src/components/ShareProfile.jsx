import { useState } from "react";
import { Link2, Linkedin, Check } from "lucide-react";
import { burst } from "@/components/Interactions";

/* Shown on your own public profile: copy the link, or share it on LinkedIn. */
export default function ShareProfile({ name }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href.split("#")[0].split("?")[0] : "";

  const copy = async (e) => {
    const el = e.currentTarget;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      burst(el, 10);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Copy your profile link:", url);
    }
  };

  const linkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div
      className="pf-card p-5 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      style={{ background: "color-mix(in srgb, var(--pf-primary) 6%, var(--pf-card-bg))" }}
      data-testid="share-profile"
    >
      <div className="min-w-0">
        <p className="font-semibold">Share your profile</p>
        <p className="text-sm" style={{ color: "var(--pf-muted)" }}>
          Put this link on your resume, LinkedIn and applications. Only you see this box.
        </p>
        <p className="pf-mono text-xs mt-1 truncate" style={{ color: "var(--pf-muted)" }} title={url}>{url}</p>
      </div>
      <div className="flex flex-wrap gap-2 shrink-0">
        <button type="button" onClick={copy} className="pf-btn-primary !py-2 !px-4 !text-sm" data-testid="copy-profile-link">
          {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
          {copied ? "Copied" : "Copy link"}
        </button>
        <a href={linkedIn} target="_blank" rel="noreferrer" className="pf-btn-secondary !py-2 !px-4 !text-sm" data-testid="share-linkedin">
          <Linkedin className="w-4 h-4" /> Share on LinkedIn
        </a>
      </div>
    </div>
  );
}
