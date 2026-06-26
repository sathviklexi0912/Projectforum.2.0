import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { api, formatApiError, initialsFromName } from "@/lib/api";

const SKILLS = ["Marketing", "Finance", "Consulting", "Entrepreneurship", "Analytics", "HR", "Operations", "Strategy"];
const YEARS = ["1st", "2nd", "3rd", "Final", "Postgrad"];

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || "",
    university: user?.university || "",
    degree: user?.degree || "",
    year: user?.year || "",
    linkedin: user?.linkedin || "",
    skills: user?.skills || [],
    bio: user?.bio || "",
    location: user?.location || "",
    headline: user?.headline || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleSkill = (s) => set("skills", form.skills.includes(s) ? form.skills.filter((x) => x !== s) : [...form.skills, s]);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch("/auth/me", form);
      updateUser(data);
      toast.success("Profile updated");
      navigate("/dashboard/profile");
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="App" data-testid="edit-profile-page">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate("/dashboard/profile")}
          className="pf-link text-sm inline-flex items-center gap-1.5 mb-6"
          data-testid="back-to-profile"
        >
          <ArrowLeft size={14}/> Back to profile
        </button>

        <div className="mb-8 flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-extrabold text-white text-lg"
            style={{ background: "linear-gradient(135deg, var(--pf-secondary), var(--pf-primary))" }}
          >
            {initialsFromName(form.name || user.email)}
          </div>
          <div>
            <span className="pf-tag mb-1 inline-block">Edit profile</span>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tighter">Polish your story</h1>
          </div>
        </div>

        <form onSubmit={save} className="pf-card p-8 space-y-5" data-testid="edit-profile-form">
          <div>
            <label className="text-sm font-medium block mb-1.5">Full Name</label>
            <input className="pf-input" value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="edit-name" required/>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Profile Headline</label>
            <input
              className="pf-input"
              placeholder="e.g. Finance student at IIM Bangalore · Aspiring Consultant"
              value={form.headline}
              onChange={(e) => set("headline", e.target.value)}
              maxLength={120}
              data-testid="edit-headline"
            />
            <p className="text-[11px] mt-1" style={{ color: "var(--pf-muted)" }}>One sharp line — shown at the top of your public profile.</p>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Bio</label>
            <textarea
              rows={3}
              className="pf-input"
              placeholder="2–3 sentences about you, your interests, and what you’re looking for."
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              maxLength={420}
              data-testid="edit-bio"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">University</label>
              <input className="pf-input" value={form.university} onChange={(e) => set("university", e.target.value)} data-testid="edit-university"/>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Location</label>
              <input className="pf-input" placeholder="e.g. Bangalore" value={form.location} onChange={(e) => set("location", e.target.value)} data-testid="edit-location"/>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Degree</label>
              <input className="pf-input" value={form.degree} onChange={(e) => set("degree", e.target.value)} data-testid="edit-degree"/>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Year of Study</label>
              <select className="pf-input" value={form.year} onChange={(e) => set("year", e.target.value)} data-testid="edit-year">
                <option value="">Select</option>
                {YEARS.map((y) => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">LinkedIn URL</label>
            <input
              type="url"
              className="pf-input"
              placeholder="https://linkedin.com/in/…"
              value={form.linkedin}
              onChange={(e) => set("linkedin", e.target.value)}
              data-testid="edit-linkedin"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Skills</label>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map((s) => {
                const active = form.skills.includes(s);
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => toggleSkill(s)}
                    data-testid={`edit-skill-${s.toLowerCase()}`}
                    className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all"
                    style={active
                      ? { background: "var(--pf-primary)", color: "#fff", border: "1px solid var(--pf-primary)" }
                      : { background: "transparent", color: "var(--pf-text)", border: "1px solid var(--pf-card-border)" }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="pf-btn-primary flex-1" data-testid="edit-save">
              {saving ? "Saving…" : "Save profile"}
            </button>
            <button type="button" onClick={() => navigate("/dashboard/profile")} className="pf-btn-secondary" data-testid="edit-cancel">
              Cancel
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
