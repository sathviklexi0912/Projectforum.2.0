import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import {
  connectDB,
  getIsMongoConnected,
  User,
  Challenge,
  Submission,
  Project,
  PendingChallenge,
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
  getAllUsers,
  getActiveChallenges,
  getChallengeById,
  createChallenge,
  deleteChallenge,
  createSubmission,
  getSubmissionsByStudentId,
  getSubmissionById,
  getAllSubmissions,
  updateSubmission,
  deleteSubmission,
  createProject,
  getProjectsByStudentId,
  getAllProjects,
  getProjectById,
  findProjectByStudentAndChallenge,
  findSubmissionByStudentAndChallenge,
  updateProject,
  deleteProject,
  createPendingChallenge,
  getPendingChallenges,
  getPendingChallengeById,
  deletePendingChallenge,
  setResetToken,
  getResetToken,
  deleteResetToken,
} from "./src/db.js";
import { sendPasswordResetEmail } from "./src/lib/email.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === "production";

// In production, refuse to start without the secrets the site depends on.
// (In development the fallbacks below keep local testing easy.)
if (IS_PROD) {
  const missing = ["JWT_SECRET", "ADMIN_PASSWORD", "MONGODB_URI"].filter((k) => !process.env[k]);
  if (missing.length) {
    console.error(`❌ Missing required environment variables: ${missing.join(", ")}. Refusing to start.`);
    process.exit(1);
  }
  if ((process.env.ADMIN_PASSWORD || "").length < 12) {
    console.error("❌ ADMIN_PASSWORD must be at least 12 characters. Refusing to start.");
    process.exit(1);
  }
}

const MIN_PASSWORD_LENGTH = 8;

// Simple in-memory attempt limiter: max `max` failures per key within `windowMs`.
function makeLimiter(max: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return {
    blocked(key: string): number {
      const now = Date.now();
      const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
      hits.set(key, recent);
      if (recent.length < max) return 0;
      return Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 60000));
    },
    fail(key: string) {
      const list = hits.get(key) || [];
      list.push(Date.now());
      hits.set(key, list);
    },
    clear(key: string) {
      hits.delete(key);
    },
  };
}
// 5 wrong admin passwords per IP per 15 minutes
const adminLimiter = makeLimiter(5, 15 * 60 * 1000);
// 5 wrong reset codes per email per 15 minutes (after that the code is cancelled)
const resetCodeLimiter = makeLimiter(5, 15 * 60 * 1000);
// 10 failed logins per IP+email per 15 minutes
const loginLimiter = makeLimiter(10, 15 * 60 * 1000);

function clientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

// Rate limiting store for password reset requests: Max 3 requests per email per 15 minutes
const resetRateLimitMap = new Map<string, number[]>();

function checkResetRateLimit(email: string): { allowed: boolean; retryAfterMinutes?: number } {
  const normEmail = email.toLowerCase().trim();
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 3;

  const timestamps = (resetRateLimitMap.get(normEmail) || []).filter(
    (ts) => now - ts < windowMs
  );

  if (timestamps.length >= maxAttempts) {
    const oldest = timestamps[0];
    const retryAfterMs = windowMs - (now - oldest);
    const retryAfterMinutes = Math.max(1, Math.ceil(retryAfterMs / (60 * 1000)));
    return { allowed: false, retryAfterMinutes };
  }

  timestamps.push(now);
  resetRateLimitMap.set(normEmail, timestamps);
  return { allowed: true };
}

const JWT_SECRET = process.env.JWT_SECRET || "projectforum-dev-secret-key-change-in-prod";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (IS_PROD ? "" : "admin123");

// The site and its API are served from the same address, so in production
// other websites are not allowed to call the API from a browser.
app.set("trust proxy", 1);
app.use(IS_PROD ? cors({ origin: process.env.CORS_ORIGIN || false }) : cors());
app.use(express.json({ limit: "200kb" }));

function now_iso(): string {
  return new Date().toISOString();
}

function hash_password(password: string): string {
  return bcrypt.hashSync(password, 10);
}

function verify_password(plain: string, hashed: string): boolean {
  try {
    return bcrypt.compareSync(plain, hashed);
  } catch {
    return false;
  }
}

function create_token(user_id: string, email: string): string {
  return jwt.sign({ sub: user_id, email }, JWT_SECRET, { expiresIn: "7d" });
}

function serialize_user(user: User | null | undefined) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name || "",
    email: user.email || "",
    university: user.university || "",
    degree: user.degree || "",
    year: user.year || "",
    linkedin: user.linkedin || "",
    skills: user.skills || [],
    bio: user.bio || "",
    location: user.location || "",
    headline: user.headline || "",
    open_to_opportunities: user.open_to_opportunities !== false,
    created_at: user.created_at || "",
  };
}

// Public view of a person: everything except private contact details.
// Used by the Talent Directory and public profiles, which anyone can open.
function public_user(user: User | null | undefined) {
  const u = serialize_user(user);
  if (!u) return null;
  const { email, ...rest } = u;
  return rest;
}

// Public view of a challenge: hides the host's private contact email.
function public_challenge(c: any) {
  if (!c) return c;
  const plain = typeof c.toObject === "function" ? c.toObject() : { ...c };
  delete plain.contact_email;
  delete plain._id;
  delete plain.__v;
  return plain;
}

// Auth Middleware
interface AuthenticatedRequest extends Request {
  user?: User;
}

async function getCurrentUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    return res.status(401).json({ detail: "Not authenticated" });
  }
  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; email: string };
    const user = await findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ detail: "User not found" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ detail: "Invalid token or expired" });
  }
}

function check_admin_password(candidate: unknown): boolean {
  if (typeof candidate !== "string" || !candidate || !ADMIN_PASSWORD) {
    return false;
  }
  const candidateBuf = Buffer.from(candidate);
  const targetBuf = Buffer.from(ADMIN_PASSWORD);
  if (candidateBuf.length !== targetBuf.length) {
    // Constant time dummy compare to prevent length timing leaks
    crypto.timingSafeEqual(targetBuf, targetBuf);
    return false;
  }
  return crypto.timingSafeEqual(candidateBuf, targetBuf);
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const ip = clientIp(req);
  const wait = adminLimiter.blocked(ip);
  if (wait) {
    return res.status(429).json({ detail: `Too many wrong admin passwords. Try again in ${wait} minute(s).` });
  }
  const adminPassword = req.headers["x-admin-password"];
  if (!check_admin_password(adminPassword)) {
    adminLimiter.fail(ip);
    return res.status(401).json({ detail: "Invalid admin password" });
  }
  next();
}

// API Router
const api = express.Router();

api.get("/health", async (req, res) => {
  if (!getIsMongoConnected()) {
    await connectDB();
  }
  res.json({
    status: "ok",
    database: getIsMongoConnected() ? "MongoDB Atlas (Connected)" : "In-Memory (Fallback)",
  });
});

// ---------- Auth Endpoints ----------
api.post("/auth/register", async (req, res) => {
  const { name, email, password, university, degree, year, linkedin, skills, bio, location, headline } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ detail: "Name, email and password are required" });
  }
  if (String(password).length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ detail: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
  }
  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = await findUserByEmail(normalizedEmail);
  if (existing) {
    return res.status(400).json({ detail: "Email already registered" });
  }
  const id = crypto.randomUUID();
  const user: User = {
    id,
    name: String(name).trim(),
    email: normalizedEmail,
    password_hash: hash_password(password),
    university: university || "",
    degree: degree || "",
    year: year || "",
    linkedin: linkedin || "",
    skills: Array.isArray(skills) ? skills : [],
    bio: bio || "",
    location: location || "",
    headline: headline || "",
    open_to_opportunities: true,
    created_at: now_iso(),
  };
  await createUser(user);
  const token = create_token(id, normalizedEmail);
  return res.json({ token, user: serialize_user(user) });
});

api.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ detail: "Email and password required" });
  }
  const normalizedEmail = String(email).toLowerCase().trim();
  const limitKey = `${clientIp(req)}|${normalizedEmail}`;
  const wait = loginLimiter.blocked(limitKey);
  if (wait) {
    return res.status(429).json({ detail: `Too many failed attempts. Try again in ${wait} minute(s), or reset your password.` });
  }
  const user = await findUserByEmail(normalizedEmail);
  if (!user || !verify_password(password, user.password_hash)) {
    loginLimiter.fail(limitKey);
    return res.status(401).json({ detail: "Invalid email or password" });
  }
  loginLimiter.clear(limitKey);
  const token = create_token(user.id, normalizedEmail);
  return res.json({ token, user: serialize_user(user) });
});

api.get("/auth/me", getCurrentUser, (req: AuthenticatedRequest, res) => {
  return res.json(serialize_user(req.user!));
});

api.post("/auth/request-reset-token", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ detail: "Email is required" });
  }
  const normalizedEmail = String(email).toLowerCase().trim();

  // 1. Rate limiting check (max 3 requests per email per 15 minutes)
  const rateLimit = checkResetRateLimit(normalizedEmail);
  if (!rateLimit.allowed) {
    return res.status(429).json({
      detail: `Too many password reset requests for this email. Please wait ${rateLimit.retryAfterMinutes} minute(s) before trying again.`,
      retry_after_minutes: rateLimit.retryAfterMinutes,
    });
  }

  const GENERIC_RESET_MESSAGE = "If an account exists for this email, a 6-digit reset code has been sent. Please check your inbox.";
  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    // Same answer as for a real account, so nobody can check who is registered.
    return res.json({ ok: true, message: GENERIC_RESET_MESSAGE });
  }

  // 2. Generate secure 6-digit verification code
  const reset_token = crypto.randomInt(100000, 999999).toString();
  await setResetToken(normalizedEmail, reset_token, Date.now() + 15 * 60 * 1000);

  // 3. Dispatch actual email via Resend
  const emailResult = await sendPasswordResetEmail({
    toEmail: normalizedEmail,
    userName: user.name,
    resetToken: reset_token,
  });

  // 4. Return response WITHOUT reset_token (never expose token to frontend)
  if (!emailResult.success) {
    console.error("Password reset email failed to send for", normalizedEmail);
  }
  resetCodeLimiter.clear(normalizedEmail);
  return res.json({ ok: true, message: GENERIC_RESET_MESSAGE });
});

api.post("/auth/reset-password", async (req, res) => {
  const { email, reset_token, new_password } = req.body;
  if (!email || !reset_token || !new_password) {
    return res.status(400).json({ detail: "Email, reset code, and new password are required" });
  }
  if (String(new_password).length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ detail: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
  }
  const normalizedEmail = String(email).toLowerCase().trim();
  const normalizedToken = String(reset_token).trim();
  if (resetCodeLimiter.blocked(normalizedEmail)) {
    await deleteResetToken(normalizedEmail);
    return res.status(429).json({ detail: "Too many wrong codes. Please request a new reset code." });
  }
  const record = await getResetToken(normalizedEmail);

  if (!record || record.token !== normalizedToken || record.expires_at < Date.now()) {
    resetCodeLimiter.fail(normalizedEmail);
    return res.status(400).json({ detail: "Invalid or expired reset code. Please check your code or request a new one." });
  }
  resetCodeLimiter.clear(normalizedEmail);

  const user = await findUserByEmail(normalizedEmail);
  if (!user) {
    return res.status(404).json({ detail: "User not found" });
  }

  await updateUser(user.id, { password_hash: hash_password(new_password) });
  await deleteResetToken(normalizedEmail);
  return res.json({ message: "Password updated successfully. You can now log in." });
});

api.patch("/auth/me", getCurrentUser, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const allowed = ["name", "university", "degree", "year", "linkedin", "skills", "bio", "location", "headline", "open_to_opportunities"];
  const updates: Partial<User> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      (updates as any)[key] = req.body[key];
    }
  }
  const updatedUser = await updateUser(user.id, updates);
  return res.json(serialize_user(updatedUser || user));
});

// ---------- Talent Directory Endpoint ----------
api.get(["/talent", "/students"], async (req, res) => {
  const openOnly = req.query.open_to_opportunities === "true";
  const skillQuery = (req.query.skill as string || "").toLowerCase();
  const searchQuery = (req.query.q as string || "").toLowerCase();

  const allUsers = await getAllUsers();
  const allSubmissions = await getAllSubmissions();
  const allProjects = await getAllProjects();

  let studentList = allUsers.map((u) => {
    const userSubmissions = allSubmissions.filter((s) => s.student_id === u.id);
    const verifiedCount = userSubmissions.filter((s) => s.verified).length;
    const userProjects = allProjects.filter((p) => p.student_id === u.id);

    return {
      ...public_user(u),
      verified_submissions_count: verifiedCount,
      total_submissions_count: userSubmissions.length,
      projects_count: userProjects.length,
      projects_preview: userProjects.slice(0, 3),
    };
  });

  if (openOnly) {
    studentList = studentList.filter((s) => s.open_to_opportunities);
  }

  if (skillQuery) {
    studentList = studentList.filter((s) =>
      Array.isArray(s.skills) && s.skills.some((sk) => sk.toLowerCase().includes(skillQuery))
    );
  }

  if (searchQuery) {
    studentList = studentList.filter((s) => {
      const matchesName = (s.name || "").toLowerCase().includes(searchQuery);
      const matchesHeadline = (s.headline || "").toLowerCase().includes(searchQuery);
      const matchesUniversity = (s.university || "").toLowerCase().includes(searchQuery);
      const matchesSkills = Array.isArray(s.skills) && s.skills.some((sk) => sk.toLowerCase().includes(searchQuery));
      return matchesName || matchesHeadline || matchesUniversity || matchesSkills;
    });
  }

  return res.json(studentList);
});

// ---------- Admin Login ----------
api.post("/admin/login", (req, res) => {
  const ip = clientIp(req);
  const wait = adminLimiter.blocked(ip);
  if (wait) {
    return res.status(429).json({ detail: `Too many wrong admin passwords. Try again in ${wait} minute(s).` });
  }
  const { password } = req.body;
  if (!check_admin_password(password)) {
    adminLimiter.fail(ip);
    return res.status(401).json({ detail: "Invalid admin password" });
  }
  adminLimiter.clear(ip);
  return res.json({ ok: true });
});

// ---------- Challenges ----------
api.get("/challenges", async (req, res) => {
  const category = req.query.category as string;
  const items = await getActiveChallenges(category);
  return res.json(items.map(public_challenge));
});

api.get("/challenges/:cid", async (req, res) => {
  const item = await getChallengeById(req.params.cid);
  if (!item) {
    return res.status(404).json({ detail: "Challenge not found" });
  }
  return res.json(public_challenge(item));
});

api.delete("/admin/challenges/:cid", requireAdmin, async (req, res) => {
  const deleted = await deleteChallenge(req.params.cid);
  if (!deleted) {
    return res.status(404).json({ detail: "Challenge not found" });
  }
  return res.json({ ok: true });
});

// ---------- Submissions ----------
api.post("/submissions", getCurrentUser, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { challenge_id, submission_link, explanation, time_spent, key_learning } = req.body;
  const challenge = await getChallengeById(challenge_id);
  if (!challenge) {
    return res.status(404).json({ detail: "Challenge not found" });
  }
  const subId = crypto.randomUUID();
  const sub: Submission = {
    id: subId,
    student_id: user.id,
    student_name: user.name || "",
    student_university: user.university || "",
    challenge_id,
    challenge_title: challenge.title || "",
    challenge_org: challenge.org || "",
    submission_link,
    explanation,
    time_spent,
    key_learning,
    status: "Submitted",
    verified: false,
    verifier_name: "",
    verifier_title: "",
    submitted_at: now_iso(),
  };
  await createSubmission(sub);

  const existingProject = await findProjectByStudentAndChallenge(user.id, challenge_id);
  if (!existingProject) {
    const today = new Date();
    const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
    const pId = crypto.randomUUID();
    await createProject({
      id: pId,
      student_id: user.id,
      challenge_id,
      title: challenge.title || "",
      description: explanation,
      link: submission_link,
      category: challenge.category || "Other",
      date_completed: ym,
      source_submission_id: subId,
      submission_linked: true,
      created_at: now_iso(),
    });
  }

  return res.json(sub);
});

api.get("/submissions/mine", getCurrentUser, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const items = await getSubmissionsByStudentId(user.id);
  return res.json(items);
});

api.get("/submissions/:sid", getCurrentUser, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const sub = await getSubmissionById(req.params.sid);
  if (!sub || sub.student_id !== user.id) {
    return res.status(404).json({ detail: "Submission not found" });
  }
  return res.json(sub);
});

api.patch("/submissions/:sid", getCurrentUser, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const sub = await getSubmissionById(req.params.sid);
  if (!sub || sub.student_id !== user.id) {
    return res.status(404).json({ detail: "Submission not found" });
  }
  const challenge = await getChallengeById(sub.challenge_id);
  if (challenge && challenge.deadline) {
    const d = new Date(challenge.deadline);
    if (!isNaN(d.getTime()) && d.getTime() < Date.now()) {
      return res.status(400).json({ detail: "Deadline has passed" });
    }
  }
  const { submission_link, explanation, time_spent, key_learning } = req.body;
  const updates: Partial<Submission> = {};
  if (submission_link !== undefined) updates.submission_link = submission_link;
  if (explanation !== undefined) updates.explanation = explanation;
  if (time_spent !== undefined) updates.time_spent = time_spent;
  if (key_learning !== undefined) updates.key_learning = key_learning;

  const updatedSub = await updateSubmission(sub.id, updates);
  return res.json(updatedSub || sub);
});

api.delete("/submissions/:sid", getCurrentUser, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const sub = await getSubmissionById(req.params.sid);
  if (!sub || sub.student_id !== user.id) {
    return res.status(404).json({ detail: "Submission not found" });
  }
  if (sub.verified) {
    return res.status(400).json({
      detail: "Cannot delete a verified submission. Verified credentials cannot be removed to maintain evaluation integrity.",
    });
  }
  // Cascade delete linked project if it was auto-created from this submission
  const linkedProj = await findProjectByStudentAndChallenge(user.id, sub.challenge_id);
  if (linkedProj && (linkedProj.source_submission_id === sub.id || linkedProj.submission_linked)) {
    await deleteProject(linkedProj.id);
  }
  await deleteSubmission(req.params.sid);
  return res.json({ ok: true });
});

// Admin Submissions
api.get("/admin/submissions", requireAdmin, async (req, res) => {
  const items = await getAllSubmissions();
  const enriched = await Promise.all(
    items.map(async (sub) => {
      const student = await findUserById(sub.student_id);
      const challenge = await getChallengeById(sub.challenge_id);
      return {
        ...sub,
        student_email: student?.email || "",
        student_university: student?.university || sub.student_university || "",
        student_degree: student?.degree || "",
        student_year: student?.year || "",
        student_headline: student?.headline || "",
        student_skills: student?.skills || [],
        challenge_category: challenge?.category || (sub as any).challenge_category || "",
        challenge_difficulty: challenge?.difficulty || "",
        challenge_description: challenge?.description || "",
        challenge_problem_statement: challenge?.problem_statement || "",
        challenge_rubric: challenge?.rubric || [],
        challenge_deliverables: challenge?.deliverables || [],
      };
    })
  );
  return res.json(enriched);
});

api.patch("/admin/submissions/:sid", requireAdmin, async (req, res) => {
  const sub = await getSubmissionById(req.params.sid);
  if (!sub) {
    return res.status(404).json({ detail: "Submission not found" });
  }
  const valid = ["Submitted", "Under Review", "Shortlisted", "Rejected"];
  if (!valid.includes(req.body.status)) {
    return res.status(400).json({ detail: "Invalid status" });
  }
  await updateSubmission(sub.id, { status: req.body.status });
  return res.json({ ok: true });
});

api.patch("/admin/submissions/:sid/verify", requireAdmin, async (req, res) => {
  const sub = await getSubmissionById(req.params.sid);
  if (!sub) {
    return res.status(404).json({ detail: "Submission not found" });
  }
  const nextVerified = !sub.verified;
  await updateSubmission(sub.id, {
    verified: nextVerified,
    verifier_name: nextVerified ? (req.body.verifier_name || "Platform Admin") : "",
    verifier_title: nextVerified ? (req.body.verifier_title || "Verified Reviewer") : "",
  });
  return res.json({ ok: true, verified: nextVerified });
});

api.post("/admin/submissions/:sid/verify", requireAdmin, async (req, res) => {
  const sub = await getSubmissionById(req.params.sid);
  if (!sub) {
    return res.status(404).json({ detail: "Submission not found" });
  }
  const name = String(req.body.verifier_name || "").trim();
  const title = String(req.body.verifier_title || "").trim();
  if (!name || !title) {
    return res.status(400).json({ detail: "Verifier name and title are required" });
  }
  await updateSubmission(sub.id, {
    verified: true,
    verifier_name: name,
    verifier_title: title,
  });
  return res.json({ ok: true });
});

api.delete("/admin/submissions/:sid/verify", requireAdmin, async (req, res) => {
  const sub = await getSubmissionById(req.params.sid);
  if (!sub) {
    return res.status(404).json({ detail: "Submission not found" });
  }
  await updateSubmission(sub.id, {
    verified: false,
    verifier_name: "",
    verifier_title: "",
  });
  return res.json({ ok: true });
});

api.delete("/admin/submissions/:sid", requireAdmin, async (req, res) => {
  const deleted = await deleteSubmission(req.params.sid);
  if (!deleted) {
    return res.status(404).json({ detail: "Submission not found" });
  }
  return res.json({ ok: true });
});

// ---------- Projects ----------
api.post("/projects", getCurrentUser, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const { title, description, link, category, date_completed } = req.body;
  const pId = crypto.randomUUID();
  const proj: Project = {
    id: pId,
    student_id: user.id,
    title: title || "",
    description: description || "",
    link: link || "",
    category: category || "Other",
    date_completed: date_completed || "",
    created_at: now_iso(),
  };
  await createProject(proj);
  return res.json(proj);
});

api.get("/projects/mine", getCurrentUser, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const items = await getProjectsByStudentId(user.id);
  const enriched = await Promise.all(
    items.map(async (p) => {
      let linkedSub = p.source_submission_id ? await getSubmissionById(p.source_submission_id) : null;
      if (!linkedSub && p.challenge_id) {
        linkedSub = await findSubmissionByStudentAndChallenge(user.id, p.challenge_id);
      }
      return {
        ...p,
        verified: linkedSub ? !!linkedSub.verified : false,
        org: linkedSub?.challenge_org || "",
      };
    })
  );
  return res.json(enriched);
});

api.patch("/projects/:pid", getCurrentUser, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const proj = await getProjectById(req.params.pid);
  if (!proj || proj.student_id !== user.id) {
    return res.status(404).json({ detail: "Project not found" });
  }
  const { title, description, link, category, date_completed } = req.body;
  const updates: Partial<Project> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (category !== undefined) updates.category = category;
  if (!proj.source_submission_id && !proj.submission_linked) {
    if (link !== undefined) updates.link = link;
    if (date_completed !== undefined) updates.date_completed = date_completed;
  }
  const updatedProj = await updateProject(proj.id, updates);
  return res.json(updatedProj || proj);
});

api.delete("/projects/:pid", getCurrentUser, async (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const proj = await getProjectById(req.params.pid);
  if (!proj || proj.student_id !== user.id) {
    return res.status(404).json({ detail: "Project not found" });
  }

  // Check if project is linked to a submission
  let linkedSub = proj.source_submission_id ? await getSubmissionById(proj.source_submission_id) : null;
  if (!linkedSub && proj.challenge_id) {
    linkedSub = await findSubmissionByStudentAndChallenge(user.id, proj.challenge_id);
  }

  if (linkedSub) {
    // If the linked submission is verified, block deletion
    if (linkedSub.verified) {
      return res.status(400).json({
        detail: "Cannot delete a project linked to a verified submission. Verified company credentials cannot be deleted to preserve evaluation integrity.",
      });
    }
    // If unverified, cascade delete the submission along with the project
    await deleteSubmission(linkedSub.id);
  }

  await deleteProject(req.params.pid);
  return res.json({ ok: true });
});

// ---------- Pending Challenges ----------
api.post(["/pending-challenges", "/admin/host-challenge-proposal"], async (req, res) => {
  const body = req.body || {};
  const company_name = body.company_name || body.org || "";
  const contact_email = body.contact_email || "";
  const title = body.title || "";
  const problem_description = body.problem_description || body.problem_statement || body.description || "";
  const deliverables = Array.isArray(body.deliverables) ? body.deliverables.join("\n") : (body.deliverables || "");
  const evaluation_criteria = Array.isArray(body.rubric) ? body.rubric.join("\n") : (body.evaluation_criteria || "");
  const est_time = body.est_time || "";
  const difficulty = body.difficulty || "";
  const category = body.category || "";
  const deadline_preference = body.deadline_preference || "30 days";

  if (!title || !company_name) {
    return res.status(400).json({ detail: "Title and Company name are required" });
  }

  const pcId = crypto.randomUUID();
  const pc: PendingChallenge = {
    id: pcId,
    company_name,
    contact_email,
    title,
    problem_description,
    deliverables,
    evaluation_criteria,
    est_time,
    difficulty,
    category,
    deadline_preference,
    status: "pending",
    submitted_at: now_iso(),
  };
  await createPendingChallenge(pc);
  return res.json({ ok: true, id: pcId });
});

api.get(["/admin/pending-challenges", "/admin/proposals"], requireAdmin, async (req, res) => {
  const items = await getPendingChallenges();
  const normalized = items.map((pc) => ({
    ...pc,
    org: pc.company_name,
    description: pc.problem_description,
    rubric: (pc.evaluation_criteria || "").split("\n").filter(Boolean),
  }));
  return res.json(normalized);
});

api.post(["/admin/pending-challenges/:pid/approve", "/admin/proposals/:pid/approve"], requireAdmin, async (req, res) => {
  const pc = await getPendingChallengeById(req.params.pid);
  if (!pc) {
    return res.status(404).json({ detail: "Not found" });
  }
  let days = 30;
  try {
    const digits = (pc.deadline_preference || "").replace(/\D/g, "");
    if (digits) days = parseInt(digits, 10);
  } catch {
    days = 30;
  }
  const deadline = new Date(Date.now() + days * 86400000).toISOString();
  const cId = crypto.randomUUID();
  await createChallenge({
    id: cId,
    title: pc.title,
    org: pc.company_name,
    category: pc.category,
    difficulty: pc.difficulty,
    deadline,
    est_time: pc.est_time,
    tags: [pc.category],
    description: (pc.problem_description || "").slice(0, 200),
    problem_statement: pc.problem_description,
    deliverables: (pc.deliverables || "").split(",").map((d) => d.trim()).filter(Boolean),
    rubric: (pc.evaluation_criteria || "").split(",").map((r) => r.trim()).filter(Boolean),
    status: "active",
    contact_email: pc.contact_email,
    created_at: now_iso(),
  });
  await deletePendingChallenge(req.params.pid);
  return res.json({ ok: true, challenge_id: cId });
});

api.delete("/admin/pending-challenges/:pid", requireAdmin, async (req, res) => {
  const deleted = await deletePendingChallenge(req.params.pid);
  if (!deleted) {
    return res.status(404).json({ detail: "Not found" });
  }
  return res.json({ ok: true });
});

// ---------- Public Profile ----------
api.get("/profile/:student_id", async (req, res) => {
  const { student_id } = req.params;
  const user = await findUserById(student_id);
  if (!user) {
    return res.status(404).json({ detail: "Profile not found" });
  }
  const userSubmissions = await getSubmissionsByStudentId(student_id);

  const enrichedSubmissions = await Promise.all(
    userSubmissions.map(async (s) => {
      const ch = await getChallengeById(s.challenge_id);
      return {
        ...s,
        challenge_category: ch ? ch.category : "",
      };
    })
  );

  const userProjects = await getProjectsByStudentId(student_id);

  const enrichedProjects = await Promise.all(
    userProjects.map(async (p) => {
      let linkedSub = p.source_submission_id ? await getSubmissionById(p.source_submission_id) : null;
      if (!linkedSub && p.challenge_id) {
        linkedSub = await findSubmissionByStudentAndChallenge(student_id, p.challenge_id);
      }
      const ch = p.challenge_id ? await getChallengeById(p.challenge_id) : null;
      const isVerified = linkedSub ? !!linkedSub.verified : !!(p as any).verified;
      const orgName = (linkedSub && linkedSub.challenge_org) || (ch && ch.org) || (p as any).org || "";

      return {
        ...p,
        verified: isVerified,
        verifier_name: linkedSub?.verifier_name || "",
        verifier_title: linkedSub?.verifier_title || "",
        org: orgName,
      };
    })
  );

  return res.json({
    user: public_user(user),
    completed_challenges: enrichedSubmissions,
    projects: enrichedProjects,
  });
});

app.use("/api", api);

// Vite / Static Handler
async function startServer() {
  const connected = await connectDB();
  if (IS_PROD && !connected) {
    // Never run the live site on temporary in-memory data: accounts would vanish on restart.
    console.error("❌ Could not connect to MongoDB. Check MONGODB_URI and Atlas network access. Refusing to start.");
    process.exit(1);
  }

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
