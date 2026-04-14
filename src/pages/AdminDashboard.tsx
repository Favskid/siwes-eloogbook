import { useData } from "../context/DataContext";

const DEPARTMENTS = [
  { name: "Computer Science", students: 24, entries: 156 },
  { name: "Electrical Engineering", students: 18, entries: 112 },
  { name: "Mechanical Engineering", students: 15, entries: 89 },
  { name: "Civil Engineering", students: 12, entries: 67 },
  { name: "Chemical Engineering", students: 10, entries: 54 },
  { name: "Mass Communication", students: 8, entries: 45 },
];

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function AdminDashboard() {
  const { logEntries } = useData();

  const total = logEntries.length;
  const approved = logEntries.filter(e => e.status === "approved").length;
  const pending = logEntries.filter(e => e.status === "pending").length;
  const rejected = logEntries.filter(e => e.status === "rejected").length;
  const draft = logEntries.filter(e => e.status === "draft").length;

  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
  const maxEntries = Math.max(...DEPARTMENTS.map(d => d.entries));

  const recentEntries = logEntries.slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">SIWES E-Logbook System Overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: "87", sub: "Active this session", color: "bg-blue-100 text-blue-700" },
          { label: "Log Entries", value: total.toString(), sub: `${approvalRate}% approved`, color: "bg-green-100 text-green-700" },
          { label: "Pending Review", value: pending.toString(), sub: "Awaiting approval", color: "bg-yellow-100 text-yellow-700" },
          { label: "Departments", value: DEPARTMENTS.length.toString(), sub: "Participating", color: "bg-purple-100 text-purple-700" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-card-border rounded-xl p-5">
            <div className="text-2xl font-bold text-foreground">{s.value}</div>
            <div className="text-sm font-medium text-foreground mt-1">{s.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Status breakdown */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Entry Status Breakdown</h2>
          <div className="space-y-4">
            {[
              { label: "Approved", value: approved, total, color: "bg-green-500" },
              { label: "Pending", value: pending, total, color: "bg-yellow-500" },
              { label: "Rejected", value: rejected, total, color: "bg-red-500" },
              { label: "Draft", value: draft, total, color: "bg-gray-400" },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-foreground font-medium">{s.label}</span>
                  <span className="text-muted-foreground">{s.value} ({total > 0 ? Math.round((s.value / s.total) * 100) : 0}%)</span>
                </div>
                <MiniBar value={s.value} max={Math.max(s.total, 1)} color={s.color} />
              </div>
            ))}
          </div>
        </div>

        {/* Department breakdown */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Entries by Department</h2>
          <div className="space-y-3">
            {DEPARTMENTS.map(d => (
              <div key={d.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-foreground truncate max-w-[180px]">{d.name}</span>
                  <span className="text-muted-foreground shrink-0">{d.entries} entries</span>
                </div>
                <MiniBar value={d.entries} max={maxEntries} color="bg-primary" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent entries */}
      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Activity</h2>
        </div>
        <div className="divide-y divide-border">
          {recentEntries.map(e => (
            <div key={e.id} className="flex items-center gap-4 px-5 py-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{e.studentName.split(" ").map(n => n[0]).slice(0, 2).join("")}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{e.studentName}</p>
                <p className="text-xs text-muted-foreground">Week {e.weekNumber} — {e.activityDescription.slice(0, 50)}...</p>
              </div>
              <div className="shrink-0">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  e.status === "approved" ? "status-approved" : e.status === "pending" ? "status-pending" : e.status === "rejected" ? "status-rejected" : "status-draft"
                }`}>
                  {e.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
