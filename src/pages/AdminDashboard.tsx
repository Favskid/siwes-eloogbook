import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { apiService, LogEntry, AdminDashboard as AdminDashboardData } from "../services/api";

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function AdminDashboard() {
  const [location, navigate] = useLocation();
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [recentEntries, setRecentEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch dashboard stats
      const dashResponse = await apiService.getAdminDashboard();
      setDashboard(dashResponse.data);

      // Fetch recent entries
      const entriesResponse = await apiService.getAllLogEntries({ page: 1, limit: 6 });
      setRecentEntries(entriesResponse.data || []);
    } catch (err: any) {
      console.error('Failed to fetch dashboard:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="font-semibold text-red-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-red-800 text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const stats = dashboard;
  const approvalRate = stats.logEntries.total > 0 ? Math.round((stats.logEntries.approved / stats.logEntries.total) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">System-wide monitoring and management</p>
        </div>
        <button onClick={fetchData} className="p-2 text-muted-foreground hover:text-primary transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: stats.users.students.toString(), sub: "Registered students", color: "bg-blue-100 text-blue-700", icon: "🎓" },
          { label: "Log Entries", value: stats.logEntries.total.toString(), sub: `${approvalRate}% approval rate`, color: "bg-green-100 text-green-700", icon: "📝" },
          { label: "Pending Review", value: stats.logEntries.pending.toString(), sub: "Awaiting action", color: "bg-yellow-100 text-yellow-700", icon: "⏳" },
          { label: "System Users", value: stats.users.total.toString(), sub: "Total accounts", color: "bg-purple-100 text-purple-700", icon: "👥" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-card-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-2">
              <span className="text-2xl">{s.icon}</span>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
            </div>
            <div className="text-sm font-semibold text-foreground">{s.label}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status breakdown */}
        <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-primary rounded-full" />
            Entry Status Distribution
          </h2>
          <div className="space-y-5">
            {[
              { label: "Approved", value: stats.logEntries.approved, total: stats.logEntries.total, color: "bg-green-500" },
              { label: "Pending", value: stats.logEntries.pending, total: stats.logEntries.total, color: "bg-yellow-500" },
              { label: "Rejected", value: stats.logEntries.rejected, total: stats.logEntries.total, color: "bg-red-500" },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-muted-foreground font-medium uppercase tracking-wider">{s.label}</span>
                  <span className="text-foreground font-bold">{s.value} ({stats.logEntries.total > 0 ? Math.round((s.value / s.total) * 100) : 0}%)</span>
                </div>
                <MiniBar value={s.value} max={Math.max(s.total, 1)} color={s.color} />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links / Actions */}
        <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-foreground mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-secondary rounded-full" />
            System Resources
          </h2>
          <div className="space-y-3">
            {[
              { label: "Pending Notifications", value: stats.notifications.total, icon: "🔔" },
              { label: "Uploaded Files", value: stats.files.total, icon: "📁" },
              { label: "Storage Used", value: `${(stats.files.totalSize / (1024 * 1024)).toFixed(1)} MB`, icon: "💾" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-4 bg-muted/20 border border-border/50 rounded-xl hover:bg-muted/30 transition-colors cursor-default">
                <span className="text-sm text-foreground flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  {item.label}
                </span>
                <span className="font-bold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent entries */}
      <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/10">
          <h2 className="font-semibold text-foreground text-sm uppercase tracking-widest">Recent System Activity</h2>
          <button onClick={() => navigate("/admin/users")} className="text-xs text-primary font-bold hover:underline">View All Users</button>
        </div>
        <div className="divide-y divide-border">
          {recentEntries.length > 0 ? (
            recentEntries.map(e => {
              const initials = "E";

              return (
                <div key={e.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                    <span className="text-sm font-bold">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">Week {e.week_number} Submission</p>
                    <p className="text-xs text-muted-foreground italic truncate">"{(e.activity_description || "No description").slice(0, 80)}..."</p>
                  </div>
                  <div className="shrink-0">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${getStatusColor(e.status)}`}>
                      {e.status}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-5 py-12 text-center">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-muted-foreground text-sm">No recent activity detected in the system.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
