import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { apiService, Notification as ApiNotification } from "../services/api";
import { useAuth } from "./AuthContext";

export type LogStatus = "draft" | "pending" | "approved" | "rejected";

export interface LogEntry {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  weekNumber: number;
  activityDescription: string;
  toolsEquipment: string;
  skillsAcquired: string;
  challengesFaced: string;
  status: LogStatus;
  supervisorComment?: string;
  evidenceFiles: { name: string; type: string; url?: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification extends ApiNotification {}

interface DataContextType {
  logEntries: LogEntry[];
  notifications: Notification[];
  addLogEntry: (entry: Omit<LogEntry, "id" | "createdAt" | "updatedAt">) => LogEntry;
  updateLogEntry: (id: string, updates: Partial<LogEntry>) => void;
  approveEntry: (id: string, comment?: string, supervisorName?: string) => void;
  rejectEntry: (id: string, comment: string, supervisorName?: string) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: (userId: string) => void;
  getStudentEntries: (studentId: string) => LogEntry[];
  getEntriesForSupervisor: () => LogEntry[];
  getUnreadCount: (userId: string) => number;
}

const today = new Date();
const fmtDate = (d: Date) => d.toISOString().split("T")[0];
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return fmtDate(d);
};

const INITIAL_ENTRIES: LogEntry[] = [];
const INITIAL_NOTIFICATIONS: Notification[] = [];

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [logEntries, setLogEntries] = useState<LogEntry[]>(INITIAL_ENTRIES);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Poll for new notifications every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const response = await apiService.getNotifications({ limit: 50 });
      setNotifications(response.data as Notification[]);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const addLogEntry = (entry: Omit<LogEntry, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString().split("T")[0];
    const newEntry: LogEntry = {
      ...entry,
      id: `e_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    setLogEntries(prev => [newEntry, ...prev]);

    if (entry.status === "pending") {
      const notif: Notification = {
        id: `n_${Date.now()}`,
        userId: "is1",
        title: "New Submission",
        message: `${entry.studentName} submitted a new log entry for Week ${entry.weekNumber} for review.`,
        type: "submission",
        read: false,
        createdAt: now,
      };
      setNotifications(prev => [notif, ...prev]);
    }
    return newEntry;
  };

  const updateLogEntry = (id: string, updates: Partial<LogEntry>) => {
    const now = new Date().toISOString().split("T")[0];
    setLogEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates, updatedAt: now } : e));
  };

  const approveEntry = (id: string, comment?: string, supervisorName?: string) => {
    const now = new Date().toISOString().split("T")[0];
    const entry = logEntries.find(e => e.id === id);
    if (!entry) return;
    setLogEntries(prev => prev.map(e =>
      e.id === id ? { ...e, status: "approved", supervisorComment: comment, updatedAt: now } : e
    ));
    const notif: Notification = {
      id: `n_${Date.now()}`,
      userId: entry.studentId,
      title: "Entry Approved",
      message: `Your Week ${entry.weekNumber} log entry has been approved${supervisorName ? ` by ${supervisorName}` : ""}.${comment ? ` Comment: "${comment}"` : ""}`,
      type: "approval",
      read: false,
      createdAt: now,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const rejectEntry = (id: string, comment: string, supervisorName?: string) => {
    const now = new Date().toISOString().split("T")[0];
    const entry = logEntries.find(e => e.id === id);
    if (!entry) return;
    setLogEntries(prev => prev.map(e =>
      e.id === id ? { ...e, status: "rejected", supervisorComment: comment, updatedAt: now } : e
    ));
    const notif: Notification = {
      id: `n_${Date.now()}`,
      userId: entry.studentId,
      title: "Entry Rejected",
      message: `Your Week ${entry.weekNumber} log entry requires revision. Comment: "${comment}"`,
      type: "rejection",
      read: false,
      createdAt: now,
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const markNotificationRead = async (id: string) => {
    try {
      await apiService.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const getStudentEntries = (studentId: string) => logEntries.filter(e => e.studentId === studentId);

  const getEntriesForSupervisor = () => logEntries.filter(e => true);

  const getUnreadCount = () => notifications.filter(n => !n.is_read).length;

  return (
    <DataContext.Provider value={{
      logEntries, notifications, addLogEntry, updateLogEntry,
      approveEntry, rejectEntry, markNotificationRead, markAllRead,
      getStudentEntries, getEntriesForSupervisor, getUnreadCount,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
