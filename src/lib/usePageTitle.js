import { useEffect } from "react";

const BASE = "KIVO";

/* Sets the browser-tab title for a page, e.g. "Browse challenges · KIVO". */
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : `${BASE} — Make your work matter`;
  }, [title]);
}
