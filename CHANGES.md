# ProjectForum: redesign (Nov 2026)

## Look & feel: professional "brief board"
- ProjectForum has its own identity, separate from the portfolio: a faint dot-grid background, clean cards with soft shadows, deep teal for actions and warm amber for emphasis.
- Fonts: Schibsted Grotesk for headings, Figtree for text, IBM Plex Mono for small labels.
- Each challenge category has its own muted colour tag so the board is easy to scan.
- New logo, favicon and link-preview image.
- New homepage: "Prove your skills on real business problems.", a stack of real challenges you can step through, a strip of open briefs, live stats, how it works, the board with category filters, Contributors / Organisations panels, closing call to action.
- Wording now speaks to everyone (students, graduates, professionals, career-switchers) and to organisations, not only students. Sign-up asks for "University / organisation".
- All colours live in `src/index.css`; the brand colour is `--pf-primary` (teal) and the emphasis colour is `--pf-accent` (amber).

## Better
- Phone menu (before, phones had no navigation links at all).
- Fixed form icons overlapping the text inside input boxes.
- Pages now open scrolled to the top when you navigate.
- Every page has its own browser-tab title.
- Link previews for WhatsApp/LinkedIn (`public/og.png`) and a favicon.
- Friendlier empty states on landing, browse, talent, dashboard and public profile.
- 3 more seed challenges (Tech, Entrepreneurship, Strategy) and a "Tech" filter.
- `.npmrc` so a fresh `npm install` works (it failed before because of a date-fns version clash).

## Security & hosting (before going public)
- Runs on any host: uses the port the host provides; development tools are no longer needed on the live server.
- The live site refuses to start without JWT_SECRET, ADMIN_PASSWORD (12+ characters) and MONGODB_URI, and refuses to run if the database can't be reached (no more silent in-memory fallback that loses accounts).
- Removed the built-in "admin123" fallback admin password in production.
- Admin panel: 5 wrong passwords from one connection locks it for 15 minutes.
- Login: 10 failed attempts for the same email locks that login for 15 minutes.
- Password reset: gives the same message whether or not the email is registered; 5 wrong codes cancel the code.
- Passwords must be at least 8 characters (sign-up and reset).
- Other websites can't call the API from a browser.
- Admin link removed from the footer (still reachable at /admin).
- Added `render.yaml` (one-click Render setup) and `.env.example`.

## Admin tools (Nov 2026)
- Challenges panel: see every challenge (live and expired), move a deadline, delete a challenge, and "Add practice challenges" (adds any built-in practice brief that isn't on the board).
- People panel: everyone who has signed up, with their work counts; delete a person (also removes their submissions and projects).
- Challenges are hidden from the site automatically after their deadline day (India time) and stop accepting submissions; the challenge page says "This challenge is closed".
- Public pages no longer include anyone's email address or a host's contact email.

## Still open
- Signup 18+/terms checkbox and © line (with the legal documents).
- Made-up seed company names on the practice challenges.
- Password-reset emails only reach the Resend account owner until a domain is verified.
