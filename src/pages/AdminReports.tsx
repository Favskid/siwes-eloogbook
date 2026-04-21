import { useState, useEffect } from "react";
import { apiService, AdminDashboard } from "../services/api";
import { useError } from "../hooks/useError";
import ErrorAlert from "../components/ErrorAlert";

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.max(Math.round((value / max) * 100), 2);
  return (
    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function AdminReports() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { error, message, handleError, clearError } = useError();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAdminDashboard();
        setDashboard(response.data);
      } catch (err: any) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await apiService.exportEntriesAsCSV();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `siwes_logbook_export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      handleError(err);
    } finally {
      setExporting(false);
    }
  };

  const handlePurge = async () => {
    if (!confirm("Are you sure? This will PERMANENTLY delete entries older than 365 days that were already soft-deleted.")) return;
    try {
      setPurging(true);
      const res = await apiService.purgeOldEntries();
      alert(res.message);
    } catch (err: any) {
      handleError(err);
    } finally {
      setPurging(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center">
        <div className="w-10 h-10 border-3 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Generating analytical report...</p>
      </div>
    );
  }

  const stats = dashboard!;
  const approvalRate = stats.logEntries.total > 0 ? Math.round((stats.logEntries.approved / stats.logEntries.total) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics & Controls</h1>
          <p className="text-sm text-muted-foreground">System health and data management</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2.5 bg-background border border-border text-foreground rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-muted transition-colors disabled:opacity-50"
          >
            {exporting ? "Preparing..." : "Export CSV"}
            {!exporting && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={message} onDismiss={clearError} />}

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Completion Rate", value: `${approvalRate}%`, sub: "Approved entries", icon: "📈", color: "text-green-600" },
          { label: "Active Submissions", value: stats.logEntries.total, sub: "Total log records", icon: "📑", color: "text-blue-600" },
          { label: "Storage Load", value: `${(stats.files.totalSize / (1024 * 1024)).toFixed(2)} MB`, sub: "Files in vault", icon: "💾", color: "text-purple-600" },
          { label: "File Count", value: stats.files.total, sub: "Attached media", icon: "📁", color: "text-orange-600" },
        ].map(k => (
          <div key={k.label} className="bg-card border border-card-border rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className={`text-2xl font-bold ${k.color}`}>{k.value}</span>
              <span className="text-xl">{k.icon}</span>
            </div>
            <div className="text-xs font-bold text-foreground uppercase tracking-wider">{k.label}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status chart */}
        <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-foreground mb-6 uppercase tracking-widest text-xs">Submission Health</h2>
          <div className="space-y-6">
            {[
              { label: "Approved", count: stats.logEntries.approved, color: "bg-green-500", total: stats.logEntries.total },
              { label: "Pending Review", count: stats.logEntries.pending, color: "bg-yellow-500", total: stats.logEntries.total },
              { label: "Rejected/Revisions", count: stats.logEntries.rejected, color: "bg-red-500", total: stats.logEntries.total },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-foreground">{item.label}</span>
                  <span className="text-xs text-muted-foreground font-bold">{item.count} records</span>
                </div>
                <MiniBar value={item.count} max={Math.max(item.total, 1)} color={item.color} />
              </div>
            ))}
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm border-red-500/20">
          <h2 className="font-bold text-red-600 mb-6 uppercase tracking-widest text-xs flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Danger Zone
          </h2>
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl space-y-4">
            <div>
              <h3 className="text-sm font-bold text-red-700">Purge Archival Data</h3>
              <p className="text-xs text-red-600/80 mt-1 leading-relaxed">
                Permanently remove entries and associated files that are older than <strong>365 days</strong>. This action only affects records that have already been soft-deleted.
              </p>
            </div>
            <button
              onClick={handlePurge}
              disabled={purging}
              className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {purging ? "Purging..." : "Purge 1-Year Old Data"}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-4 text-center">
            System logs will record all purge actions for audit purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
