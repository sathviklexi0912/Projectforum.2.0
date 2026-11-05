import { useEffect } from "react";

const BASE = "ProjectForum";

/* Sets the browser-tab title for a page, e.g. "Browse challenges · ProjectForum". */
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : `${BASE} — Prove your skills on real business problems`;
  }, [title]);
}
