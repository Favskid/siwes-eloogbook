import { Link } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import StatusBadge from "../components/StatusBadge";

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-white/60">SIWES Progress</span>
        <span className="font-semibold text-white">{pct}% Complete</span>
      </div>
      <div className="h-3 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-sidebar-primary rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-white/50 mt-1">
        <span>{value} weeks logged</span>
        <span>{max} weeks total</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: number | string; color: string; icon: React.ReactNode }) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const { getStudentEntries } = useData();

  const entries = user ? getStudentEntries(user.id) : [];
  const approved = entries.filter(e => e.status === "approved").length;
  const pending = entries.filter(e => e.status === "pending").length;
  const rejected = entries.filter(e => e.status === "rejected").length;
  const draft = entries.filter(e => e.status === "draft").length;

  const uniqueWeeks = new Set(entries.map(e => e.weekNumber)).size;
  const totalWeeks = 24;
  const recent = entries.slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Welcome banner */}
      <div className="bg-sidebar rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Welcome back, {user?.name.split(" ")[0]}!</h1>
            <p className="text-white/60 text-sm mt-1">{user?.department} • {user?.matricNumber}</p>
          </div>
          <Link
            href="/log/new"
            className="inline-flex items-center gap-2 bg-sidebar-primary text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-sidebar-primary/80 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Log Entry
          </Link>
        </div>
        <div className="mt-6">
          <ProgressBar value={uniqueWeeks} max={totalWeeks} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Entries"
          value={entries.length}
          color="bg-blue-100 text-blue-700"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard
          label="Approved"
          value={approved}
          color="bg-green-100 text-green-700"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
        />
        <StatCard
          label="Pending"
          value={pending}
          color="bg-yellow-100 text-yellow-700"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Rejected"
          value={rejected}
          color="bg-red-100 text-red-700"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
        />
      </div>

      {/* Recent entries */}
      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Log Entries</h2>
          <Link href="/logbook" className="text-sm text-primary hover:underline font-medium">View all</Link>
        </div>
        {recent.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">No log entries yet.</p>
            <Link href="/log/new" className="mt-2 inline-block text-sm text-primary hover:underline">Create your first entry</Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recent.map(entry => (
              <Link
                key={entry.id}
                href={`/log/${entry.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">Week {entry.weekNumber}</span>
                    <StatusBadge status={entry.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.activityDescription.slice(0, 80)}...</p>
                </div>
                <div className="text-xs text-muted-foreground shrink-0 text-right">
                  <div>{formatDate(entry.date)}</div>
                  {entry.evidenceFiles.length > 0 && (
                    <div className="mt-1 text-muted-foreground/70">{entry.evidenceFiles.length} file{entry.evidenceFiles.length > 1 ? "s" : ""}</div>
                  )}
                </div>
                <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick tips */}
      {draft > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-yellow-800">You have {draft} draft{draft > 1 ? "s" : ""} pending submission</p>
            <p className="text-xs text-yellow-700 mt-0.5">Don't forget to submit your drafts for supervisor review.</p>
            <Link href="/logbook" className="text-xs text-yellow-800 font-semibold hover:underline mt-1 inline-block">View drafts</Link>
          </div>
        </div>
      )}
      {rejected > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-800">{rejected} entr{rejected > 1 ? "ies" : "y"} rejected — please revise and resubmit</p>
            <p className="text-xs text-red-700 mt-0.5">Check the supervisor's feedback and update your entries.</p>
            <Link href="/logbook" className="text-xs text-red-800 font-semibold hover:underline mt-1 inline-block">Review now</Link>
          </div>
        </div>
      )}
    </div>
  );
}
