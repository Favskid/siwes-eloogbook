import { LogStatus } from "../context/DataContext";

export default function StatusBadge({ status }: { status: LogStatus }) {
  const map: Record<LogStatus, { label: string; className: string }> = {
    draft: { label: "Draft", className: "status-draft" },
    pending: { label: "Pending Review", className: "status-pending" },
    approved: { label: "Approved", className: "status-approved" },
    rejected: { label: "Rejected", className: "status-rejected" },
  };
  const { label, className } = map[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}
