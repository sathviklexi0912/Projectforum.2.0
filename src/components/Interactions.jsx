import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/*
  Site-wide motion layer, mounted once in App.js:
  - soft accent glow that follows the cursor (desktop only)
  - thin reading-progress bar at the top
  - cursor spotlight inside every .pf-card
  - scroll-reveal for any element with data-reveal
  - scroll-linked position (--p) for .pf-band elements
  Everything is skipped when the visitor prefers reduced motion.
*/
export default function Interactions() {
  const glowRef = useRef(null);
  const barRef = useRef(null);
  const { pathname } = useLocation();

  // start each new page at the top
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const glow = glowRef.current;
    const bar = barRef.current;

    let gx = 0, gy = 0, tx = 0, ty = 0, raf = 0;
    const loop = () => {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      if (glow) glow.style.transform = `translate(${gx}px, ${gy}px)`;
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e) => {
      tx = e.clientX; ty = e.clientY;
      if (glow && !glow.classList.contains("on")) glow.classList.add("on");
      const card = e.target.closest && e.target.closest(".pf-card");
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
    };
    const onLeave = () => glow && glow.classList.remove("on");

    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
      document.querySelectorAll(".pf-band").forEach((el) => {
        const r = el.getBoundingClientRect();
        const p = 1 - (r.top + r.height) / (window.innerHeight + r.height);
        el.style.setProperty("--p", Math.min(1, Math.max(0, p)).toFixed(3));
      });
    };

    // scroll reveal
    const io = "IntersectionObserver" in window && !reduce
      ? new IntersectionObserver((entries) => {
          entries.forEach((en) => {
            if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
          });
        }, { rootMargin: "0px 0px -8% 0px" })
      : null;
    const prep = () => {
      if (!io) return;
      document.querySelectorAll("[data-reveal]:not(.in)").forEach((el) => {
        if (el.classList.contains("pf-reveal") && el.dataset.watched === "1") return;
        el.dataset.watched = "1";
        el.classList.add("pf-reveal");
        const d = el.getAttribute("data-reveal");
        if (d) el.style.transitionDelay = `${Number(d) * 70}ms`;
        io.observe(el);
      });
      onScroll();
    };
    const mo = new MutationObserver(prep);
    mo.observe(document.getElementById("root") || document.body, { childList: true, subtree: true });
    prep();

    if (!reduce) {
      if (fine) {
        window.addEventListener("pointermove", onMove, { passive: true });
        document.documentElement.addEventListener("pointerleave", onLeave);
        raf = requestAnimationFrame(loop);
      }
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mo.disconnect();
      io && io.disconnect();
      document.querySelectorAll("[data-watched]").forEach((el) => { delete el.dataset.watched; });
    };
  }, []);

  return (
    <>
      <div className="pf-progress" ref={barRef} aria-hidden="true" />
    </>
  );
}

/* A small burst of dots from an element — used for "copy link", theme switch etc. */
export function burst(el, n = 12) {
  if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  for (let i = 0; i < n; i++) {
    const d = document.createElement("span");
    d.className = "pf-burst";
    d.style.left = `${cx - 4}px`;
    d.style.top = `${cy - 4}px`;
    document.body.appendChild(d);
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.4;
    const dist = 34 + Math.random() * 30;
    d.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${Math.cos(a) * dist}px, ${Math.sin(a) * dist}px) scale(.2)`, opacity: 0 },
      ],
      { duration: 650, easing: "cubic-bezier(.2,.8,.2,1)" }
    ).onfinish = () => d.remove();
  }
}
