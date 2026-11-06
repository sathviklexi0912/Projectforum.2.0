import { useEffect, useState } from "react";
import { CalendarClock, Trash2, Users, LayoutList, Plus, Check, X, Pencil } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

/* Admin tools for keeping the live site tidy:
   - Live challenges: see every challenge (including expired ones), move a deadline, delete, add practice challenges.
   - People: see everyone who has signed up and delete test or unwanted accounts. */

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};
const toInputDate = (iso) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const ist = new Date(d.getTime() + 5.5 * 3600000);
  return ist.toISOString().slice(0, 10);
};
const todayInput = () => new Date(Date.now() + 5.5 * 3600000).toISOString().slice(0, 10);

/* Two-step delete button: first click asks, second click confirms. */
function ConfirmDelete({ label, onConfirm, busy, testId }) {
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border text-red-600 border-red-500/30 hover:bg-red-500/10 transition-colors"
        data-testid={testId}
      >
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-xs font-semibold text-red-600">{label}</span>
      <button
        type="button"
        disabled={busy}
        onClick={async () => { await onConfirm(); setAsking(false); }}
        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
        data-testid={testId ? `${testId}-confirm` : undefined}
      >
        <Check className="w-3.5 h-3.5" /> Yes, delete
      </button>
      <button
        type="button"
        onClick={() => setAsking(false)}
        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border"
        style={{ borderColor: "var(--pf-card-border)" }}
      >
        <X className="w-3.5 h-3.5" /> Cancel
      </button>
    </span>
  );
}

function StatusPill({ expired, status }) {
  const closed = expired || status !== "active";
  return (
    <span
      className="pf-mono text-[10px] uppercase tracking-[.06em] px-2 py-0.5 rounded-md font-semibold"
      style={
        closed
          ? { background: "color-mix(in srgb, #c2263e 10%, transparent)", color: "#c2263e" }
          : { background: "color-mix(in srgb, var(--pf-ok) 12%, transparent)", color: "var(--pf-ok)" }
      }
    >
      {closed ? "Expired · hidden" : "Live"}
    </span>
  );
}

const asLines = (v) => (Array.isArray(v) ? v : []).join("\n");

/* Full edit form for one challenge. */
function ChallengeEditForm({ c, headers, onSaved, onCancel }) {
  const [f, setF] = useState({
    title: c.title || "",
    org: c.org || "",
    category: c.category || "",
    difficulty: c.difficulty || "Intermediate",
    est_time: c.est_time || "",
    contact_email: c.contact_email || "",
    description: c.description || "",
    problem_statement: c.problem_statement || "",
    deliverables: asLines(c.deliverables),
    rubric: asLines(c.rubric),
    tags: (Array.isArray(c.tags) ? c.tags : []).join(", "),
  });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const field = (k, label, props = {}) => (
    <label className="grid gap-1 text-xs font-semibold" style={{ color: "var(--pf-muted)" }}>
      {label}
      {props.rows ? (
        <textarea value={f[k]} onChange={set(k)} className="pf-input !text-sm" rows={props.rows} data-testid={`edit-${k}-${c.id}`} placeholder={props.placeholder} />
      ) : (
        <input value={f[k]} onChange={set(k)} className="pf-input !text-sm" type={props.type || "text"} data-testid={`edit-${k}-${c.id}`} placeholder={props.placeholder} />
      )}
    </label>
  );

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/admin/challenges/${c.id}`, f, { headers });
      toast.success("Challenge updated");
      onSaved();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not save the changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="grid gap-3 mt-4 pt-4 border-t" style={{ borderColor: "var(--pf-rule)" }} data-testid={`edit-form-${c.id}`}>
      <div className="grid gap-3 sm:grid-cols-2">
        {field("title", "Title")}
        {field("org", "Organisation")}
        {field("category", "Category", { placeholder: "Marketing, Finance, Strategy, Tech…" })}
        <label className="grid gap-1 text-xs font-semibold" style={{ color: "var(--pf-muted)" }}>
          Difficulty
          <select value={f.difficulty} onChange={set("difficulty")} className="pf-input !text-sm" data-testid={`edit-difficulty-${c.id}`}>
            <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
          </select>
        </label>
        {field("est_time", "Estimated time", { placeholder: "8–12 hrs" })}
        {field("contact_email", "Host contact email (private)", { type: "email" })}
      </div>
      {field("description", "Short description (shown on cards)", { rows: 2 })}
      {field("problem_statement", "Problem statement", { rows: 4 })}
      <div className="grid gap-3 sm:grid-cols-2">
        {field("deliverables", "Deliverables (one per line)", { rows: 4 })}
        {field("rubric", "Judging criteria (one per line)", { rows: 4 })}
      </div>
      {field("tags", "Tags (comma separated)")}
      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={saving} className="pf-btn-primary !py-2 !px-4 !text-sm" data-testid={`edit-save-${c.id}`}>
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button type="button" onClick={onCancel} className="pf-btn-secondary !py-2 !px-4 !text-sm">Cancel</button>
      </div>
    </form>
  );
}

function ChallengeRow({ c, headers, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(toInputDate(c.deadline));
  const [saving, setSaving] = useState(false);
  const changed = date && date !== toInputDate(c.deadline);

  const save = async () => {
    setSaving(true);
    try {
      // Save as the end of that day in India, so the challenge stays open the whole day.
      await api.patch(`/admin/challenges/${c.id}`, { deadline: `${date}T23:59:00+05:30` }, { headers });
      toast.success(`Deadline moved to ${fmtDate(`${date}T12:00:00+05:30`)}`);
      onChanged();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not update the deadline");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      await api.delete(`/admin/challenges/${c.id}`, { headers });
      toast.success("Challenge deleted");
      onChanged();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not delete the challenge");
    }
  };

  return (
    <div className="pf-card p-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center" data-testid={`admin-challenge-${c.id}`}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <StatusPill expired={c.is_expired} status={c.status} />
          <span className="pf-tag">{c.category}</span>
          <span className="text-xs" style={{ color: "var(--pf-muted)" }}>
            {c.submissions_count} submission{c.submissions_count === 1 ? "" : "s"}
          </span>
        </div>
        <p className="font-semibold leading-snug">{c.title}</p>
        <p className="text-xs" style={{ color: "var(--pf-muted)" }}>
          {c.org}{c.contact_email ? ` · ${c.contact_email}` : ""} · deadline {fmtDate(c.deadline)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--pf-muted)" }}>
          <CalendarClock className="w-3.5 h-3.5" />
          <span className="sr-only">New deadline for {c.title}</span>
          <input
            type="date"
            min={todayInput()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="pf-input !py-1.5 !px-2 !text-sm !w-auto"
            data-testid={`deadline-input-${c.id}`}
          />
        </label>
        <button
          type="button"
          disabled={!changed || saving}
          onClick={save}
          className="pf-btn-primary !py-1.5 !px-3 !text-xs disabled:opacity-40"
          data-testid={`deadline-save-${c.id}`}
        >
          {saving ? "Saving…" : "Save deadline"}
        </button>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:border-[var(--pf-primary)]"
          style={{ borderColor: "var(--pf-card-border)" }}
          aria-expanded={editing}
          data-testid={`edit-challenge-${c.id}`}
        >
          <Pencil className="w-3.5 h-3.5" /> {editing ? "Close" : "Edit"}
        </button>
        <ConfirmDelete label="Delete this challenge?" onConfirm={remove} testId={`delete-challenge-${c.id}`} />
      </div>
      {editing && (
        <div className="md:col-span-2">
          <ChallengeEditForm c={c} headers={headers} onCancel={() => setEditing(false)} onSaved={() => { setEditing(false); onChanged(); }} />
        </div>
      )}
    </div>
  );
}

export default function AdminManage({ adminPassword }) {
  const headers = { "x-admin-password": adminPassword };
  const [challenges, setChallenges] = useState([]);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = () =>
    Promise.all([api.get("/admin/challenges", { headers }), api.get("/admin/users", { headers })])
      .then(([c, u]) => {
        setChallenges(c.data);
        setPeople(u.data);
      })
      .catch((err) => toast.error(err?.response?.data?.detail || "Could not load admin data"))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const addPractice = async () => {
    setAdding(true);
    try {
      const res = await api.post("/admin/challenges/practice", {}, { headers });
      toast.success(res.data.added ? `Added ${res.data.added} practice challenge${res.data.added === 1 ? "" : "s"}` : "All practice challenges are already on the board");
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not add practice challenges");
    } finally {
      setAdding(false);
    }
  };

  const deletePerson = async (p) => {
    setBusyId(p.id);
    try {
      const res = await api.delete(`/admin/users/${p.id}`, { headers });
      toast.success(`Deleted ${p.name || p.email} (${res.data.submissions} submissions, ${res.data.projects} projects)`);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Could not delete this person");
    } finally {
      setBusyId(null);
    }
  };

  const live = challenges.filter((c) => !c.is_expired && c.status === "active").length;

  return (
    <>
      {/* ---------- Challenges ---------- */}
      <section data-testid="admin-challenges">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display text-2xl font-bold flex items-center gap-2">
              <LayoutList className="w-5 h-5 text-[var(--pf-primary)]" />
              <span>Challenges ({live} live of {challenges.length})</span>
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--pf-muted)" }}>
              Challenges are hidden from the site automatically after their deadline. Move the deadline to bring one back.
            </p>
          </div>
          <button type="button" onClick={addPractice} disabled={adding} className="pf-btn-secondary !py-2 !px-4 !text-sm" data-testid="add-practice-btn">
            <Plus className="w-4 h-4" /> {adding ? "Adding…" : "Add practice challenges"}
          </button>
        </div>
        {loading ? (
          <div className="pf-card h-24 animate-pulse" style={{ opacity: 0.5 }} />
        ) : challenges.length === 0 ? (
          <div className="pf-empty"><h3 className="font-display">No challenges yet</h3><p>Approve a host proposal or add the practice challenges.</p></div>
        ) : (
          <div className="grid gap-3">
            {challenges.map((c) => (
              <ChallengeRow key={c.id} c={c} headers={headers} onChanged={load} />
            ))}
          </div>
        )}
      </section>

      {/* ---------- People ---------- */}
      <section data-testid="admin-people">
        <div className="mb-4">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--pf-primary)]" />
            <span>People ({people.length})</span>
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--pf-muted)" }}>
            Everyone who has signed up. Deleting someone also removes their submissions and projects. This can't be undone.
          </p>
        </div>
        {loading ? (
          <div className="pf-card h-24 animate-pulse" style={{ opacity: 0.5 }} />
        ) : people.length === 0 ? (
          <div className="pf-empty"><h3 className="font-display">No one has signed up yet</h3></div>
        ) : (
          <div className="pf-card overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="text-left pf-mono text-[11px] uppercase tracking-[.06em]" style={{ color: "var(--pf-muted)" }}>
                  <th className="px-4 py-3 font-semibold">Person</th>
                  <th className="px-4 py-3 font-semibold">Institution</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold text-right">Work</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {people.map((p) => (
                  <tr key={p.id} className="border-t" style={{ borderColor: "var(--pf-rule)" }} data-testid={`admin-person-${p.id}`}>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{p.name || "—"}</div>
                      <div className="text-xs" style={{ color: "var(--pf-muted)" }}>{p.email}</div>
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--pf-muted)" }}>{p.university || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums" style={{ color: "var(--pf-muted)" }}>{fmtDate(p.created_at)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap tabular-nums">
                      {p.submissions_count} sub · {p.verified_count} verified · {p.projects_count} proj
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ConfirmDelete
                        label={`Delete ${p.name || "this person"}?`}
                        busy={busyId === p.id}
                        onConfirm={() => deletePerson(p)}
                        testId={`delete-person-${p.id}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
