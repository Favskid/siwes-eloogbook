import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import StatusBadge from "../components/StatusBadge";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

interface Props {
  entryId: string;
  editMode?: boolean;
}

export default function LogEntryDetail({ entryId, editMode }: Props) {
  const { user } = useAuth();
  const { logEntries, updateLogEntry } = useData();
  const [, navigate] = useLocation();
  const [saving, setSaving] = useState(false);

  const entry = logEntries.find(e => e.id === entryId);

  const [editForm, setEditForm] = useState({
    activityDescription: entry?.activityDescription || "",
    toolsEquipment: entry?.toolsEquipment || "",
    skillsAcquired: entry?.skillsAcquired || "",
    challengesFaced: entry?.challengesFaced || "",
  });

  if (!entry) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <p className="text-muted-foreground">Entry not found.</p>
        <Link href="/logbook" className="text-primary hover:underline mt-2 inline-block">Back to logbook</Link>
      </div>
    );
  }

  const canEdit = user?.id === entry.studentId && (entry.status === "draft" || entry.status === "rejected");

  const handleSave = (status: "draft" | "pending") => {
    setSaving(true);
    setTimeout(() => {
      updateLogEntry(entry.id, { ...editForm, status });
      setSaving(false);
      navigate(`/log/${entry.id}`);
    }, 600);
  };

  if (editMode && canEdit) {
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/log/${entry.id}`)} className="text-muted-foreground hover:text-foreground">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-foreground">Edit Log Entry</h1>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Activity Description</label>
            <textarea
              value={editForm.activityDescription}
              onChange={e => setEditForm(p => ({ ...p, activityDescription: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tools & Equipment</label>
            <textarea
              value={editForm.toolsEquipment}
              onChange={e => setEditForm(p => ({ ...p, toolsEquipment: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Skills Acquired</label>
            <textarea
              value={editForm.skillsAcquired}
              onChange={e => setEditForm(p => ({ ...p, skillsAcquired: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Challenges Faced</label>
            <textarea
              value={editForm.challengesFaced}
              onChange={e => setEditForm(p => ({ ...p, challengesFaced: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate(`/log/${entry.id}`)} className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-border text-foreground hover:bg-muted">Cancel</button>
          <button onClick={() => handleSave("draft")} disabled={saving} className="flex-1 px-5 py-2.5 rounded-lg text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50">Save Draft</button>
          <button onClick={() => handleSave("pending")} disabled={saving} className="flex-1 px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving ? "Saving..." : "Submit for Approval"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(user?.role === "student" ? "/logbook" : "/students")} className="text-muted-foreground hover:text-foreground">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground">Log Entry — Week {entry.weekNumber}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(entry.date)}</p>
        </div>
        <StatusBadge status={entry.status} />
      </div>

      {/* Supervisor feedback */}
      {entry.supervisorComment && (
        <div className={`rounded-xl p-4 flex gap-3 ${entry.status === "approved" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${entry.status === "approved" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
            {entry.status === "approved" ? "✓" : "✗"}
          </div>
          <div>
            <div className={`text-sm font-semibold ${entry.status === "approved" ? "text-green-800" : "text-red-800"}`}>
              Supervisor Feedback
            </div>
            <p className={`text-sm mt-0.5 ${entry.status === "approved" ? "text-green-700" : "text-red-700"}`}>{entry.supervisorComment}</p>
          </div>
        </div>
      )}

      {/* Content sections */}
      <div className="bg-card border border-card-border rounded-xl divide-y divide-border">
        <Section label="Activity Description" content={entry.activityDescription} />
        {entry.toolsEquipment && <Section label="Tools & Equipment Used" content={entry.toolsEquipment} />}
        {entry.skillsAcquired && <Section label="Skills Acquired" content={entry.skillsAcquired} />}
        {entry.challengesFaced && <Section label="Challenges Faced" content={entry.challengesFaced} />}
      </div>

      {/* Attachments */}
      {entry.evidenceFiles.length > 0 && (
        <div className="bg-card border border-card-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3 text-sm">Attachments ({entry.evidenceFiles.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {entry.evidenceFiles.map((f, i) => (
              <div key={i} className="border border-border rounded-lg overflow-hidden">
                {f.type === "image" && f.url ? (
                  <img src={f.url} alt={f.name} className="w-full h-24 object-cover" />
                ) : (
                  <div className="h-24 flex flex-col items-center justify-center bg-muted/30 gap-2">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="px-2 py-1.5">
                  <p className="text-xs font-medium text-foreground truncate">{f.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions for student */}
      {canEdit && (
        <div className="flex justify-end">
          <Link
            href={`/log/${entry.id}/edit`}
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Edit & Resubmit
          </Link>
        </div>
      )}
    </div>
  );
}

function Section({ label, content }: { label: string; content: string }) {
  return (
    <div className="p-5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{label}</h3>
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}
