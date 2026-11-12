/* "I am a…" choice plus the fields that fit it.
   Students: institution + year of study. Graduates: institution + graduation year.
   Professionals: organisation + current role + years of experience. */

export const PROFILE_TYPES = [
  { value: "student", label: "Student" },
  { value: "graduate", label: "Graduate" },
  { value: "professional", label: "Working professional" },
];

export function profileSubtitle(u) {
  if (!u) return "";
  if (u.profile_type === "professional") {
    const role = u.current_role || "";
    const yrs = u.experience_years ? `${u.experience_years} yr${u.experience_years === "1" ? "" : "s"} experience` : "";
    return [role, yrs].filter(Boolean).join(" · ");
  }
  if (u.profile_type === "graduate") return u.year ? `Graduated ${u.year}` : "Graduate";
  return u.year ? `Student · ${u.year}` : "";
}

const Label = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>
    {children}
  </label>
);

export default function ProfileTypeFields({ value, onChange, idPrefix = "pt", choiceOnly = false }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value });
  const type = value.profile_type || "student";
  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: "var(--pf-muted)" }}>I am a</legend>
        <div className="grid grid-cols-3 gap-2" role="radiogroup">
          {PROFILE_TYPES.map((t) => {
            const on = type === t.value;
            return (
              <label
                key={t.value}
                className="cursor-pointer text-center text-sm font-semibold px-2 py-2.5 rounded-[10px] border transition-colors"
                style={on
                  ? { borderColor: "var(--pf-primary)", background: "color-mix(in srgb, var(--pf-primary) 10%, transparent)", color: "var(--pf-primary)" }
                  : { borderColor: "var(--pf-card-border)", background: "var(--pf-card-bg)", color: "var(--pf-muted)" }}
              >
                <input
                  type="radio"
                  name={`${idPrefix}-profile-type`}
                  value={t.value}
                  checked={on}
                  onChange={set("profile_type")}
                  className="sr-only"
                  data-testid={`${idPrefix}-type-${t.value}`}
                />
                {t.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      {choiceOnly ? null : type === "professional" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_130px] gap-3">
            <div>
              <Label htmlFor={`${idPrefix}-role`}>Current role</Label>
              <input id={`${idPrefix}-role`} type="text" value={value.current_role || ""} onChange={set("current_role")}
                placeholder="Marketing Analyst" className="pf-input" data-testid={`${idPrefix}-role-input`} />
            </div>
            <div>
              <Label htmlFor={`${idPrefix}-exp`}>Experience (yrs)</Label>
              <input id={`${idPrefix}-exp`} type="number" min="0" max="60" value={value.experience_years || ""} onChange={set("experience_years")}
                placeholder="2" className="pf-input" data-testid={`${idPrefix}-exp-input`} />
            </div>
          </div>
          <div>
            <Label htmlFor={`${idPrefix}-org`}>Organisation</Label>
            <input id={`${idPrefix}-org`} type="text" value={value.university || ""} onChange={set("university")}
              placeholder="Zomato" className="pf-input" data-testid={`${idPrefix}-university-input`} />
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor={`${idPrefix}-uni`}>{type === "graduate" ? "Institution you graduated from" : "University / college"}</Label>
            <input id={`${idPrefix}-uni`} type="text" value={value.university || ""} onChange={set("university")}
              placeholder="e.g. Your college name" className="pf-input" data-testid={`${idPrefix}-university-input`} />
          </div>
          <div>
            <Label htmlFor={`${idPrefix}-year`}>{type === "graduate" ? "Graduation year" : "Year of study"}</Label>
            <input id={`${idPrefix}-year`} type="text" value={value.year || ""} onChange={set("year")}
              placeholder={type === "graduate" ? "2025" : "2nd year"} className="pf-input" data-testid={`${idPrefix}-year-input`} />
          </div>
        </div>
      )}
    </div>
  );
}
