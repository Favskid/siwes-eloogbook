import { useState, FormEvent } from "react";
import { Link, useLocation } from "wouter";
import { useAuth, Role } from "../context/AuthContext";

const ROLES: { value: Role; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "industry_supervisor", label: "Industry Supervisor" },
  { value: "school_supervisor", label: "School Supervisor" },
  { value: "admin", label: "Administrator" },
];

export default function Register() {
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    matricNumber: "",
    department: "",
    company: "",
    password: "",
    confirmPassword: "",
    role: "student" as Role,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = register({
        name: form.name,
        email: form.email,
        matricNumber: form.matricNumber,
        department: form.department,
        password: form.password,
        role: form.role,
        company: form.company,
      });
      setLoading(false);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.error || "Registration failed");
      }
    }, 600);
  };

  const departments = ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Chemical Engineering", "Mass Communication", "Business Administration", "Accounting", "Law", "Medicine"];

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex w-2/5 bg-sidebar flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-white">SIWES E-Logbook</div>
            <div className="text-xs text-white/50">Caritas University</div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Join the SIWES Platform</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Create your account to start tracking your industrial training experience and connecting with your supervisors.
          </p>
        </div>

        <div className="text-white/30 text-xs">© 2024 Caritas University</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <div className="lg:hidden flex items-center gap-3 mb-6 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div className="font-bold">SIWES E-Logbook</div>
              <div className="text-xs text-muted-foreground">Caritas University</div>
            </div>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Create account</h1>
            <p className="text-muted-foreground text-sm mt-1">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set("name", e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                <select
                  value={form.role}
                  onChange={e => set("role", e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              {form.role === "student" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Matric Number</label>
                  <input
                    type="text"
                    value={form.matricNumber}
                    onChange={e => set("matricNumber", e.target.value)}
                    placeholder="e.g. CSC/2021/001"
                    className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}
              {form.role === "industry_supervisor" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Company/Organization</label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={e => set("company", e.target.value)}
                    placeholder="Your company name"
                    className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              )}
              <div className={form.role === "student" || form.role === "industry_supervisor" ? "" : "col-span-2"}>
                <label className="block text-sm font-medium text-foreground mb-1.5">Department</label>
                <select
                  value={form.department}
                  onChange={e => set("department", e.target.value)}
                  className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => set("password", e.target.value)}
                  placeholder="Create a password"
                  className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => set("confirmPassword", e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </>
              ) : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
