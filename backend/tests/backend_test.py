"""ProjectForum backend API tests"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or "https://skill-showcase-496.preview.emergentagent.com"
API = f"{BASE_URL}/api"
ADMIN_PWD = "admin123"
DEMO_EMAIL = "demo@projectforum.com"
DEMO_PWD = "Demo@123"


@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="session")
def demo_token(s):
    r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PWD})
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def admin_headers():
    return {"X-Admin-Password": ADMIN_PWD, "Content-Type": "application/json"}


# ---------- Challenges ----------
class TestChallenges:
    def test_list_challenges_has_seeded(self, s):
        r = s.get(f"{API}/challenges")
        assert r.status_code == 200
        items = r.json()
        assert "GrowthLab" in " ".join([i["org"] for i in items])
        assert "VentureHive" in " ".join([i["org"] for i in items])
        assert "Bharat Ventures" in " ".join([i["org"] for i in items])
        assert "Pixel Finance" in " ".join([i["org"] for i in items])
        assert len(items) >= 4

    def test_filter_by_category(self, s):
        r = s.get(f"{API}/challenges", params={"category": "Finance"})
        assert r.status_code == 200
        for it in r.json():
            assert it["category"] == "Finance"

    def test_get_challenge_detail(self, s):
        items = s.get(f"{API}/challenges").json()
        cid = items[0]["id"]
        r = s.get(f"{API}/challenges/{cid}")
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == cid
        assert "problem_statement" in d

    def test_get_challenge_404(self, s):
        r = s.get(f"{API}/challenges/nonexistent-id")
        assert r.status_code == 404


# ---------- Auth ----------
class TestAuth:
    def test_register_and_duplicate(self, s):
        email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        payload = {"name": "Test User", "email": email, "password": "Pass@123", "skills": ["Python"]}
        r = s.post(f"{API}/auth/register", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "token" in data and "user" in data
        assert data["user"]["email"] == email
        # duplicate
        r2 = s.post(f"{API}/auth/register", json=payload)
        assert r2.status_code == 400

    def test_login_demo(self, s):
        r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PWD})
        assert r.status_code == 200
        data = r.json()
        assert data["user"]["email"] == DEMO_EMAIL
        assert "token" in data

    def test_login_wrong_password(self, s):
        r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me_with_token(self, s, demo_token):
        r = s.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {demo_token}"})
        assert r.status_code == 200
        assert r.json()["email"] == DEMO_EMAIL

    def test_me_no_token(self, s):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_patch_me(self, s, demo_token):
        r = s.patch(f"{API}/auth/me",
                    headers={"Authorization": f"Bearer {demo_token}"},
                    json={"university": "IIT Bombay", "year": "3rd"})
        assert r.status_code == 200
        assert r.json()["university"] == "IIT Bombay"

    def test_reset_password(self, s):
        email = f"resettest_{uuid.uuid4().hex[:6]}@example.com"
        s.post(f"{API}/auth/register", json={"name": "R", "email": email, "password": "Old@123"})
        r = s.post(f"{API}/auth/reset-password", json={"email": email, "new_password": "New@123"})
        assert r.status_code == 200
        # new password works
        rl = s.post(f"{API}/auth/login", json={"email": email, "password": "New@123"})
        assert rl.status_code == 200

    def test_reset_password_unknown(self, s):
        r = s.post(f"{API}/auth/reset-password",
                   json={"email": f"unknown_{uuid.uuid4().hex}@x.com", "new_password": "x"})
        assert r.status_code == 404


# ---------- Submissions ----------
class TestSubmissions:
    def test_create_and_list_mine(self, s, demo_token):
        challenges = s.get(f"{API}/challenges").json()
        cid = challenges[0]["id"]
        h = {"Authorization": f"Bearer {demo_token}"}
        payload = {
            "challenge_id": cid,
            "submission_link": "https://example.com/work",
            "explanation": "Solid approach.",
            "time_spent": "10h",
            "key_learning": "Learned a lot",
        }
        r = s.post(f"{API}/submissions", headers=h, json=payload)
        assert r.status_code == 200, r.text
        sid = r.json()["id"]
        # list mine
        r2 = s.get(f"{API}/submissions/mine", headers=h)
        assert r2.status_code == 200
        assert any(x["id"] == sid for x in r2.json())

    def test_submission_invalid_challenge(self, s, demo_token):
        h = {"Authorization": f"Bearer {demo_token}"}
        r = s.post(f"{API}/submissions", headers=h, json={
            "challenge_id": "bad-id", "submission_link": "x", "explanation": "x",
            "time_spent": "1h", "key_learning": "x"})
        assert r.status_code == 404

    def test_submission_requires_auth(self, s):
        r = requests.post(f"{API}/submissions", json={
            "challenge_id": "x", "submission_link": "x", "explanation": "x",
            "time_spent": "x", "key_learning": "x"})
        assert r.status_code == 401


# ---------- Projects ----------
class TestProjects:
    def test_project_crud(self, s, demo_token):
        h = {"Authorization": f"Bearer {demo_token}"}
        payload = {"title": "TEST_proj", "description": "d", "link": "https://x.com",
                   "category": "Marketing", "date_completed": "2025-06"}
        r = s.post(f"{API}/projects", headers=h, json=payload)
        assert r.status_code == 200
        pid = r.json()["id"]
        r2 = s.get(f"{API}/projects/mine", headers=h)
        assert r2.status_code == 200
        assert any(p["id"] == pid for p in r2.json())
        r3 = s.delete(f"{API}/projects/{pid}", headers=h)
        assert r3.status_code == 200


# ---------- Pending & Admin ----------
class TestAdminFlow:
    def test_admin_login_bad(self, s):
        r = s.post(f"{API}/admin/login", json={"password": "wrong"})
        assert r.status_code == 401

    def test_admin_login_ok(self, s):
        r = s.post(f"{API}/admin/login", json={"password": ADMIN_PWD})
        assert r.status_code == 200

    def test_admin_requires_header(self, s):
        r = requests.get(f"{API}/admin/submissions")
        assert r.status_code == 401

    def test_admin_submissions_list(self, s, admin_headers):
        r = s.get(f"{API}/admin/submissions", headers=admin_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_pending_submit_approve_reject_flow(self, s, admin_headers):
        # public submit
        title = f"TEST_pending_{uuid.uuid4().hex[:6]}"
        payload = {
            "company_name": "TestCo", "contact_email": "co@example.com",
            "title": title, "problem_description": "solve x",
            "deliverables": "A,B", "evaluation_criteria": "C1,C2",
            "est_time": "5h", "difficulty": "Beginner",
            "category": "Strategy", "deadline_preference": "30 days",
        }
        r = s.post(f"{API}/pending-challenges", json=payload)
        assert r.status_code == 200
        pid = r.json()["id"]
        # admin lists
        r2 = s.get(f"{API}/admin/pending-challenges", headers=admin_headers)
        assert r2.status_code == 200
        assert any(p["id"] == pid for p in r2.json())
        # approve
        r3 = s.post(f"{API}/admin/pending-challenges/{pid}/approve", headers=admin_headers)
        assert r3.status_code == 200
        cid = r3.json()["challenge_id"]
        # appears on public challenges
        chs = s.get(f"{API}/challenges").json()
        assert any(c["id"] == cid for c in chs)
        # reject test - create another and reject
        payload["title"] = f"TEST_reject_{uuid.uuid4().hex[:6]}"
        pid2 = s.post(f"{API}/pending-challenges", json=payload).json()["id"]
        r4 = s.delete(f"{API}/admin/pending-challenges/{pid2}", headers=admin_headers)
        assert r4.status_code == 200

    def test_update_submission_status(self, s, demo_token, admin_headers):
        # create a submission first
        cid = s.get(f"{API}/challenges").json()[0]["id"]
        h = {"Authorization": f"Bearer {demo_token}"}
        sid = s.post(f"{API}/submissions", headers=h, json={
            "challenge_id": cid, "submission_link": "https://x", "explanation": "e",
            "time_spent": "5h", "key_learning": "l"}).json()["id"]
        r = s.patch(f"{API}/admin/submissions/{sid}", headers=admin_headers,
                    json={"status": "Shortlisted"})
        assert r.status_code == 200
        # verify
        all_subs = s.get(f"{API}/admin/submissions", headers=admin_headers).json()
        found = [x for x in all_subs if x["id"] == sid]
        assert found and found[0]["status"] == "Shortlisted"


# ---------- Public Profile ----------
class TestPublicProfile:
    def test_public_profile(self, s, demo_token):
        me = s.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {demo_token}"}).json()
        r = requests.get(f"{API}/profile/{me['id']}")
        assert r.status_code == 200
        data = r.json()
        assert data["user"]["id"] == me["id"]
        assert isinstance(data["completed_challenges"], list)
        assert isinstance(data["projects"], list)

    def test_public_profile_404(self):
        r = requests.get(f"{API}/profile/nonexistent")
        assert r.status_code == 404
