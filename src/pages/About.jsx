import { Link } from "react-router-dom";
import { ArrowRight, FileWarning, EyeOff, Compass, FileText, BadgeCheck, Link2, Search, Users, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import usePageTitle from "@/lib/usePageTitle";
import { BRAND_NAME, FOUNDER_NAME, CONTACT_EMAIL } from "@/content/brand";

const PROBLEMS = [
  {
    icon: FileWarning,
    title: "Resumes all look the same",
    text: "A line that says \"strong analytical skills\" tells a recruiter nothing. Grades and college names say where you studied, not what you can do.",
  },
  {
    icon: EyeOff,
    title: "Real ability stays invisible",
    text: "Plenty of capable people never get a first interview because there's no easy way to show the work they're capable of.",
  },
  {
    icon: Search,
    title: "Hiring teams guess",
    text: "Companies spend hours screening candidates and still can't see how someone actually thinks until much later in the process.",
  },
];

const BELIEFS = [
  ["Show, don't tell", "Work you've actually done beats any description of it."],
  ["Real problems, not textbook cases", "Challenges come from organisations with a real question to answer, plus practice briefs from KIVO while more hosts join."],
  ["Proof someone has checked", "Verified work carries the name and title of the person who reviewed it."],
  ["Open to everyone", "Students, graduates, professionals and career-switchers. Where you studied matters less than what you can do."],
];

export default function About() {
  usePageTitle("About");
  return (
    <div className="min-h-screen flex flex-col" data-testid="about-page">
      <Navbar />
      <main className="flex-1">
        {/* Intro */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 md:pt-20 pb-6">
          <span className="pf-kicker">About {BRAND_NAME}</span>
          <h1 className="font-display text-[clamp(2.4rem,6vw,4.2rem)] mt-4 max-w-[18ch]">
            Make your <span className="pf-mark">work</span> matter.
          </h1>
          <p className="mt-6 text-[1.12rem] max-w-[60ch]" style={{ color: "var(--pf-muted)" }}>
            {BRAND_NAME} is a platform where organisations post real business problems and people solve them. The best work is verified by whoever reviews it
            and lands on a public profile, so the next person who looks at you sees proof of what you can do, not just a list of claims.
          </p>
        </section>

        {/* Problem */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-14">
          <span className="pf-kicker">Why it exists</span>
          <h2 className="font-display text-[clamp(1.9rem,4vw,2.7rem)] leading-[1.08] mt-2 max-w-[24ch]">Hiring still runs on claims instead of evidence.</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-5">
            {PROBLEMS.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="pf-card p-6" data-reveal={i}>
                <span className="w-11 h-11 rounded-lg grid place-items-center border" style={{ background: "var(--pf-tag-bg)", color: "var(--pf-primary)", borderColor: "var(--pf-card-border)" }}>
                  <Icon className="w-5 h-5" />
                </span>
                <h3 className="font-display text-[1.25rem] mt-4">{title}</h3>
                <p className="mt-1.5 text-[.95rem]" style={{ color: "var(--pf-muted)" }}>{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20">
          <span className="pf-kicker">How it works</span>
          <h2 className="font-display text-[clamp(1.9rem,4vw,2.7rem)] leading-[1.08] mt-2">From brief to proof in three steps.</h2>
          <ol className="mt-8 grid md:grid-cols-3 gap-5">
            {[
              [Compass, "Pick a brief", "Choose a problem posted by an organisation or a KIVO practice brief, with its deliverables and how it will be judged."],
              [FileText, "Do the work", "Submit your deck, model or repository, and explain how you approached it."],
              [BadgeCheck, "Get verified", "The host reviews it. Verified work appears on your profile with the reviewer's name and title."],
            ].map(([Icon, t, d], i) => (
              <li key={t} className="pf-card p-6" data-reveal={i}>
                <div className="flex items-center justify-between">
                  <Icon className="w-5 h-5" style={{ color: "var(--pf-primary)" }} />
                  <span className="pf-mono text-sm font-semibold" style={{ color: "var(--pf-muted)" }}>Step {i + 1}</span>
                </div>
                <h3 className="font-display text-[1.25rem] mt-4">{t}</h3>
                <p className="mt-1.5 text-[.95rem]" style={{ color: "var(--pf-muted)" }}>{d}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Who it's for */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20">
          <span className="pf-kicker">Who it's for</span>
          <div className="mt-4 grid md:grid-cols-2 gap-6">
            <div className="pf-card p-7" data-reveal>
              <h3 className="font-display text-[1.45rem]">Contributors</h3>
              <p className="text-sm mt-1" style={{ color: "var(--pf-muted)" }}>Students, graduates, working professionals and career-switchers.</p>
              <ul className="mt-5 grid gap-2.5">
                {[[Compass, "Work on problems organisations actually have"], [BadgeCheck, "Earn verification from the people who set the brief"], [Link2, "Share one profile link with any employer"]].map(([Icon, t]) => (
                  <li key={t} className="flex items-center gap-3"><Icon className="w-4 h-4 shrink-0" style={{ color: "var(--pf-primary)" }} />{t}</li>
                ))}
              </ul>
            </div>
            <div className="pf-card p-7" data-reveal={1}>
              <h3 className="font-display text-[1.45rem]">Organisations</h3>
              <p className="text-sm mt-1" style={{ color: "var(--pf-muted)" }}>Companies, startups, recruiters and hiring teams.</p>
              <ul className="mt-5 grid gap-2.5">
                {[[FileText, "Post a real problem and see every approach"], [Search, "Find people by skill, not by pedigree"], [Users, "Shortlist from finished, verified work"]].map(([Icon, t]) => (
                  <li key={t} className="flex items-center gap-3"><Icon className="w-4 h-4 shrink-0" style={{ color: "var(--pf-primary)" }} />{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Beliefs */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20">
          <span className="pf-kicker">What we believe</span>
          <div className="mt-6 grid sm:grid-cols-2 gap-x-10 gap-y-6">
            {BELIEFS.map(([t, d]) => (
              <div key={t} className="border-t pt-4" style={{ borderColor: "var(--pf-card-border)" }}>
                <h3 className="font-display text-[1.2rem]">{t}</h3>
                <p className="mt-1 text-[.95rem]" style={{ color: "var(--pf-muted)" }}>{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Founder */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20">
          <div className="pf-card p-7 sm:p-9 grid md:grid-cols-[auto_1fr] gap-6 items-start" data-testid="about-founder">
            <span className="w-16 h-16 rounded-2xl grid place-items-center font-display text-2xl font-bold" style={{ background: "var(--pf-primary)", color: "var(--pf-on-primary)" }} aria-hidden="true">
              {FOUNDER_NAME.charAt(0)}
            </span>
            <div>
              <span className="pf-kicker">From the founder</span>
              <p className="font-display text-[1.35rem] leading-snug mt-2 max-w-[48ch]">
                "I started {BRAND_NAME} because I kept seeing capable people get filtered out by a one-page resume. Your work should matter more than how you describe it."
              </p>
              <p className="mt-3 text-sm" style={{ color: "var(--pf-muted)" }}>
                <b style={{ color: "var(--pf-text)" }}>{FOUNDER_NAME}</b>, Founder · Bengaluru, India
              </p>
            </div>
          </div>
        </section>

        {/* CTA + contact */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-20">
          <div className="pf-card p-8 sm:p-12 text-center" style={{ background: "var(--pf-text)", color: "var(--pf-bg)" }}>
            <h2 className="font-display text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.06] max-w-[20ch] mx-auto" style={{ color: "var(--pf-bg)" }}>
              We're just getting started. Come build it with us.
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/signup" className="pf-btn-primary !text-base !px-6 !py-3.5">Create a free profile <ArrowRight className="w-4 h-4" /></Link>
              <Link to="/submit-challenge" className="inline-flex items-center gap-2 font-semibold px-6 py-3.5 rounded-[10px] border" style={{ borderColor: "color-mix(in srgb, var(--pf-bg) 40%, transparent)", color: "var(--pf-bg)" }}>
                Post a challenge
              </Link>
            </div>
            <p className="mt-8 text-sm inline-flex items-center gap-2" style={{ opacity: 0.8 }}>
              <Mail className="w-4 h-4" /> Partnerships, feedback or questions: <span className="font-semibold select-all">{CONTACT_EMAIL}</span>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
