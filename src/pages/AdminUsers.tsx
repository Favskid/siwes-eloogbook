import { useState } from "react";

const ALL_USERS = [
  { id: "s1", name: "Chioma Adaeze Okonkwo", email: "chioma@student.caritas.edu.ng", matric: "CSC/2021/001", dept: "Computer Science", role: "Student", status: "Active" },
  { id: "s2", name: "Emeka Chukwuemeka", email: "emeka@student.caritas.edu.ng", matric: "CSC/2021/002", dept: "Computer Science", role: "Student", status: "Active" },
  { id: "s3", name: "Ngozi Ifeanyi", email: "ngozi@student.caritas.edu.ng", matric: "EEE/2021/003", dept: "Electrical Engineering", role: "Student", status: "Active" },
  { id: "s4", name: "Chukwudi Obi", email: "chukwudi@student.caritas.edu.ng", matric: "CSC/2021/004", dept: "Computer Science", role: "Student", status: "Active" },
  { id: "s5", name: "Amaka Nwosu", email: "amaka@student.caritas.edu.ng", matric: "MCH/2021/005", dept: "Mechanical Engineering", role: "Student", status: "Inactive" },
  { id: "is1", name: "Mr. Babatunde Adeyemi", email: "supervisor@techcorp.com", matric: "—", dept: "Engineering", role: "Industry Supervisor", status: "Active" },
  { id: "ss1", name: "Dr. Patience Eze", email: "patience@caritas.edu.ng", matric: "—", dept: "Computer Science", role: "School Supervisor", status: "Active" },
  { id: "ss2", name: "Dr. Kingsley Okonkwo", email: "kingsley@caritas.edu.ng", matric: "—", dept: "Electrical Engineering", role: "School Supervisor", status: "Active" },
  { id: "a1", name: "Prof. Emmanuel Okafor", email: "admin@caritas.edu.ng", matric: "—", dept: "Administration", role: "Admin", status: "Active" },
];

const ROLE_FILTERS = ["All", "Student", "Industry Supervisor", "School Supervisor", "Admin"];

function roleColor(role: string) {
  switch (role) {
    case "Student": return "bg-blue-100 text-blue-700";
    case "Industry Supervisor": return "bg-green-100 text-green-700";
    case "School Supervisor": return "bg-purple-100 text-purple-700";
    case "Admin": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const filtered = ALL_USERS.filter(u => {
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.matric.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">All Users</h1>
        <p className="text-sm text-muted-foreground">{ALL_USERS.length} registered users</p>
      </div>

      <div className="bg-card border border-card-border rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {ROLE_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setRoleFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  roleFilter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_1fr_120px_160px_80px_80px] gap-4 px-5 py-3 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <div>Name</div>
          <div>Email</div>
          <div>Matric</div>
          <div>Department</div>
          <div>Role</div>
          <div>Status</div>
        </div>
        <div className="divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No users found</div>
          ) : (
            filtered.map(u => (
              <div key={u.id} className="grid md:grid-cols-[1fr_1fr_120px_160px_80px_80px] gap-2 md:gap-4 px-5 py-3.5 items-center hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">{u.name.split(" ").map(n => n[0]).slice(0, 2).join("")}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{u.name}</span>
                </div>
                <div className="text-sm text-muted-foreground truncate">{u.email}</div>
                <div className="text-sm text-muted-foreground">{u.matric}</div>
                <div className="text-sm text-foreground truncate">{u.dept}</div>
                <div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${roleColor(u.role)}`}>{u.role.split(" ")[0]}</span>
                </div>
                <div>
                  <span className={`text-xs font-medium ${u.status === "Active" ? "text-green-600" : "text-muted-foreground"}`}>
                    {u.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
