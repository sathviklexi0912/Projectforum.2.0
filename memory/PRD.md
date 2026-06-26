# ProjectForum — PRD & Status

## Problem statement (verbatim)
Build a full-stack web app called ProjectForum. It is a platform where students complete real-world business challenges posted by companies and get shortlisted for interviews based on their work quality. Students can also showcase existing projects they have already built as a portfolio.

## Stack
- Backend: FastAPI + Motor (MongoDB async) + bcrypt + PyJWT
- Frontend: React 19 + React Router 7 + Tailwind + shadcn + sonner + lucide-react
- Auth: JWT email/password, token in localStorage (`pf_token`)
- Admin: password-protected (`X-Admin-Password` header), localStorage `pf_admin_password`

## User personas
1. **Student** — signs up, browses challenges, submits work, tracks status, builds a portfolio.
2. **Company** — submits a brief via public form, gets it reviewed and published.
3. **Admin** — moderates submissions and approves/rejects pending challenges.

## Core requirements (static)
- Landing, Signup, Login, Password Reset
- Browse / Detail / Submit a Challenge (companies)
- Authenticated Submission Form, Thank You
- Student Dashboard: Overview, Challenges, My Submissions, My Projects, My Profile
- Public Profile at /profile/:studentId
- Admin at /admin: All Submissions table + Pending Challenges approval

## Implemented (2026-02-26)
- Backend: 18 endpoints under `/api/*` (auth, challenges, submissions, projects, pending-challenges, admin, profile)
- 4 seed challenges + 1 demo student (`demo@projectforum.com` / `Demo@123`)
- Frontend: 11 pages with full design system (Syne + Inter, coral/indigo/lavender, dark mode toggle persisted)
- All flows e2e tested — backend 24/24 pytest pass; frontend Playwright pass

## Backlog (P1/P2)
- P1: Email-based password reset with tokens (currently direct-update per MVP spec)
- P1: Company portal — let companies see submissions for their challenges
- P2: Rich text editor for problem statements
- P2: File upload (PDF/PPT) for submissions (currently link-based only)
- P2: Notifications when submission status changes
- P2: Search across challenges; trending tags
- P2: Per-challenge view-count + analytics

## Next tasks
- Gather user feedback after first finish
- Optionally show profile-completion % on Overview tab too
- Optionally replace native month picker with styled picker

## Test credentials
See `/app/memory/test_credentials.md`.
