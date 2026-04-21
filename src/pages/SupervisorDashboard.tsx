import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { apiService, LogEntry, User } from "../services/api";
import StatusBadge from "../components/StatusBadge";
import { useError } from "../hooks/useError";
import ErrorAlert from "../components/ErrorAlert";

function formatDate(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function StudentProgressModal({ studentId, onClose }: { studentId: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const progress = await apiService.getStudentProgress(studentId);
        setData(progress);
      } catch (err) {
        console.error("Failed to fetch student progress:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [studentId]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground">Student Progress</h2>
            {data?.student && <p className="text-xs text-muted-foreground">{data.student.name} • {data.student.matric_number}</p>}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-10 text-center">
              <div className="w-8 h-8 border-3 border-muted border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading progress...</p>
            </div>
          ) : data ? (
            <>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Total", value: data?.stats?.total ?? 0, color: "text-foreground" },
                  { label: "Approved", value: data?.stats?.approved ?? 0, color: "text-green-600" },
                  { label: "Pending", value: data?.stats?.pending ?? 0, color: "text-yellow-600" },
                  { label: "Rejected", value: data?.stats?.rejected ?? 0, color: "text-red-600" },
                ].map(s => (
                  <div key={s.label} className="bg-muted/30 rounded-lg p-3 text-center border border-border/50">
                    <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-[10px] uppercase font-semibold text-muted-foreground mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Recent Entries</h3>
                <div className="space-y-3">
                  {data.recentEntries.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No entries yet.</p>
                  ) : (
                    data.recentEntries.map((e: LogEntry) => (
                      <div key={e.id} className="border border-border/60 rounded-lg p-3 bg-muted/10">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-foreground">Week {e.week_number}</span>
                          <StatusBadge status={e.status as any} />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{e.activity_description}</p>
                        <div className="text-[10px] text-muted-foreground/60 mt-2">{formatDate(e.date)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-sm text-muted-foreground">Failed to load data.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ApprovalModal({ entry, onApprove, onReject, onClose, isSubmitting }: {
  entry: LogEntry;
  onApprove: (comment: string) => void;
  onReject: (comment: string) => void;
  onClose: () => void;
  isSubmitting: boolean;
}) {
  const [comment, setComment] = useState("");

  const handleReject = () => {
    if (!comment.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    onReject(comment);
  };

  const handleApprove = () => {
    onApprove(comment);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">Review Entry — Week {entry.week_number}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Activity</div>
            <p className="text-sm text-foreground leading-relaxed line-clamp-4">{entry.activity_description}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Comment (optional for approval, required for rejection)</label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add feedback or comments for the student..."
              rows={3}
              disabled={isSubmitting}
              className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none disabled:opacity-50"
            />
          </div>
        </div>
        <div className="flex gap-3 p-5 pt-0">
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-sm border border-border text-foreground hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Reject"}
          </button>
          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [dashboard, setDashboard] = useState<any>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [assignedEntries, setAssignedEntries] = useState<LogEntry[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [reviewEntry, setReviewEntry] = useState<LogEntry | null>(null);
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);
  const [viewingProgress, setViewingProgress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { error, message, handleError, clearError } = useError();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      clearError();

      const [dashResponse, studentsData, entriesResponse] = await Promise.all([
        apiService.getSupervisorDashboard(),
        apiService.getAssignedStudents(),
        apiService.getAssignedEntries({ limit: 100 })
      ]);

      setDashboard(dashResponse.data);
      setStudents(studentsData);
      // Filter out drafts as supervisors should not see them
      setAssignedEntries((entriesResponse.data || []).filter(e => e.status !== "draft"));
    } catch (err: any) {
      console.error('Failed to fetch data:', err);
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (comment: string) => {
    if (!reviewEntry) return;
    try {
      setSubmitting(true);
      await apiService.approveEntry(reviewEntry.id, comment);
      setReviewEntry(null);
      await fetchData();
    } catch (err: any) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (comment: string) => {
    if (!reviewEntry) return;
    try {
      setSubmitting(true);
      await apiService.rejectEntry(reviewEntry.id, comment);
      setReviewEntry(null);
      await fetchData();
    } catch (err: any) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleBulkApprove = async () => {
    if (selectedEntryIds.length === 0) return;
    try {
      setSubmitting(true);
      await apiService.bulkApproveEntries(selectedEntryIds, "Bulk approved by supervisor");
      setSelectedEntryIds([]);
      await fetchData();
    } catch (err: any) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEntrySelection = (id: string) => {
    setSelectedEntryIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filter entries based on selected student
  const filteredEntries = selectedStudent 
    ? assignedEntries.filter(e => e.student_id === selectedStudent) 
    : assignedEntries;

  const toggleSelectAll = () => {
    const pendings = filteredEntries.filter(e => e.status === "pending").map(e => e.id);
    if (selectedEntryIds.length === pendings.length && pendings.length > 0) {
      setSelectedEntryIds([]);
    } else {
      setSelectedEntryIds(pendings);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground font-medium">Loading supervisor portal...</p>
        </div>
      </div>
    );
  }

  const stats = {
    assignedStudents: dashboard?.assignedStudentsCount || 0,
    totalEntries: dashboard?.stats?.total || 0,
    pendingCount: dashboard?.stats?.pending || 0,
    approved: dashboard?.stats?.approved || 0,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {reviewEntry && (
        <ApprovalModal
          entry={reviewEntry}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setReviewEntry(null)}
          isSubmitting={submitting}
        />
      )}

      {viewingProgress && (
        <StudentProgressModal
          studentId={viewingProgress}
          onClose={() => setViewingProgress(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Supervisor Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {user?.department || 'Faculty Dashboard'} • Welcome, {user?.name}
          </p>
        </div>
        <button 
          onClick={fetchData} 
          className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/5 rounded-full"
          title="Refresh Dashboard"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {error && <ErrorAlert message={message} onDismiss={clearError} />}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Assigned Students", value: stats.assignedStudents, icon: "👤" },
          { label: "Pending Reviews", value: stats.pendingCount, icon: "⏳" },
          { label: "Approved Entries", value: stats.approved, icon: "✅" },
          { label: "Total Submissions", value: stats.totalEntries, icon: "📊" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-card-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <span className="text-lg">{s.icon}</span>
            </div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Students list */}
        <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-border bg-muted/20">
            <h2 className="font-semibold text-foreground flex items-center gap-2 text-sm uppercase tracking-wide">
              <span>My Students</span>
              <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px]">{students.length}</span>
            </h2>
          </div>
          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            <button
              onClick={() => setSelectedStudent(null)}
              className={`w-full text-left px-5 py-3 text-xs uppercase tracking-widest font-bold transition-colors ${!selectedStudent ? "bg-primary/5 text-primary" : "hover:bg-muted/50 text-muted-foreground"}`}
            >
              All Submissions
            </button>
            {students.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground italic">
                No students assigned to you.
              </div>
            ) : (
              students.map(s => {
                const sPending = assignedEntries.filter(e => e.student_id === s.id && e.status === "pending").length;
                return (
                  <div key={s.id} className={`group flex items-center transition-colors ${selectedStudent === s.id ? "bg-primary/5 border-r-4 border-primary" : "hover:bg-muted/50"}`}>
                    <button
                      onClick={() => setSelectedStudent(s.id)}
                      className="flex-1 text-left px-5 py-3 flex items-center gap-3 min-w-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border">
                        <span className="text-[10px] font-bold text-secondary-foreground">{s.name.split(" ").map(n => n[0]).slice(0, 2).join("")}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{s.name}</div>
                          {s.supervisor_id === user?.id && (
                            <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate uppercase">{s.matric_number || 'No Matric'}</div>
                      </div>
                      {sPending > 0 && (
                        <span className="w-5 h-5 bg-yellow-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shrink-0">{sPending}</span>
                      )}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setViewingProgress(s.id); }}
                      className="pr-4 py-3 text-muted-foreground hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                      title="View Progress"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Entries */}
        <div className="lg:col-span-2 bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
          <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {filteredEntries.some(e => e.status === "pending") && (
                <input 
                  type="checkbox"
                  checked={selectedEntryIds.length > 0 && selectedEntryIds.length === filteredEntries.filter(e => e.status === "pending").length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
              )}
              <h2 className="font-semibold text-foreground text-sm uppercase tracking-wide">
                {selectedStudent ? `${students.find(s => s.id === selectedStudent)?.name}'s Submissions` : "Recent Activity"}
              </h2>
            </div>
            
            {selectedEntryIds.length > 0 && (
              <button
                onClick={handleBulkApprove}
                disabled={submitting}
                className="bg-primary text-primary-foreground px-4 py-1.5 rounded-lg text-xs font-bold hover:shadow-md transition-all flex items-center gap-2"
              >
                {submitting ? "Processing..." : `Approve Selected (${selectedEntryIds.length})`}
              </button>
            )}
          </div>
          
          {selectedStudent && (
            <div className="px-5 py-4 border-b border-border bg-primary/5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm">
                {students.find(s => s.id === selectedStudent)?.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-foreground">{students.find(s => s.id === selectedStudent)?.name}</h3>
                  <button 
                    onClick={() => setViewingProgress(selectedStudent)}
                    className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase hover:bg-primary/20 transition-colors"
                  >
                    View Progress
                  </button>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 font-medium">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-1 h-1 bg-muted-foreground/30 rounded-full"></span>
                    <span>{students.find(s => s.id === selectedStudent)?.matric_number || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-1 h-1 bg-muted-foreground/30 rounded-full"></span>
                    <span>{students.find(s => s.id === selectedStudent)?.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="w-1 h-1 bg-muted-foreground/30 rounded-full"></span>
                    <span>{students.find(s => s.id === selectedStudent)?.department}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="divide-y divide-border overflow-y-auto max-h-[500px] flex-1">
            {filteredEntries.length === 0 ? (
              <div className="p-20 text-center text-muted-foreground">
                <div className="text-4xl mb-3">📭</div>
                <p className="text-sm">No pending submissions found.</p>
              </div>
            ) : (
              filteredEntries.map(entry => {
                const student = students.find(s => s.id === entry.student_id);
                return (
                  <div key={entry.id} className={`px-5 py-4 hover:bg-muted/30 transition-colors ${selectedEntryIds.includes(entry.id) ? "bg-primary/5" : ""}`}>
                    <div className="flex items-start gap-4">
                      {entry.status === "pending" && (
                        <div className="pt-1">
                          <input 
                            type="checkbox"
                            checked={selectedEntryIds.includes(entry.id)}
                            onChange={() => toggleEntrySelection(entry.id)}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-sm font-bold text-foreground">Week {entry.week_number}</span>
                          <StatusBadge status={entry.status as any} />
                          <span className="text-[10px] text-muted-foreground uppercase font-medium">{formatDate(entry.date)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 italic">"{entry.activity_description}"</p>
                        {student && (
                          <div className="mt-2 text-[10px] font-semibold text-primary uppercase">Student: {student.name}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.status === "pending" && (
                          <button
                            onClick={() => setReviewEntry(entry)}
                            className="shrink-0 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:shadow-lg transition-all"
                          >
                            Review
                          </button>
                        )}
                        <button 
                         onClick={() => navigate(`/log/${entry.id}`)}
                         className="p-2 text-muted-foreground hover:text-foreground rounded-lg border border-border"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
