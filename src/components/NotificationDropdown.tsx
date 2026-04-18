import { useEffect, useRef } from "react";
import { useData } from "../context/DataContext";

interface Props {
  userId: string;
  onClose: () => void;
}

function typeColor(type: string) {
  switch (type) {
    case "approval": return "bg-green-100 text-green-700";
    case "rejection": return "bg-red-100 text-red-700";
    case "feedback": return "bg-blue-100 text-blue-700";
    case "submission": return "bg-yellow-100 text-yellow-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

function typeIcon(type: string) {
  switch (type) {
    case "approval": return "✓";
    case "rejection": return "✗";
    case "feedback": return "💬";
    case "submission": return "📝";
    default: return "ℹ";
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString();
}

export default function NotificationDropdown({ userId, onClose }: Props) {
  const { notifications, markNotificationRead, markAllRead } = useData();
  const ref = useRef<HTMLDivElement>(null);

  const userNotifs = notifications.slice(0, 10);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
        <button
          onClick={() => markAllRead()}
          className="text-xs text-primary hover:underline"
        >
          Mark all read
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto divide-y divide-border">
        {userNotifs.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">No notifications</div>
        ) : (
          userNotifs.map(n => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`flex gap-3 p-3 cursor-pointer transition-colors hover:bg-muted/50 ${!n.is_read ? "bg-primary/5" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${typeColor(n.type)}`}>
                {typeIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-foreground leading-tight">{n.title}</span>
                  {!n.is_read && <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                <span className="text-xs text-muted-foreground/70 mt-1 block">{formatDate(n.created_at)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
