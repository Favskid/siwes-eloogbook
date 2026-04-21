import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import { useError } from "../hooks/useError";
import ErrorAlert from "../components/ErrorAlert";

interface Department {
  id: string;
  name: string;
  code: string;
  supervisor_id?: string;
}

export default function AdminDepartments() {
  const [depts, setDepts] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", supervisor_id: "" });
  const [submitting, setSubmitting] = useState(false);
  const { error, message, handleError, clearError } = useError();

  useEffect(() => {
    fetchDepts();
  }, []);

  const fetchDepts = async () => {
    try {
      setLoading(true);
      clearError();
      const response = await apiService.listDepartments();
      setDepts(response.data || []);
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      clearError();
      await apiService.createDepartment(form);
      setIsModalOpen(false);
      setForm({ name: "", code: "", supervisor_id: "" });
      fetchDepts();
    } catch (err: any) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
      await apiService.deleteDepartment(id);
      fetchDepts();
    } catch (err: any) {
      handleError(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="w-10 h-10 border-3 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground font-medium">Loading departments...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Departments</h1>
          <p className="text-sm text-muted-foreground">Manage academic departments and assignments</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20"
        >
          Add Department
        </button>
      </div>

      {error && <ErrorAlert message={message} onDismiss={clearError} />}

      <div className="grid sm:grid-cols-2 gap-4">
        {depts.map(d => (
          <div key={d.id} className="bg-card border border-card-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{d.code}</div>
                <h3 className="text-lg font-bold text-foreground mb-4">{d.name}</h3>
              </div>
              <button 
                onClick={() => handleDelete(d.id)}
                className="p-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Active System Resource
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="p-6 border-b border-border">
              <h2 className="font-bold text-foreground">New Department</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Full Name</label>
                <input
                  required
                  placeholder="e.g. Computer Science"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Code</label>
                <input
                  required
                  placeholder="e.g. CSC"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-bold">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold disabled:opacity-50">
                  {submitting ? "Saving..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
