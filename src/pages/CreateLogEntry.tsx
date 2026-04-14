import { useState, useRef, FormEvent } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";

function today() {
  return new Date().toISOString().split("T")[0];
}

function currentWeek() {
  const start = new Date(new Date().getFullYear(), 0, 1);
  const diff = new Date().getTime() - start.getTime();
  return Math.ceil(diff / (7 * 86400000));
}

type FilePreview = {
  name: string;
  type: "image" | "pdf" | "file";
  url?: string;
  size: string;
};

export default function CreateLogEntry() {
  const { user } = useAuth();
  const { addLogEntry } = useData();
  const [, navigate] = useLocation();

  const [form, setForm] = useState({
    date: today(),
    weekNumber: currentWeek(),
    activityDescription: "",
    toolsEquipment: "",
    skillsAcquired: "",
    challengesFaced: "",
  });
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string | number) => setForm(prev => ({ ...prev, [k]: v }));

  const processFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: FilePreview[] = [];
    for (const f of Array.from(fileList).slice(0, 5 - files.length)) {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      const type: FilePreview["type"] = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext) ? "image" : ext === "pdf" ? "pdf" : "file";
      const url = type === "image" ? URL.createObjectURL(f) : undefined;
      const size = f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`;
      newFiles.push({ name: f.name, type, url, size });
    }
    setFiles(prev => [...prev, ...newFiles].slice(0, 5));
  };

  const removeFile = (i: number) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleSubmit = (status: "draft" | "pending") => (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setTimeout(() => {
      const entry = addLogEntry({
        ...form,
        weekNumber: Number(form.weekNumber),
        studentId: user.id,
        studentName: user.name,
        status,
        evidenceFiles: files.map(f => ({ name: f.name, type: f.type, url: f.url })),
      });
      setSubmitting(false);
      navigate(`/log/${entry.id}`);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Create Log Entry</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Document your daily industrial training activities</p>
      </div>

      <form className="space-y-5">
        {/* Date + Week */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4 text-sm">Entry Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => set("date", e.target.value)}
                max={today()}
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Week Number</label>
              <select
                value={form.weekNumber}
                onChange={e => set("weekNumber", Number(e.target.value))}
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {Array.from({ length: 24 }, (_, i) => i + 1).map(w => (
                  <option key={w} value={w}>Week {w}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Activity description */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4 text-sm">Activity Description</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                What did you do today? <span className="text-destructive">*</span>
              </label>
              <textarea
                value={form.activityDescription}
                onChange={e => set("activityDescription", e.target.value)}
                placeholder="Describe your activities in detail. Include the tasks you performed, the processes involved, and any outcomes..."
                rows={6}
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                required
              />
              <div className="text-xs text-muted-foreground mt-1">{form.activityDescription.length} characters (min 100 recommended)</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Tools & Equipment Used</label>
              <textarea
                value={form.toolsEquipment}
                onChange={e => set("toolsEquipment", e.target.value)}
                placeholder="List the tools, software, equipment, or machines you used (e.g., AutoCAD, MATLAB, oscilloscope, lathe machine)..."
                rows={3}
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Skills Acquired</label>
              <textarea
                value={form.skillsAcquired}
                onChange={e => set("skillsAcquired", e.target.value)}
                placeholder="What new skills, knowledge or competencies did you gain from this activity?..."
                rows={3}
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Challenges Faced</label>
              <textarea
                value={form.challengesFaced}
                onChange={e => set("challengesFaced", e.target.value)}
                placeholder="Describe any difficulties, obstacles, or challenges you encountered and how you addressed them..."
                rows={3}
                className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>
        </div>

        {/* File upload */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-1 text-sm">Evidence & Attachments</h2>
          <p className="text-xs text-muted-foreground mb-4">Upload photos, PDFs, or documents as evidence (max 5 files)</p>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
              ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}
          >
            <svg className="w-8 h-8 mx-auto mb-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium text-foreground">Drop files here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">Images, PDFs, documents (max 5 files)</p>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              className="hidden"
              onChange={e => processFiles(e.target.files)}
            />
          </div>

          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border">
                  {f.type === "image" && f.url ? (
                    <img src={f.url} alt={f.name} className="w-10 h-10 object-cover rounded-md shrink-0" />
                  ) : (
                    <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${f.type === "pdf" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.size}</p>
                  </div>
                  <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => navigate("/logbook")}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-border text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <div className="flex-1 flex gap-3">
            <button
              type="button"
              onClick={handleSubmit("draft")}
              disabled={submitting || !form.activityDescription}
              className="flex-1 px-5 py-2.5 rounded-lg text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={handleSubmit("pending")}
              disabled={submitting || !form.activityDescription}
              className="flex-1 px-5 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </>
              ) : "Submit for Approval"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
