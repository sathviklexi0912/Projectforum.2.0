import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, User, GraduationCap, Linkedin, Award, Save } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import usePageTitle from "@/lib/usePageTitle";
import ProfileTypeFields from "@/components/ProfileTypeFields";

export default function EditProfile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  usePageTitle("Edit profile");
  const [params] = useSearchParams();
  const welcome = params.get("welcome") === "1";
  const [formData, setFormData] = useState({
    name: "",
    headline: "",
    university: "",
    degree: "",
    year: "",
    linkedin: "",
    bio: "",
    open_to_opportunities: true,
    skills: "",
    profile_type: "student",
    current_role: "",
    experience_years: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        headline: user.headline || "",
        university: user.university || "",
        degree: user.degree || "",
        year: user.year || "",
        linkedin: user.linkedin || "",
        bio: user.bio || "",
        open_to_opportunities: user.open_to_opportunities !== false,
        skills: Array.isArray(user.skills) ? user.skills.join(", ") : user.skills || "",
        profile_type: user.profile_type || "student",
        current_role: user.current_role || "",
        experience_years: user.experience_years || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skillsArray = typeof formData.skills === "string"
        ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : formData.skills;

      await updateProfile({
        ...formData,
        skills: skillsArray,
      });
      toast.success("Profile updated successfully!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
        <Link to="/dashboard" className="pf-link text-sm inline-flex items-center gap-1.5 mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="pf-card p-8 sm:p-10">
          <h1 className="font-display text-3xl font-extrabold mb-2">{welcome ? "Finish your profile" : "Edit profile"}</h1>
          {welcome ? (
            <p className="text-sm mb-6" style={{ color: "var(--pf-muted)" }} data-testid="welcome-note">
              Recruiters see this on your public profile. Add what you can now, and skip anything you want to fill in later.{" "}
              <Link to="/challenges" className="pf-link">Skip for now</Link>
            </p>
          ) : <div className="mb-4" />}

          <form onSubmit={handleSubmit} className="space-y-5" data-testid="edit-profile-form">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                Full Name *
              </label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                data-testid="edit-name-input"
                className="pf-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                Headline / Subtitle
              </label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                placeholder="e.g. Brand strategist who loves D2C problems"
                data-testid="edit-headline-input"
                className="pf-input"
              />
            </div>

            <ProfileTypeFields value={formData} onChange={setFormData} idPrefix="edit" />

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                Skills (comma separated)
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="SQL, Growth Marketing, Python, Figma"
                data-testid="edit-skills-input"
                className="pf-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
                LinkedIn URL
              </label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                data-testid="edit-linkedin-input"
                className="pf-input"
              />
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-[var(--pf-card-border)] bg-[var(--pf-bg)]">
              <input
                type="checkbox"
                id="open_to_opportunities"
                name="open_to_opportunities"
                checked={formData.open_to_opportunities}
                onChange={handleChange}
                data-testid="edit-open-opportunities-checkbox"
                className="w-4 h-4 rounded text-[var(--pf-primary)]"
              />
              <label htmlFor="open_to_opportunities" className="text-xs font-semibold cursor-pointer">
                Show "Open to Opportunities" status badge on Talent Directory
              </label>
            </div>

            <div className="pt-4 border-t border-[var(--pf-card-border)] flex items-center justify-end gap-3">
              <Link to="/dashboard" className="pf-btn-secondary text-xs">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="pf-btn-primary text-sm py-2.5 px-6"
                data-testid="save-profile-btn"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving..." : "Save Profile"}</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
