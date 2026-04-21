import { useState, useEffect } from "react";
import { apiService, User } from "../services/api";
import { useError } from "../hooks/useError";
import ErrorAlert from "../components/ErrorAlert";

function roleColor(role: string) {
  switch (role) {
    case "student": return "bg-blue-100 text-blue-700";
    case "supervisor": return "bg-purple-100 text-purple-700";
    case "admin": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
}


export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { error, message, handleError, clearError } = useError();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      clearError();
      const response = await apiService.listUsers({ page: 1, limit: 1000 });
      setUsers(response.data || []);
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const searchLower = search.toLowerCase();
    const matchSearch = !search || 
      u.name.toLowerCase().includes(searchLower) || 
      u.email.toLowerCase().includes(searchLower) || 
      (u.matric_number && u.matric_number.toLowerCase().includes(searchLower));
    return matchRole && matchSearch;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-20 text-center">
        <div className="w-10 h-10 border-3 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">{users.length} registered accounts</p>
        </div>
      </div>

      {error && <ErrorAlert message={message} onDismiss={clearError} />}

      <div className="bg-card border border-card-border rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              id="user-search"
              name="search"
              placeholder="Search by name, email or matric..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="flex gap-2">
            {["all", "student", "supervisor", "admin"].map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  roleFilter === role ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                }`}
              >
                {role}s
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-[1.5fr_1.5fr_1fr_1fr_120px] gap-4 px-6 py-4 border-b border-border bg-muted/20 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <div>User Info</div>
          <div>Contact</div>
          <div>Department</div>
          <div>Identification</div>
          <div className="text-right">Access</div>
        </div>
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-sm">No users found matching your criteria.</p>
            </div>
          ) : (
            filtered.map(u => (
              <div key={u.id} className="grid md:grid-cols-[1.5fr_1.5fr_1fr_1fr_120px] gap-4 px-6 py-4 items-center hover:bg-muted/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 font-bold text-sm">
                    {u.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">{u.name}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">Member since {new Date(u.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="text-sm text-foreground truncate">{u.email}</div>
                <div className="text-sm text-muted-foreground truncate">{u.department || "—"}</div>
                <div className="text-sm text-foreground font-mono">{u.matric_number || "—"}</div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight ${roleColor(u.role)}`}>
                    {u.role}
                  </span>
                  {u.is_deleted && (
                    <span className="inline-flex px-2 py-0.5 rounded-md text-[8px] font-bold uppercase bg-red-500 text-white animate-pulse">
                      Deleted
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
