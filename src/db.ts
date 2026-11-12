import "dotenv/config";
import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  university?: string;
  degree?: string;
  year?: string;
  linkedin?: string;
  skills?: string[];
  bio?: string;
  location?: string;
  headline?: string;
  open_to_opportunities?: boolean;
  profile_type?: string;      // "student" | "graduate" | "professional"
  current_role?: string;      // e.g. "Marketing Analyst at Zomato"
  experience_years?: string;  // e.g. "2"
  terms_accepted_at?: string; // when they confirmed 18+ and accepted Terms & Privacy
  terms_version?: string;
  created_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  org: string;
  category: string;
  difficulty: string;
  deadline: string;
  est_time: string;
  tags: string[];
  description: string;
  problem_statement: string;
  deliverables: string[];
  rubric: string[];
  status: string;
  contact_email?: string;
  created_at: string;
}

export interface Submission {
  id: string;
  student_id: string;
  student_name: string;
  student_university: string;
  challenge_id: string;
  challenge_title: string;
  challenge_org: string;
  submission_link: string;
  explanation: string;
  time_spent: string;
  key_learning: string;
  status: string;
  verified: boolean;
  verifier_name: string;
  verifier_title: string;
  submitted_at: string;
}

export interface Project {
  id: string;
  student_id: string;
  challenge_id?: string;
  title: string;
  description: string;
  link: string;
  category: string;
  date_completed: string;
  source_submission_id?: string;
  submission_linked?: boolean;
  created_at: string;
}

export interface PendingChallenge {
  id: string;
  company_name: string;
  contact_email: string;
  title: string;
  problem_description: string;
  deliverables: string;
  evaluation_criteria: string;
  est_time: string;
  difficulty: string;
  category: string;
  deadline_preference: string;
  status: string;
  submitted_at: string;
}

export interface ResetToken {
  email: string;
  token: string;
  expires_at: number;
}

const userSchema = new mongoose.Schema<User>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  university: { type: String, default: "" },
  degree: { type: String, default: "" },
  year: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  skills: { type: [String], default: [] },
  bio: { type: String, default: "" },
  location: { type: String, default: "" },
  headline: { type: String, default: "" },
  open_to_opportunities: { type: Boolean, default: true },
  profile_type: { type: String, default: "student" },
  current_role: { type: String, default: "" },
  experience_years: { type: String, default: "" },
  terms_accepted_at: { type: String, default: "" },
  terms_version: { type: String, default: "" },
  created_at: { type: String, default: () => new Date().toISOString() },
});

const challengeSchema = new mongoose.Schema<Challenge>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  org: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, required: true },
  deadline: { type: String, required: true },
  est_time: { type: String, default: "" },
  tags: { type: [String], default: [] },
  description: { type: String, default: "" },
  problem_statement: { type: String, default: "" },
  deliverables: { type: [String], default: [] },
  rubric: { type: [String], default: [] },
  status: { type: String, default: "active" },
  contact_email: { type: String, default: "" },
  created_at: { type: String, default: () => new Date().toISOString() },
});

const submissionSchema = new mongoose.Schema<Submission>({
  id: { type: String, required: true, unique: true },
  student_id: { type: String, required: true, index: true },
  student_name: { type: String, default: "" },
  student_university: { type: String, default: "" },
  challenge_id: { type: String, required: true },
  challenge_title: { type: String, default: "" },
  challenge_org: { type: String, default: "" },
  submission_link: { type: String, default: "" },
  explanation: { type: String, default: "" },
  time_spent: { type: String, default: "" },
  key_learning: { type: String, default: "" },
  status: { type: String, default: "Submitted" },
  verified: { type: Boolean, default: false },
  verifier_name: { type: String, default: "" },
  verifier_title: { type: String, default: "" },
  submitted_at: { type: String, default: () => new Date().toISOString() },
});

const projectSchema = new mongoose.Schema<Project>({
  id: { type: String, required: true, unique: true },
  student_id: { type: String, required: true, index: true },
  challenge_id: { type: String },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  link: { type: String, default: "" },
  category: { type: String, default: "Other" },
  date_completed: { type: String, default: "" },
  source_submission_id: { type: String },
  submission_linked: { type: Boolean, default: false },
  created_at: { type: String, default: () => new Date().toISOString() },
});

const pendingChallengeSchema = new mongoose.Schema<PendingChallenge>({
  id: { type: String, required: true, unique: true },
  company_name: { type: String, default: "" },
  contact_email: { type: String, default: "" },
  title: { type: String, required: true },
  problem_description: { type: String, default: "" },
  deliverables: { type: String, default: "" },
  evaluation_criteria: { type: String, default: "" },
  est_time: { type: String, default: "" },
  difficulty: { type: String, default: "" },
  category: { type: String, default: "" },
  deadline_preference: { type: String, default: "" },
  status: { type: String, default: "pending" },
  submitted_at: { type: String, default: () => new Date().toISOString() },
});

const resetTokenSchema = new mongoose.Schema<ResetToken>({
  email: { type: String, required: true, unique: true },
  token: { type: String, required: true },
  expires_at: { type: Number, required: true },
});

export const UserModel = mongoose.models.User || mongoose.model<User>("User", userSchema);
export const ChallengeModel = mongoose.models.Challenge || mongoose.model<Challenge>("Challenge", challengeSchema);
export const SubmissionModel = mongoose.models.Submission || mongoose.model<Submission>("Submission", submissionSchema);
export const ProjectModel = mongoose.models.Project || mongoose.model<Project>("Project", projectSchema);
export const PendingChallengeModel = mongoose.models.PendingChallenge || mongoose.model<PendingChallenge>("PendingChallenge", pendingChallengeSchema);
export const ResetTokenModel = mongoose.models.ResetToken || mongoose.model<ResetToken>("ResetToken", resetTokenSchema);

// In-Memory fallback stores
const memoryUsers = new Map<string, User>();
const memoryChallenges = new Map<string, Challenge>();
const memorySubmissions = new Map<string, Submission>();
const memoryProjects = new Map<string, Project>();
const memoryPendingChallenges = new Map<string, PendingChallenge>();
const memoryResetTokens = new Map<string, ResetToken>();

let isMongoConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (uri) {
    try {
      if (mongoose.connection.readyState === 1) {
        isMongoConnected = true;
        return true;
      }
      await mongoose.connect(uri);
      isMongoConnected = true;
      console.log("✅ Successfully connected to MongoDB Atlas");
      await seedDatabase();
      return true;
    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      console.log("⚠️ Falling back to in-memory store until connection issue is resolved");
      isMongoConnected = false;
      seedInMemory();
      return false;
    }
  } else {
    console.log("ℹ️ MONGODB_URI environment variable not provided. Running on in-memory mode.");
    console.log("👉 Add MONGODB_URI to your environment variables to enable MongoDB Atlas persistence.");
    isMongoConnected = false;
    seedInMemory();
    return false;
  }
}

export function getIsMongoConnected(): boolean {
  return mongoose.connection.readyState === 1 || isMongoConnected;
}

const SEED_CHALLENGES = [
  {
    title: "Go-to-Market Strategy for D2C Skincare Brand",
    org: "GrowthLab",
    category: "Marketing",
    difficulty: "Intermediate",
    deadline_days: 21,
    est_time: "10–14 hrs",
    tags: ["GTM", "Consumer brands", "India market"],
    description: "Design a 90-day GTM plan for a D2C skincare brand entering Tier 2 Indian cities.",
    problem_statement: "Design a 90-day GTM plan for a D2C skincare brand entering Tier 2 Indian cities. Include channel strategy, pricing rationale, and 3-month KPIs.",
    deliverables: ["Channel strategy", "Pricing plan", "Month-by-month milestones", "Risk mitigation", "Budget allocation"],
    rubric: ["Strategic clarity", "India market understanding", "Feasibility", "Structure and communication"],
  },
  {
    title: "Unit Economics Model for a B2B SaaS Startup",
    org: "VentureHive",
    category: "Finance",
    difficulty: "Advanced",
    deadline_days: 28,
    est_time: "12–18 hrs",
    tags: ["SaaS", "Financial modelling", "Unit economics"],
    description: "Build a 3-year unit economics model. Calculate CAC, LTV, payback period, and recommend a pricing tier.",
    problem_statement: "Build a 3-year unit economics model. Calculate CAC, LTV, payback period, and recommend a pricing tier.",
    deliverables: ["Unit economics model", "3-year P&L", "Sensitivity table", "Investor summary"],
    rubric: ["Calculation accuracy", "Assumption transparency", "Investor lens", "Presentation quality"],
  },
  {
    title: "Market Entry Analysis: EV Charging in Rural India",
    org: "Bharat Ventures",
    category: "Strategy",
    difficulty: "Intermediate",
    deadline_days: 35,
    est_time: "8–12 hrs",
    tags: ["Market sizing", "EV", "Rural India"],
    description: "Analyse the EV charging opportunity in semi-urban India. Size the market, identify barriers, give a go/no-go recommendation.",
    problem_statement: "Analyse the EV charging opportunity in semi-urban India. Size the market, identify barriers, give a go/no-go recommendation.",
    deliverables: ["Market size estimate", "Competitive landscape", "Barrier analysis", "Business model recommendation", "Go/no-go decision"],
    rubric: ["Analytical rigour", "Ground-level understanding", "Commercial thinking", "Decision quality"],
  },
  {
    title: "Brand Positioning for a Fintech Targeting Gen Z",
    org: "Pixel Finance",
    category: "Marketing",
    difficulty: "Beginner",
    deadline_days: 42,
    est_time: "6–8 hrs",
    tags: ["Brand strategy", "Gen Z", "Fintech"],
    description: "Develop brand positioning and a messaging framework for a savings app targeting Indian college students aged 18–24.",
    problem_statement: "Develop brand positioning and a messaging framework for a savings app targeting Indian college students aged 18–24.",
    deliverables: ["Positioning statement", "Messaging framework", "Brand voice with example copy", "Channel recommendation"],
    rubric: ["Audience insight", "Brand clarity", "Copywriting quality", "Practical applicability"],
  },
  {
    title: "Product Teardown: Campus Food-Ordering App",
    org: "CampusBite",
    category: "Tech",
    difficulty: "Beginner",
    deadline_days: 30,
    est_time: "5–8 hrs",
    tags: ["Product", "UX research", "Roadmap"],
    description: "Tear down a campus food-ordering app, find the three biggest drop-off points, and propose fixes ranked by impact.",
    problem_statement: "Our app gets downloads but only 1 in 4 users places a second order. Walk through the full ordering journey, identify where and why students drop off, and propose a prioritised set of fixes we could ship in the next 6 weeks.",
    deliverables: ["Journey map with drop-off points", "5 short user interviews (summary)", "Prioritised fix list", "One annotated screen redesign"],
    rubric: ["User insight", "Prioritisation logic", "Clarity of recommendations", "Feasibility"],
  },
  {
    title: "Launch Plan for a Student-Run Thrift Store",
    org: "ReWear Collective",
    category: "Entrepreneurship",
    difficulty: "Beginner",
    deadline_days: 25,
    est_time: "6–10 hrs",
    tags: ["Launch", "Pricing", "Sustainability"],
    description: "Plan the first 60 days of a campus thrift store: sourcing, pricing, launch event and a break-even estimate.",
    problem_statement: "A group of students wants to run a thrift store on campus. Build a 60-day launch plan covering how clothes are sourced, how they are priced, how the launch is promoted, and when the store breaks even.",
    deliverables: ["Sourcing plan", "Pricing model", "Launch promotion plan", "Break-even estimate"],
    rubric: ["Practicality", "Financial logic", "Creativity", "Presentation"],
  },
  {
    title: "Reduce Delivery Delays for a Cloud Kitchen",
    org: "TiffinWorks",
    category: "Strategy",
    difficulty: "Advanced",
    deadline_days: 40,
    est_time: "10–15 hrs",
    tags: ["Operations", "Process design", "Data analysis"],
    description: "A Bengaluru cloud kitchen misses its 30-minute delivery promise on 22% of orders. Find the root causes and design a fix.",
    problem_statement: "Using the order-timeline scenario in the brief, identify where time is lost between order and doorstep (kitchen prep, packing, rider assignment, traffic). Recommend process and staffing changes, and estimate the impact on late deliveries.",
    deliverables: ["Root-cause analysis", "Process redesign", "Staffing recommendation", "Impact estimate"],
    rubric: ["Analytical depth", "Root-cause accuracy", "Practicality", "Quantified impact"],
  },
];

// Built-in briefs are practice scenarios written by KIVO; the companies named in them are fictional.
const PRACTICE_TITLES = new Set(SEED_CHALLENGES.map((c) => c.title.trim().toLowerCase()));
export function isPracticeChallenge(c: { title?: string } | null | undefined): boolean {
  return !!c?.title && PRACTICE_TITLES.has(c.title.trim().toLowerCase());
}

function now_iso(): string {
  return new Date().toISOString();
}

function hash_password(password: string): string {
  return bcrypt.hashSync(password, 10);
}

async function seedDatabase() {
  const challengeCount = await ChallengeModel.countDocuments();
  if (challengeCount === 0) {
    const now = new Date();
    for (const sc of SEED_CHALLENGES) {
      const deadline = new Date(now.getTime() + sc.deadline_days * 86400000).toISOString();
      const id = crypto.randomUUID();
      await ChallengeModel.create({
        id,
        title: sc.title,
        org: sc.org,
        category: sc.category,
        difficulty: sc.difficulty,
        deadline,
        est_time: sc.est_time,
        tags: sc.tags,
        description: sc.description,
        problem_statement: sc.problem_statement,
        deliverables: sc.deliverables,
        rubric: sc.rubric,
        status: "active",
        contact_email: "",
        created_at: now_iso(),
      });
    }
  }

  // Remove the old public demo account (its password was published in the code).
  await UserModel.deleteOne({ email: "demo@projectforum.com" });
}

function seedInMemory() {
  if (memoryChallenges.size === 0) {
    const now = new Date();
    for (const sc of SEED_CHALLENGES) {
      const deadline = new Date(now.getTime() + sc.deadline_days * 86400000).toISOString();
      const id = crypto.randomUUID();
      memoryChallenges.set(id, {
        id,
        title: sc.title,
        org: sc.org,
        category: sc.category,
        difficulty: sc.difficulty,
        deadline,
        est_time: sc.est_time,
        tags: sc.tags,
        description: sc.description,
        problem_statement: sc.problem_statement,
        deliverables: sc.deliverables,
        rubric: sc.rubric,
        status: "active",
        contact_email: "",
        created_at: now_iso(),
      });
    }
  }
}

// ==================== DB HELPER FUNCTIONS ====================

// --- USERS ---
export async function findUserById(id: string): Promise<User | null> {
  if (isMongoConnected) {
    const u = await UserModel.findOne({ id }).lean();
    return u as User | null;
  }
  return memoryUsers.get(id) || null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const norm = email.toLowerCase().trim();
  if (isMongoConnected) {
    const u = await UserModel.findOne({ email: norm }).lean();
    return u as User | null;
  }
  return Array.from(memoryUsers.values()).find((u) => u.email === norm) || null;
}

export async function createUser(userData: User): Promise<User> {
  if (isMongoConnected) {
    const created = await UserModel.create(userData);
    return created.toObject() as User;
  }
  memoryUsers.set(userData.id, userData);
  return userData;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  if (isMongoConnected) {
    const updated = await UserModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return updated as User | null;
  }
  const u = memoryUsers.get(id);
  if (!u) return null;
  Object.assign(u, updates);
  memoryUsers.set(id, u);
  return u;
}

// Deletes a person and their submissions, projects and any pending reset code.
export async function deleteUserCascade(id: string): Promise<{ deleted: boolean; submissions: number; projects: number }> {
  const user = await findUserById(id);
  if (!user) return { deleted: false, submissions: 0, projects: 0 };
  if (isMongoConnected) {
    const subs = await SubmissionModel.deleteMany({ student_id: id });
    const projs = await ProjectModel.deleteMany({ student_id: id });
    await ResetTokenModel.deleteOne({ email: user.email });
    await UserModel.deleteOne({ id });
    return { deleted: true, submissions: subs.deletedCount || 0, projects: projs.deletedCount || 0 };
  }
  let submissions = 0, projects = 0;
  for (const [k, v] of memorySubmissions) if (v.student_id === id) { memorySubmissions.delete(k); submissions++; }
  for (const [k, v] of memoryProjects) if (v.student_id === id) { memoryProjects.delete(k); projects++; }
  memoryResetTokens.delete(user.email);
  memoryUsers.delete(id);
  return { deleted: true, submissions, projects };
}

export async function getAllUsers(): Promise<User[]> {
  if (isMongoConnected) {
    const users = await UserModel.find().lean();
    return users as User[];
  }
  return Array.from(memoryUsers.values());
}

// --- CHALLENGES ---
export async function getActiveChallenges(category?: string): Promise<Challenge[]> {
  if (isMongoConnected) {
    const query: any = { status: "active" };
    if (category && category.toLowerCase() !== "all") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }
    const items = await ChallengeModel.find(query).sort({ created_at: -1 }).lean();
    return (items as Challenge[]).filter((c) => !isChallengeExpired(c));
  }
  let items = Array.from(memoryChallenges.values()).filter((c) => c.status === "active" && !isChallengeExpired(c));
  if (category && category.toLowerCase() !== "all") {
    items = items.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  }
  items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return items;
}

// A challenge is open until the end of its deadline day (India time).
export function isChallengeExpired(c: Pick<Challenge, "deadline">): boolean {
  if (!c?.deadline) return false;
  const d = new Date(c.deadline);
  if (isNaN(d.getTime())) return false;
  const IST_OFFSET = 5.5 * 3600000;
  // The calendar day of the deadline as seen in India...
  const ist = new Date(d.getTime() + IST_OFFSET);
  // ...and the last millisecond of that day, converted back to real time.
  const endOfDay = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), 23, 59, 59, 999) - IST_OFFSET;
  return Date.now() > endOfDay;
}

// Every challenge, including expired and closed ones (admin view).
export async function getAllChallenges(): Promise<Challenge[]> {
  if (isMongoConnected) {
    const items = await ChallengeModel.find({}).sort({ created_at: -1 }).lean();
    return items as Challenge[];
  }
  return Array.from(memoryChallenges.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function updateChallenge(id: string, updates: Partial<Challenge>): Promise<Challenge | null> {
  if (isMongoConnected) {
    const updated = await ChallengeModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return updated as Challenge | null;
  }
  const c = memoryChallenges.get(id);
  if (!c) return null;
  const merged = { ...c, ...updates };
  memoryChallenges.set(id, merged);
  return merged;
}

// Adds any built-in practice challenge whose title isn't on the board yet. Returns how many were added.
export async function addPracticeChallenges(): Promise<number> {
  const existing = new Set((await getAllChallenges()).map((c) => c.title.trim().toLowerCase()));
  const now = new Date();
  let added = 0;
  for (const sc of SEED_CHALLENGES) {
    if (existing.has(sc.title.trim().toLowerCase())) continue;
    await createChallenge({
      id: crypto.randomUUID(),
      title: sc.title,
      org: sc.org,
      category: sc.category,
      difficulty: sc.difficulty,
      deadline: new Date(now.getTime() + sc.deadline_days * 86400000).toISOString(),
      est_time: sc.est_time,
      tags: sc.tags,
      description: sc.description,
      problem_statement: sc.problem_statement,
      deliverables: sc.deliverables,
      rubric: sc.rubric,
      status: "active",
      contact_email: "",
      created_at: now_iso(),
    });
    added += 1;
  }
  return added;
}

export async function getChallengeById(id: string): Promise<Challenge | null> {
  if (isMongoConnected) {
    const c = await ChallengeModel.findOne({ id }).lean();
    return c as Challenge | null;
  }
  return memoryChallenges.get(id) || null;
}

export async function createChallenge(challengeData: Challenge): Promise<Challenge> {
  if (isMongoConnected) {
    const created = await ChallengeModel.create(challengeData);
    return created.toObject() as Challenge;
  }
  memoryChallenges.set(challengeData.id, challengeData);
  return challengeData;
}

export async function deleteChallenge(id: string): Promise<boolean> {
  if (isMongoConnected) {
    const res = await ChallengeModel.deleteOne({ id });
    return res.deletedCount > 0;
  }
  return memoryChallenges.delete(id);
}

// --- SUBMISSIONS ---
export async function createSubmission(subData: Submission): Promise<Submission> {
  if (isMongoConnected) {
    const created = await SubmissionModel.create(subData);
    return created.toObject() as Submission;
  }
  memorySubmissions.set(subData.id, subData);
  return subData;
}

export async function getSubmissionsByStudentId(studentId: string): Promise<Submission[]> {
  if (isMongoConnected) {
    const items = await SubmissionModel.find({ student_id: studentId }).sort({ submitted_at: -1 }).lean();
    return items as Submission[];
  }
  return Array.from(memorySubmissions.values())
    .filter((s) => s.student_id === studentId)
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
}

export async function getSubmissionById(id: string): Promise<Submission | null> {
  if (isMongoConnected) {
    const s = await SubmissionModel.findOne({ id }).lean();
    return s as Submission | null;
  }
  return memorySubmissions.get(id) || null;
}

export async function findSubmissionByStudentAndChallenge(studentId: string, challengeId: string): Promise<Submission | null> {
  if (isMongoConnected) {
    const s = await SubmissionModel.findOne({ student_id: studentId, challenge_id: challengeId }).lean();
    return s as Submission | null;
  }
  return Array.from(memorySubmissions.values()).find((s) => s.student_id === studentId && s.challenge_id === challengeId) || null;
}

export async function getAllSubmissions(): Promise<Submission[]> {
  if (isMongoConnected) {
    const items = await SubmissionModel.find().sort({ submitted_at: -1 }).lean();
    return items as Submission[];
  }
  return Array.from(memorySubmissions.values()).sort(
    (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
  );
}

export async function updateSubmission(id: string, updates: Partial<Submission>): Promise<Submission | null> {
  if (isMongoConnected) {
    const updated = await SubmissionModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return updated as Submission | null;
  }
  const s = memorySubmissions.get(id);
  if (!s) return null;
  Object.assign(s, updates);
  memorySubmissions.set(id, s);
  return s;
}

export async function deleteSubmission(id: string): Promise<boolean> {
  if (isMongoConnected) {
    const res = await SubmissionModel.deleteOne({ id });
    return res.deletedCount > 0;
  }
  return memorySubmissions.delete(id);
}

// --- PROJECTS ---
export async function createProject(projData: Project): Promise<Project> {
  if (isMongoConnected) {
    const created = await ProjectModel.create(projData);
    return created.toObject() as Project;
  }
  memoryProjects.set(projData.id, projData);
  return projData;
}

export async function getProjectsByStudentId(studentId: string): Promise<Project[]> {
  if (isMongoConnected) {
    const items = await ProjectModel.find({ student_id: studentId }).sort({ created_at: -1 }).lean();
    return items as Project[];
  }
  return Array.from(memoryProjects.values())
    .filter((p) => p.student_id === studentId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getAllProjects(): Promise<Project[]> {
  if (isMongoConnected) {
    const items = await ProjectModel.find().lean();
    return items as Project[];
  }
  return Array.from(memoryProjects.values());
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (isMongoConnected) {
    const p = await ProjectModel.findOne({ id }).lean();
    return p as Project | null;
  }
  return memoryProjects.get(id) || null;
}

export async function findProjectByStudentAndChallenge(studentId: string, challengeId: string): Promise<Project | null> {
  if (isMongoConnected) {
    const p = await ProjectModel.findOne({ student_id: studentId, challenge_id: challengeId }).lean();
    return p as Project | null;
  }
  return Array.from(memoryProjects.values()).find((p) => p.student_id === studentId && p.challenge_id === challengeId) || null;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  if (isMongoConnected) {
    const updated = await ProjectModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return updated as Project | null;
  }
  const p = memoryProjects.get(id);
  if (!p) return null;
  Object.assign(p, updates);
  memoryProjects.set(id, p);
  return p;
}

export async function deleteProject(id: string): Promise<boolean> {
  if (isMongoConnected) {
    const res = await ProjectModel.deleteOne({ id });
    return res.deletedCount > 0;
  }
  return memoryProjects.delete(id);
}

// --- PENDING CHALLENGES ---
export async function createPendingChallenge(pcData: PendingChallenge): Promise<PendingChallenge> {
  if (isMongoConnected) {
    const created = await PendingChallengeModel.create(pcData);
    return created.toObject() as PendingChallenge;
  }
  memoryPendingChallenges.set(pcData.id, pcData);
  return pcData;
}

export async function getPendingChallenges(): Promise<PendingChallenge[]> {
  if (isMongoConnected) {
    const items = await PendingChallengeModel.find({ status: "pending" }).sort({ submitted_at: -1 }).lean();
    return items as PendingChallenge[];
  }
  return Array.from(memoryPendingChallenges.values())
    .filter((pc) => pc.status === "pending")
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());
}

export async function getPendingChallengeById(id: string): Promise<PendingChallenge | null> {
  if (isMongoConnected) {
    const pc = await PendingChallengeModel.findOne({ id }).lean();
    return pc as PendingChallenge | null;
  }
  return memoryPendingChallenges.get(id) || null;
}

export async function deletePendingChallenge(id: string): Promise<boolean> {
  if (isMongoConnected) {
    const res = await PendingChallengeModel.deleteOne({ id });
    return res.deletedCount > 0;
  }
  return memoryPendingChallenges.delete(id);
}

// --- RESET TOKENS ---
export async function setResetToken(email: string, token: string, expires_at: number): Promise<void> {
  const norm = email.toLowerCase().trim();
  if (isMongoConnected) {
    await ResetTokenModel.findOneAndUpdate(
      { email: norm },
      { email: norm, token, expires_at },
      { upsert: true, new: true }
    );
  } else {
    memoryResetTokens.set(norm, { email: norm, token, expires_at });
  }
}

export async function getResetToken(email: string): Promise<ResetToken | null> {
  const norm = email.toLowerCase().trim();
  if (isMongoConnected) {
    const rt = await ResetTokenModel.findOne({ email: norm }).lean();
    return rt as ResetToken | null;
  }
  return memoryResetTokens.get(norm) || null;
}

export async function deleteResetToken(email: string): Promise<void> {
  const norm = email.toLowerCase().trim();
  if (isMongoConnected) {
    await ResetTokenModel.deleteOne({ email: norm });
  } else {
    memoryResetTokens.delete(norm);
  }
}
