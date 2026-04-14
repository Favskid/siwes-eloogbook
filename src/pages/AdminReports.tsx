import { useData } from "../context/DataContext";

const WEEKS = Array.from({ length: 12 }, (_, i) => ({
  week: i + 1,
  submissions: Math.floor(Math.random() * 15) + 5,
  approved: Math.floor(Math.random() * 12) + 3,
}));

function Bar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-end gap-1 flex-col items-center">
      <div className="w-full flex-1 flex items-end" style={{ minHeight: "100px" }}>
        <div
          className={`w-full rounded-t transition-all ${color}`}
          style={{ height: `${Math.max(pct, 4)}%` }}
          title={`${label}: ${value}`}
        />
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export default function AdminReports() {
  const { logEntries } = useData();

  const approved = logEntries.filter(e => e.status === "approved").length;
  const pending = logEntries.filter(e => e.status === "pending").length;
  const rejected = logEntries.filter(e => e.status === "rejected").length;
  const total = logEntries.length;
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;

  const maxSub = Math.max(...WEEKS.map(w => w.submissions));

  const byDept = [
    { dept: "Computer Science", students: 24, entries: 156, approved: 134, pending: 12, rejected: 10 },
    { dept: "Electrical Engineering", students: 18, entries: 112, approved: 98, pending: 8, rejected: 6 },
    { dept: "Mechanical Engineering", students: 15, entries: 89, approved: 75, pending: 7, rejected: 7 },
    { dept: "Civil Engineering", students: 12, entries: 67, approved: 55, pending: 5, rejected: 7 },
    { dept: "Chemical Engineering", students: 10, entries: 54, approved: 47, pending: 4, rejected: 3 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground">SIWES Session 2024 Performance Overview</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Submissions", value: "523", change: "+12% this week" },
          { label: "Approval Rate", value: `${approvalRate}%`, change: "Across all depts" },
          { label: "Active Students", value: "87", change: "6 departments" },
          { label: "Avg Entries/Student", value: "6.0", change: "Per month" },
        ].map(k => (
          <div key={k.label} className="bg-card border border-card-border rounded-xl p-5">
            <div className="text-2xl font-bold text-foreground">{k.value}</div>
            <div className="text-sm font-medium text-foreground mt-1">{k.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{k.change}</div>
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      <div className="bg-card border border-card-border rounded-xl p-5">
        <h2 className="font-semibold text-foreground mb-1">Weekly Submissions</h2>
        <p className="text-xs text-muted-foreground mb-6">Log entries submitted per week this session</p>
        <div className="h-32 flex items-end gap-1.5">
          {WEEKS.map(w => (
            <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-0.5" style={{ height: "100px" }}>
                <div
                  className="flex-1 bg-primary/30 rounded-t"
                  style={{ height: `${Math.round((w.submissions / maxSub) * 100)}%` }}
                  title={`Submissions: ${w.submissions}`}
                />
                <div
                  className="flex-1 bg-primary rounded-t"
                  style={{ height: `${Math.round((w.approved / maxSub) * 100)}%` }}
                  title={`Approved: ${w.approved}`}
                />
              </div>
              <span className="text-xs text-muted-foreground">W{w.week}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-primary/30" /><span className="text-xs text-muted-foreground">Submitted</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-primary" /><span className="text-xs text-muted-foreground">Approved</span></div>
        </div>
      </div>

      {/* Dept table */}
      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Department Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Department", "Students", "Total Entries", "Approved", "Pending", "Rejected", "Approval Rate"].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {byDept.map(d => {
                const rate = Math.round((d.approved / d.entries) * 100);
                return (
                  <tr key={d.dept} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-foreground">{d.dept}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{d.students}</td>
                    <td className="px-5 py-3.5 text-sm text-foreground">{d.entries}</td>
                    <td className="px-5 py-3.5 text-sm text-green-600 font-medium">{d.approved}</td>
                    <td className="px-5 py-3.5 text-sm text-yellow-600 font-medium">{d.pending}</td>
                    <td className="px-5 py-3.5 text-sm text-red-600 font-medium">{d.rejected}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[80px]">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${rate}%` }} />
                        </div>
                        <span className="text-sm font-semibold text-foreground">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
