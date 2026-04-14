import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useData, LogEntry } from "../context/DataContext";
import StatusBadge from "../components/StatusBadge";

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

const STUDENTS = [
  { id: "s1", name: "Chioma Adaeze Okonkwo", matric: "CSC/2021/001", dept: "Computer Science" },
  { id: "s2", name: "Emeka Chukwuemeka", matric: "CSC/2021/002", dept: "Computer Science" },
  { id: "s3", name: "Ngozi Ifeanyi", matric: "EEE/2021/003", dept: "Electrical Engineering" },
];

function ApprovalModal({ entry, onApprove, onReject, onClose }: {
  entry: LogEntry;
  onApprove: (comment: string) => void;
  onReject: (comment: string) => void;
  onClose: () => void;
}) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handle = (fn: (c: string) => void) => {
    setSubmitting(true);
    setTimeout(() => { fn(comment); setSubmitting(false); onClose(); }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">Review Entry — Week {entry.weekNumber}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Activity</div>
            <p className="text-sm text-foreground leading-relaxed line-clamp-4">{entry.activityDescription}</p>
          </div>
          {entry.skillsAcquired && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Skills Acquired</div>
              <p className="text-sm text-foreground">{entry.skillsAcquired}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Comment (optional for approval, required for rejection)</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add feedback or comments for the student..."
              rows={3}
              className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 p-5 pt-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-border text-foreground hover:bg-muted">Cancel</button>
          <button
            onClick={() => handle(c => onReject(c || "Please revise and resubmit."))}
            disabled={submitting}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
          >
            Reject
          </button>
          <button
            onClick={() => handle(onApprove)}
            disabled={submitting}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const { logEntries, approveEntry, rejectEntry } = useData();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [reviewEntry, setReviewEntry] = useState<LogEntry | null>(null);

  const pending = logEntries.filter(e => e.status === "pending");
  const allEntries = selectedStudent ? logEntries.filter(e => e.studentId === selectedStudent) : logEntries;
  const student = selectedStudent ? STUDENTS.find(s => s.id === selectedStudent) : null;

  const stats = {
    total: STUDENTS.length,
    pendingCount: pending.length,
    approved: logEntries.filter(e => e.status === "approved").length,
    entries: logEntries.length,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {reviewEntry && (
        <ApprovalModal
          entry={reviewEntry}
          onApprove={(c) => approveEntry(reviewEntry.id, c, user?.name)}
          onReject={(c) => rejectEntry(reviewEntry.id, c, user?.name)}
          onClose={() => setReviewEntry(null)}
        />
      )}

      <div>
        <h1 className="text-xl font-bold text-foreground">Supervisor Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {user?.role === "industry_supervisor" ? user.company : "Caritas University"} • {user?.name}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Assigned Students", value: stats.total, color: "bg-blue-100 text-blue-700" },
          { label: "Pending Reviews", value: stats.pendingCount, color: "bg-yellow-100 text-yellow-700" },
          { label: "Approved Entries", value: stats.approved, color: "bg-green-100 text-green-700" },
          { label: "Total Entries", value: stats.entries, color: "bg-purple-100 text-purple-700" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-card-border rounded-xl p-5">
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Students list */}
        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">My Students</h2>
          </div>
          <div className="divide-y divide-border">
            <button
              onClick={() => setSelectedStudent(null)}
              className={`w-full text-left px-5 py-3 text-sm transition-colors ${!selectedStudent ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-foreground"}`}
            >
              All Students
            </button>
            {STUDENTS.map(s => {
              const sEntries = logEntries.filter(e => e.studentId === s.id);
              const sPending = sEntries.filter(e => e.status === "pending").length;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudent(s.id)}
                  className={`w-full text-left px-5 py-3 transition-colors ${selectedStudent === s.id ? "bg-primary/10" : "hover:bg-muted/50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">{s.name.split(" ").map(n => n[0]).slice(0, 2).join("")}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{s.name.split(" ")[0]} {s.name.split(" ")[1]}</div>
                      <div className="text-xs text-muted-foreground truncate">{s.matric}</div>
                    </div>
                    {sPending > 0 && (
                      <span className="w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center font-bold shrink-0">{sPending}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Entries */}
        <div className="lg:col-span-2 bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">
              {student ? `${student.name}'s Entries` : "All Log Entries"}
            </h2>
          </div>
          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            {allEntries.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-sm">No entries found</div>
            ) : (
              allEntries.map(entry => (
                <div key={entry.id} className="px-5 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-medium text-foreground">Week {entry.weekNumber}</span>
                        <StatusBadge status={entry.status} />
                        <span className="text-xs text-muted-foreground">{formatDate(entry.date)}</span>
                      </div>
                      {!selectedStudent && (
                        <div className="text-xs text-muted-foreground mb-1">{entry.studentName}</div>
                      )}
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{entry.activityDescription}</p>
                    </div>
                    {entry.status === "pending" && (
                      <button
                        onClick={() => setReviewEntry(entry)}
                        className="shrink-0 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Review
                      </button>
                    )}
                    {entry.status === "approved" && (
                      <span className="shrink-0 text-green-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                    )}
                  </div>
                  {entry.supervisorComment && (
                    <div className="mt-2 text-xs text-muted-foreground bg-muted/30 rounded px-3 py-2 italic">
                      Your comment: "{entry.supervisorComment}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
