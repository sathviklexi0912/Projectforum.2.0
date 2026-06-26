from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
import uuid
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Annotated
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Header
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict

# ---------- DB Setup ----------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'projectforum-dev-secret-key-change-in-prod')
JWT_ALGORITHM = 'HS256'
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')

app = FastAPI(title="ProjectForum API")
api = APIRouter(prefix="/api")

# ---------- Helpers ----------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False

def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def serialize_user(user: dict) -> dict:
    if not user:
        return None
    return {
        "id": user["id"],
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "university": user.get("university", ""),
        "degree": user.get("degree", ""),
        "year": user.get("year", ""),
        "linkedin": user.get("linkedin", ""),
        "skills": user.get("skills", []),
        "created_at": user.get("created_at", ""),
    }

async def get_current_user(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = auth[7:]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_admin(x_admin_password: Optional[str] = Header(None)):
    if x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin password")
    return True

# ---------- Models ----------
class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    university: str = ""
    degree: str = ""
    year: str = ""
    linkedin: str = ""
    skills: List[str] = []

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class ResetPasswordIn(BaseModel):
    email: EmailStr
    new_password: str

class UpdateProfileIn(BaseModel):
    name: Optional[str] = None
    university: Optional[str] = None
    degree: Optional[str] = None
    year: Optional[str] = None
    linkedin: Optional[str] = None
    skills: Optional[List[str]] = None

class ChallengeIn(BaseModel):
    title: str
    org: str
    category: str
    difficulty: str
    deadline: str  # ISO date
    est_time: str
    tags: List[str] = []
    description: str = ""
    problem_statement: str
    deliverables: List[str] = []
    rubric: List[str] = []
    contact_email: str = ""

class SubmissionIn(BaseModel):
    challenge_id: str
    submission_link: str
    explanation: str
    time_spent: str
    key_learning: str

class SubmissionStatusIn(BaseModel):
    status: str

class VerifyIn(BaseModel):
    verifier_name: str
    verifier_title: str

class ProjectIn(BaseModel):
    title: str
    description: str
    link: str
    category: str
    date_completed: str  # "YYYY-MM"

class ProjectUpdateIn(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    link: Optional[str] = None
    category: Optional[str] = None
    date_completed: Optional[str] = None

class PendingChallengeIn(BaseModel):
    company_name: str
    contact_email: EmailStr
    title: str
    problem_description: str
    deliverables: str
    evaluation_criteria: str
    est_time: str
    difficulty: str
    category: str
    deadline_preference: str

class AdminLoginIn(BaseModel):
    password: str

# ---------- Auth Endpoints ----------
@api.post("/auth/register")
async def register(body: RegisterIn):
    email = body.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "name": body.name.strip(),
        "email": email,
        "password_hash": hash_password(body.password),
        "university": body.university,
        "degree": body.degree,
        "year": body.year,
        "linkedin": body.linkedin,
        "skills": body.skills,
        "created_at": now_iso(),
    }
    await db.users.insert_one(doc)
    token = create_token(user_id, email)
    return {"token": token, "user": serialize_user(doc)}

@api.post("/auth/login")
async def login(body: LoginIn):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user or not verify_password(body.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"], email)
    return {"token": token, "user": serialize_user(user)}

@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return serialize_user(user)

@api.post("/auth/reset-password")
async def reset_password(body: ResetPasswordIn):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="No account with that email")
    await db.users.update_one(
        {"email": email},
        {"$set": {"password_hash": hash_password(body.new_password)}}
    )
    return {"message": "Password updated successfully"}

@api.patch("/auth/me")
async def update_me(body: UpdateProfileIn, user: dict = Depends(get_current_user)):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if update:
        await db.users.update_one({"id": user["id"]}, {"$set": update})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0})
    return serialize_user(updated)

# ---------- Admin Login ----------
@api.post("/admin/login")
async def admin_login(body: AdminLoginIn):
    if body.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin password")
    return {"ok": True}

# ---------- Challenges ----------
@api.get("/challenges")
async def list_challenges(category: Optional[str] = None):
    query = {"status": "active"}
    if category and category.lower() != "all":
        query["category"] = category
    items = await db.challenges.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items

@api.get("/challenges/{cid}")
async def get_challenge(cid: str):
    item = await db.challenges.find_one({"id": cid}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return item

# ---------- Submissions ----------
@api.post("/submissions")
async def create_submission(body: SubmissionIn, user: dict = Depends(get_current_user)):
    challenge = await db.challenges.find_one({"id": body.challenge_id})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found")
    sub = {
        "id": str(uuid.uuid4()),
        "student_id": user["id"],
        "student_name": user.get("name", ""),
        "student_university": user.get("university", ""),
        "challenge_id": body.challenge_id,
        "challenge_title": challenge.get("title", ""),
        "challenge_org": challenge.get("org", ""),
        "submission_link": body.submission_link,
        "explanation": body.explanation,
        "time_spent": body.time_spent,
        "key_learning": body.key_learning,
        "status": "Submitted",
        "verified": False,
        "verifier_name": "",
        "verifier_title": "",
        "submitted_at": now_iso(),
    }
    await db.submissions.insert_one(sub)
    sub.pop("_id", None)

    # Auto-create a portfolio project for this submission
    today = datetime.now(timezone.utc)
    project = {
        "id": str(uuid.uuid4()),
        "student_id": user["id"],
        "title": challenge.get("title", ""),
        "description": body.explanation,
        "link": body.submission_link,
        "category": challenge.get("category", "Other"),
        "date_completed": today.strftime("%Y-%m"),
        "source_submission_id": sub["id"],
        "created_at": now_iso(),
    }
    await db.projects.insert_one(project)

    return sub

@api.get("/submissions/mine")
async def my_submissions(user: dict = Depends(get_current_user)):
    items = await db.submissions.find({"student_id": user["id"]}, {"_id": 0}).sort("submitted_at", -1).to_list(500)
    return items

@api.get("/submissions/{sid}")
async def get_my_submission(sid: str, user: dict = Depends(get_current_user)):
    sub = await db.submissions.find_one({"id": sid, "student_id": user["id"]}, {"_id": 0})
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return sub

@api.patch("/submissions/{sid}")
async def update_my_submission(sid: str, body: SubmissionIn, user: dict = Depends(get_current_user)):
    sub = await db.submissions.find_one({"id": sid, "student_id": user["id"]})
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    challenge = await db.challenges.find_one({"id": sub["challenge_id"]})
    if challenge and challenge.get("deadline"):
        try:
            deadline = datetime.fromisoformat(challenge["deadline"])
            if deadline < datetime.now(timezone.utc):
                raise HTTPException(status_code=400, detail="Deadline has passed")
        except ValueError:
            pass
    update = {
        "submission_link": body.submission_link,
        "explanation": body.explanation,
        "time_spent": body.time_spent,
        "key_learning": body.key_learning,
    }
    await db.submissions.update_one({"id": sid}, {"$set": update})
    updated = await db.submissions.find_one({"id": sid}, {"_id": 0})
    return updated

@api.get("/admin/submissions")
async def admin_submissions(_: bool = Depends(require_admin)):
    items = await db.submissions.find({}, {"_id": 0}).sort("submitted_at", -1).to_list(1000)
    return items

@api.patch("/admin/submissions/{sid}")
async def update_submission_status(sid: str, body: SubmissionStatusIn, _: bool = Depends(require_admin)):
    valid = ["Submitted", "Under Review", "Shortlisted", "Rejected"]
    if body.status not in valid:
        raise HTTPException(status_code=400, detail="Invalid status")
    result = await db.submissions.update_one({"id": sid}, {"$set": {"status": body.status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"ok": True}

@api.post("/admin/submissions/{sid}/verify")
async def verify_submission(sid: str, body: VerifyIn, _: bool = Depends(require_admin)):
    name = body.verifier_name.strip()
    title = body.verifier_title.strip()
    if not name or not title:
        raise HTTPException(status_code=400, detail="Verifier name and title are required")
    result = await db.submissions.update_one(
        {"id": sid},
        {"$set": {"verified": True, "verifier_name": name, "verifier_title": title}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"ok": True}

@api.delete("/admin/submissions/{sid}/verify")
async def unverify_submission(sid: str, _: bool = Depends(require_admin)):
    result = await db.submissions.update_one(
        {"id": sid},
        {"$set": {"verified": False, "verifier_name": "", "verifier_title": ""}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"ok": True}

@api.delete("/admin/submissions/{sid}")
async def admin_delete_submission(sid: str, _: bool = Depends(require_admin)):
    result = await db.submissions.delete_one({"id": sid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"ok": True}

@api.delete("/submissions/{sid}")
async def delete_my_submission(sid: str, user: dict = Depends(get_current_user)):
    result = await db.submissions.delete_one({"id": sid, "student_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"ok": True}

# ---------- Projects ----------
@api.post("/projects")
async def create_project(body: ProjectIn, user: dict = Depends(get_current_user)):
    proj = {
        "id": str(uuid.uuid4()),
        "student_id": user["id"],
        "title": body.title,
        "description": body.description,
        "link": body.link,
        "category": body.category,
        "date_completed": body.date_completed,
        "created_at": now_iso(),
    }
    await db.projects.insert_one(proj)
    proj.pop("_id", None)
    return proj

@api.get("/projects/mine")
async def my_projects(user: dict = Depends(get_current_user)):
    items = await db.projects.find({"student_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return items

@api.patch("/projects/{pid}")
async def update_project(pid: str, body: ProjectUpdateIn, user: dict = Depends(get_current_user)):
    proj = await db.projects.find_one({"id": pid, "student_id": user["id"]})
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if proj.get("source_submission_id"):
        # Auto-linked from a submission — protect link & date_completed
        update.pop("link", None)
        update.pop("date_completed", None)
    if update:
        await db.projects.update_one({"id": pid}, {"$set": update})
    updated = await db.projects.find_one({"id": pid}, {"_id": 0})
    return updated

@api.delete("/projects/{pid}")
async def delete_project(pid: str, user: dict = Depends(get_current_user)):
    result = await db.projects.delete_one({"id": pid, "student_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"ok": True}

# ---------- Pending Challenges (company submissions) ----------
@api.post("/pending-challenges")
async def submit_pending(body: PendingChallengeIn):
    pc = {
        "id": str(uuid.uuid4()),
        "status": "pending",
        "submitted_at": now_iso(),
        **body.model_dump(),
    }
    await db.pending_challenges.insert_one(pc)
    pc.pop("_id", None)
    return {"ok": True, "id": pc["id"]}

@api.get("/admin/pending-challenges")
async def list_pending(_: bool = Depends(require_admin)):
    items = await db.pending_challenges.find({"status": "pending"}, {"_id": 0}).sort("submitted_at", -1).to_list(500)
    return items

@api.post("/admin/pending-challenges/{pid}/approve")
async def approve_pending(pid: str, _: bool = Depends(require_admin)):
    pc = await db.pending_challenges.find_one({"id": pid})
    if not pc:
        raise HTTPException(status_code=404, detail="Not found")
    days = 30
    try:
        days = int(''.join([c for c in pc.get("deadline_preference", "30") if c.isdigit()]) or 30)
    except Exception:
        days = 30
    deadline = (datetime.now(timezone.utc) + timedelta(days=days)).isoformat()
    challenge = {
        "id": str(uuid.uuid4()),
        "title": pc["title"],
        "org": pc["company_name"],
        "category": pc["category"],
        "difficulty": pc["difficulty"],
        "deadline": deadline,
        "est_time": pc["est_time"],
        "tags": [pc["category"]],
        "description": pc["problem_description"][:200],
        "problem_statement": pc["problem_description"],
        "deliverables": [d.strip() for d in pc["deliverables"].split(",") if d.strip()],
        "rubric": [r.strip() for r in pc["evaluation_criteria"].split(",") if r.strip()],
        "status": "active",
        "contact_email": pc["contact_email"],
        "created_at": now_iso(),
    }
    await db.challenges.insert_one(challenge)
    await db.pending_challenges.delete_one({"id": pid})
    challenge.pop("_id", None)
    return {"ok": True, "challenge_id": challenge["id"]}

@api.delete("/admin/pending-challenges/{pid}")
async def reject_pending(pid: str, _: bool = Depends(require_admin)):
    result = await db.pending_challenges.delete_one({"id": pid})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}

# ---------- Public Profile ----------
@api.get("/profile/{student_id}")
async def public_profile(student_id: str):
    user = await db.users.find_one({"id": student_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Profile not found")
    submissions = await db.submissions.find(
        {
            "student_id": student_id,
            "$or": [
                {"status": "Shortlisted"},
                {"verified": True},
            ],
        },
        {"_id": 0}
    ).to_list(100)
    projects = await db.projects.find({"student_id": student_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return {
        "user": serialize_user(user),
        "completed_challenges": submissions,
        "projects": projects,
    }

# ---------- Seed ----------
SEED_CHALLENGES = [
    {
        "title": "Go-to-Market Strategy for D2C Skincare Brand",
        "org": "GrowthLab",
        "category": "Marketing",
        "difficulty": "Intermediate",
        "deadline_days": 21,
        "est_time": "10–14 hrs",
        "tags": ["GTM", "Consumer brands", "India market"],
        "description": "Design a 90-day GTM plan for a D2C skincare brand entering Tier 2 Indian cities.",
        "problem_statement": "Design a 90-day GTM plan for a D2C skincare brand entering Tier 2 Indian cities. Include channel strategy, pricing rationale, and 3-month KPIs.",
        "deliverables": ["Channel strategy", "Pricing plan", "Month-by-month milestones", "Risk mitigation", "Budget allocation"],
        "rubric": ["Strategic clarity", "India market understanding", "Feasibility", "Structure and communication"],
    },
    {
        "title": "Unit Economics Model for a B2B SaaS Startup",
        "org": "VentureHive",
        "category": "Finance",
        "difficulty": "Advanced",
        "deadline_days": 28,
        "est_time": "12–18 hrs",
        "tags": ["SaaS", "Financial modelling", "Unit economics"],
        "description": "Build a 3-year unit economics model. Calculate CAC, LTV, payback period, and recommend a pricing tier.",
        "problem_statement": "Build a 3-year unit economics model. Calculate CAC, LTV, payback period, and recommend a pricing tier.",
        "deliverables": ["Unit economics model", "3-year P&L", "Sensitivity table", "Investor summary"],
        "rubric": ["Calculation accuracy", "Assumption transparency", "Investor lens", "Presentation quality"],
    },
    {
        "title": "Market Entry Analysis: EV Charging in Rural India",
        "org": "Bharat Ventures",
        "category": "Strategy",
        "difficulty": "Intermediate",
        "deadline_days": 35,
        "est_time": "8–12 hrs",
        "tags": ["Market sizing", "EV", "Rural India"],
        "description": "Analyse the EV charging opportunity in semi-urban India. Size the market, identify barriers, give a go/no-go recommendation.",
        "problem_statement": "Analyse the EV charging opportunity in semi-urban India. Size the market, identify barriers, give a go/no-go recommendation.",
        "deliverables": ["Market size estimate", "Competitive landscape", "Barrier analysis", "Business model recommendation", "Go/no-go decision"],
        "rubric": ["Analytical rigour", "Ground-level understanding", "Commercial thinking", "Decision quality"],
    },
    {
        "title": "Brand Positioning for a Fintech Targeting Gen Z",
        "org": "Pixel Finance",
        "category": "Marketing",
        "difficulty": "Beginner",
        "deadline_days": 42,
        "est_time": "6–8 hrs",
        "tags": ["Brand strategy", "Gen Z", "Fintech"],
        "description": "Develop brand positioning and a messaging framework for a savings app targeting Indian college students aged 18–24.",
        "problem_statement": "Develop brand positioning and a messaging framework for a savings app targeting Indian college students aged 18–24.",
        "deliverables": ["Positioning statement", "Messaging framework", "Brand voice with example copy", "Channel recommendation"],
        "rubric": ["Audience insight", "Brand clarity", "Copywriting quality", "Practical applicability"],
    },
]

async def seed_data():
    count = await db.challenges.count_documents({})
    if count == 0:
        now = datetime.now(timezone.utc)
        for sc in SEED_CHALLENGES:
            deadline = (now + timedelta(days=sc["deadline_days"])).isoformat()
            doc = {
                "id": str(uuid.uuid4()),
                "title": sc["title"],
                "org": sc["org"],
                "category": sc["category"],
                "difficulty": sc["difficulty"],
                "deadline": deadline,
                "est_time": sc["est_time"],
                "tags": sc["tags"],
                "description": sc["description"],
                "problem_statement": sc["problem_statement"],
                "deliverables": sc["deliverables"],
                "rubric": sc["rubric"],
                "status": "active",
                "contact_email": "",
                "created_at": now_iso(),
            }
            await db.challenges.insert_one(doc)

    # Demo student
    demo_email = "demo@projectforum.com"
    existing = await db.users.find_one({"email": demo_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()),
            "name": "Demo Student",
            "email": demo_email,
            "password_hash": hash_password("Demo@123"),
            "university": "IIT Bombay",
            "degree": "B.Tech Computer Science",
            "year": "3rd",
            "linkedin": "https://linkedin.com/in/demo",
            "skills": ["Marketing", "Strategy", "Analytics"],
            "created_at": now_iso(),
        })

    await db.users.create_index("email", unique=True)
    await db.challenges.create_index("id", unique=True)
    await db.submissions.create_index("student_id")
    await db.projects.create_index("student_id")

    # Backfill verification fields for legacy submissions
    await db.submissions.update_many(
        {"verified": {"$exists": False}},
        {"$set": {"verified": False, "verifier_name": "", "verifier_title": ""}},
    )

@app.on_event("startup")
async def on_startup():
    await seed_data()
    # write test credentials
    try:
        memdir = Path("/app/memory")
        memdir.mkdir(parents=True, exist_ok=True)
        (memdir / "test_credentials.md").write_text(
            "# Test Credentials\n\n"
            "## Demo Student\n"
            "- Email: demo@projectforum.com\n"
            "- Password: Demo@123\n\n"
            f"## Admin\n- Password (header X-Admin-Password): {ADMIN_PASSWORD}\n"
            "- Admin login UI: /admin (enter the password)\n\n"
            "## Auth endpoints\n- POST /api/auth/register\n- POST /api/auth/login\n- GET /api/auth/me (Bearer token)\n- POST /api/auth/reset-password\n"
        )
    except Exception as e:
        logging.warning(f"Could not write test_credentials.md: {e}")

@app.on_event("shutdown")
async def on_shutdown():
    client.close()

app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
