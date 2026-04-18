import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { apiService, LogEntry } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import { useError } from "../hooks/useError";
import ErrorAlert from "../components/ErrorAlert";

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

interface Props {
  entryId: string;
  editMode?: boolean;
}

export default function LogEntryDetail({ entryId, editMode }: Props) {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [entry, setEntry] = useState<LogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { error, message, handleError, clearError } = useError();

  const [editForm, setEditForm] = useState({
    activity_description: "",
    tools_equipment: "",
    skills_acquired: "",
    challenges_faced: "",
  });

  useEffect(() => {
    fetchEntry();
  }, [entryId]);

  const fetchEntry = async () => {
    try {
      setLoading(true);
      const data = await apiService.getLogEntry(entryId);
      setEntry(data);
      setEditForm({
        activity_description: data.activity_description || "",
        tools_equipment: data.tools_equipment || "",
        skills_acquired: data.skills_acquired || "",
        challenges_faced: data.challenges_faced || "",
      });
    } catch (err: any) {
      console.error('Failed to fetch entry:', err);
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground">Loading entry details...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <ErrorAlert message={message || "Entry not found."} onDismiss={clearError} />
        <Link href="/logbook" className="text-primary hover:underline mt-4 inline-block font-medium">Back to logbook</Link>
      </div>
    );
  }

  // Pending entries are also editable according to user feedback
  const canEdit = user?.id === entry.student_id && 
    (entry.status === "draft" || entry.status === "rejected" || entry.status === "pending");

  const handleSave = async (status: "draft" | "pending") => {
    setSaving(true);
    clearError();
    try {
      // 1. Update the entry - Include date and week_number as they are likely required for destructuring on backend
      await apiService.updateLogEntry(entry.id, {
        ...editForm,
        date: entry.date,
        week_number: entry.week_number
      });
      
      // 2. If submitting, call the submit endpoint
      if (status === "pending" && entry.status !== "pending") {
        await apiService.submitLogEntry(entry.id);
      }
      
      navigate(`/log/${entry.id}`);
      fetchEntry(); // Refresh data
    } catch (err: any) {
      handleError(err);
    } finally {
      setSaving(false);
    }
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

        {error && <ErrorAlert message={message} onDismiss={clearError} />}

        <div className="bg-card border border-card-border rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Activity Description</label>
            <textarea
              value={editForm.activity_description}
              onChange={e => setEditForm(p => ({ ...p, activity_description: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Tools & Equipment</label>
            <textarea
              value={editForm.tools_equipment}
              onChange={e => setEditForm(p => ({ ...p, tools_equipment: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Skills Acquired</label>
            <textarea
              value={editForm.skills_acquired}
              onChange={e => setEditForm(p => ({ ...p, skills_acquired: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Challenges Faced</label>
            <textarea
              value={editForm.challenges_faced}
              onChange={e => setEditForm(p => ({ ...p, challenges_faced: e.target.value }))}
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
          <h1 className="text-xl font-bold text-foreground">Log Entry — Week {entry.week_number}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(entry.date)}</p>
        </div>
        <StatusBadge status={entry.status as any} />
      </div>

      {/* Supervisor feedback */}
      {entry.supervisor_comment && (
        <div className={`rounded-xl p-4 flex gap-3 ${entry.status === "approved" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${entry.status === "approved" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
            {entry.status === "approved" ? "✓" : "✗"}
          </div>
          <div>
            <div className={`text-sm font-semibold ${entry.status === "approved" ? "text-green-800" : "text-red-800"}`}>
              Supervisor Feedback
            </div>
            <p className={`text-sm mt-0.5 ${entry.status === "approved" ? "text-green-700" : "text-red-700"}`}>{entry.supervisor_comment}</p>
          </div>
        </div>
      )}

      {/* Content sections */}
      <div className="bg-card border border-card-border rounded-xl divide-y divide-border">
        <Section label="Activity Description" content={entry.activity_description} />
        {entry.tools_equipment && <Section label="Tools & Equipment Used" content={entry.tools_equipment} />}
        {entry.skills_acquired && <Section label="Skills Acquired" content={entry.skills_acquired} />}
        {entry.challenges_faced && <Section label="Challenges Faced" content={entry.challenges_faced} />}
      </div>

      {/* Attachments */}
      {entry.files && entry.files.length > 0 && (
        <div className="bg-card border border-card-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3 text-sm">Attachments ({entry.files.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {entry.files.map((f, i) => (
              <div key={i} className="border border-border rounded-lg overflow-hidden">
                {f.file_type?.startsWith("image") ? (
                  <img src={f.url} alt={f.original_name} className="w-full h-24 object-cover" />
                ) : (
                  <div className="h-24 flex flex-col items-center justify-center bg-muted/30 gap-2">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[10px] text-muted-foreground px-2 text-center truncate w-full">{f.original_name}</span>
                  </div>
                )}
                <div className="px-2 py-1.5 flex justify-between items-center">
                  <p className="text-xs font-medium text-foreground truncate max-w-[80px]">{f.original_name}</p>
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline">Download</a>
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

      {/* Review Section for Supervisor */}
      {user?.role === "supervisor" && entry.status === "pending" && (
        <SupervisorReviewSection entryId={entry.id} onComplete={fetchEntry} />
      )}
    </div>
  );
}

function SupervisorReviewSection({ entryId, onComplete }: { entryId: string; onComplete: () => void }) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { error, message, handleError, clearError } = useError();

  const handleAction = async (action: "approve" | "reject") => {
    if (action === "reject" && !comment.trim()) {
      handleError(new Error("Please provide a reason for rejection in the comment field."));
      return;
    }

    try {
      setSubmitting(true);
      clearError();
      if (action === "approve") {
        await apiService.approveEntry(entryId, comment);
      } else {
        await apiService.rejectEntry(entryId, comment);
      }
      onComplete();
    } catch (err: any) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-card border-2 border-primary/20 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-base">⚖️</span>
        Review this Submission
      </h3>
      
      {error && <div className="mb-4"><ErrorAlert message={message} onDismiss={clearError} /></div>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1.5">
            Supervisor's Feedback
            {comment.trim() === "" && <span className="text-red-500 ml-1 italic text-xs font-normal">(Required for rejection)</span>}
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Provide feedback to the student about this entry..."
            rows={4}
            disabled={submitting}
            className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => handleAction("reject")}
            disabled={submitting}
            className="flex-1 px-6 py-3 rounded-xl text-sm font-bold bg-muted text-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-transparent transition-all disabled:opacity-50"
          >
            {submitting ? "Processing..." : "Reject Entry"}
          </button>
          <button
            onClick={() => handleAction("approve")}
            disabled={submitting}
            className="flex-1 px-6 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {submitting ? "Processing..." : "Approve Entry"}
          </button>
        </div>
      </div>
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
