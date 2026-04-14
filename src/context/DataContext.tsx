import { createContext, useContext, useState, ReactNode } from "react";

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

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "approval" | "rejection" | "feedback" | "submission" | "info";
  read: boolean;
  createdAt: string;
}

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

const INITIAL_ENTRIES: LogEntry[] = [
  {
    id: "e1", studentId: "s1", studentName: "Chioma Adaeze Okonkwo",
    date: daysAgo(1), weekNumber: 12,
    activityDescription: "Developed a REST API endpoint for user authentication using Node.js and Express. Implemented JWT token generation and validation, set up middleware for protected routes, and wrote unit tests for the auth module.",
    toolsEquipment: "VS Code, Node.js, Express.js, Postman, JWT library",
    skillsAcquired: "API development, JWT authentication, middleware patterns, unit testing",
    challengesFaced: "Understanding token refresh mechanisms and implementing secure token storage on the client side.",
    status: "approved", supervisorComment: "Excellent work! The implementation is clean and well-structured.",
    evidenceFiles: [{ name: "auth-api-screenshot.png", type: "image" }],
    createdAt: daysAgo(2), updatedAt: daysAgo(1),
  },
  {
    id: "e2", studentId: "s1", studentName: "Chioma Adaeze Okonkwo",
    date: daysAgo(3), weekNumber: 12,
    activityDescription: "Attended daily stand-up meeting and worked on database schema design for the project management module. Created entity-relationship diagrams and implemented the PostgreSQL schema.",
    toolsEquipment: "dbdiagram.io, PostgreSQL, DBeaver, Draw.io",
    skillsAcquired: "Database design, ER diagrams, PostgreSQL, schema normalization",
    challengesFaced: "Deciding on the right level of normalization for the project's needs.",
    status: "pending",
    evidenceFiles: [{ name: "er-diagram.pdf", type: "pdf" }],
    createdAt: daysAgo(4), updatedAt: daysAgo(3),
  },
  {
    id: "e3", studentId: "s1", studentName: "Chioma Adaeze Okonkwo",
    date: daysAgo(7), weekNumber: 11,
    activityDescription: "Built responsive React components for the dashboard using Tailwind CSS. Implemented data visualization charts using Chart.js and integrated real-time data updates.",
    toolsEquipment: "React.js, Tailwind CSS, Chart.js, Figma",
    skillsAcquired: "React component design, responsive layouts, data visualization, UI/UX principles",
    challengesFaced: "Making charts responsive across different screen sizes.",
    status: "approved", supervisorComment: "Well done! The charts are very professional.",
    evidenceFiles: [{ name: "dashboard-ui.png", type: "image" }, { name: "components.zip", type: "file" }],
    createdAt: daysAgo(8), updatedAt: daysAgo(7),
  },
  {
    id: "e4", studentId: "s1", studentName: "Chioma Adaeze Okonkwo",
    date: daysAgo(10), weekNumber: 11,
    activityDescription: "Participated in code review session and learned about Git branching strategies. Worked on fixing bugs identified during the review.",
    toolsEquipment: "Git, GitHub, VS Code",
    skillsAcquired: "Code review practices, Git workflow, debugging",
    challengesFaced: "Resolving merge conflicts in a collaborative environment.",
    status: "rejected", supervisorComment: "Please provide more detail on the specific bugs you fixed and the solutions applied.",
    evidenceFiles: [],
    createdAt: daysAgo(11), updatedAt: daysAgo(10),
  },
  {
    id: "e5", studentId: "s1", studentName: "Chioma Adaeze Okonkwo",
    date: daysAgo(14), weekNumber: 10,
    activityDescription: "Set up CI/CD pipeline using GitHub Actions for automated testing and deployment. Configured staging and production environments.",
    toolsEquipment: "GitHub Actions, Docker, AWS EC2",
    skillsAcquired: "DevOps practices, CI/CD pipelines, containerization, cloud deployment",
    challengesFaced: "Configuring environment variables securely across different deployment stages.",
    status: "approved",
    evidenceFiles: [{ name: "pipeline-config.yml", type: "file" }],
    createdAt: daysAgo(15), updatedAt: daysAgo(14),
  },
  {
    id: "e6", studentId: "s1", studentName: "Chioma Adaeze Okonkwo",
    date: daysAgo(0), weekNumber: 12,
    activityDescription: "Today I worked on implementing socket.io for real-time notifications in the project dashboard.",
    toolsEquipment: "Socket.io, Node.js, Redis",
    skillsAcquired: "WebSocket programming, real-time communication, Redis pub/sub",
    challengesFaced: "Still working through this.",
    status: "draft",
    evidenceFiles: [],
    createdAt: daysAgo(0), updatedAt: daysAgo(0),
  },
  {
    id: "e7", studentId: "s2", studentName: "Emeka Chukwuemeka",
    date: daysAgo(2), weekNumber: 12,
    activityDescription: "Worked on mobile application UI development using Flutter framework. Implemented navigation flows and state management using Provider.",
    toolsEquipment: "Flutter, Dart, Android Studio, Firebase",
    skillsAcquired: "Flutter development, mobile UI design, state management, Firebase integration",
    challengesFaced: "Understanding Flutter's widget tree and state management patterns.",
    status: "pending",
    evidenceFiles: [{ name: "app-screenshot.png", type: "image" }],
    createdAt: daysAgo(3), updatedAt: daysAgo(2),
  },
  {
    id: "e8", studentId: "s3", studentName: "Ngozi Ifeanyi",
    date: daysAgo(5), weekNumber: 11,
    activityDescription: "Worked on PCB design and simulation for a power supply circuit. Tested the circuit under various load conditions.",
    toolsEquipment: "Altium Designer, Multisim, Oscilloscope, Soldering tools",
    skillsAcquired: "PCB design, circuit simulation, power electronics, testing methodologies",
    challengesFaced: "Managing heat dissipation in the high-power components.",
    status: "approved", supervisorComment: "Good technical work. Please include more simulation results next time.",
    evidenceFiles: [{ name: "pcb-design.pdf", type: "pdf" }, { name: "test-results.xlsx", type: "file" }],
    createdAt: daysAgo(6), updatedAt: daysAgo(5),
  },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: "n1", userId: "s1", title: "Entry Approved", message: "Your Week 12 log entry (Nov 1) has been approved by Mr. Babatunde Adeyemi.", type: "approval", read: false, createdAt: daysAgo(1) },
  { id: "n2", userId: "s1", title: "Entry Rejected", message: "Your Week 11 log entry (Oct 27) requires revision. Please provide more details.", type: "rejection", read: false, createdAt: daysAgo(2) },
  { id: "n3", userId: "s1", title: "Week 10 Approved", message: "Your Week 10 log entry has been approved. Great work!", type: "approval", read: true, createdAt: daysAgo(8) },
  { id: "n4", userId: "is1", title: "New Submission", message: "Chioma Okonkwo submitted a new log entry for Week 12 (Oct 30) for review.", type: "submission", read: false, createdAt: daysAgo(3) },
  { id: "n5", userId: "is1", title: "New Submission", message: "Emeka Chukwuemeka submitted a new log entry for Week 12 for review.", type: "submission", read: false, createdAt: daysAgo(2) },
  { id: "n6", userId: "ss1", title: "Student Progress Update", message: "3 students have submitted new log entries this week.", type: "info", read: false, createdAt: daysAgo(1) },
  { id: "n7", userId: "a1", title: "Weekly Report", message: "15 new log entries submitted this week. 12 approved, 2 rejected, 1 pending.", type: "info", read: false, createdAt: daysAgo(0) },
];

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [logEntries, setLogEntries] = useState<LogEntry[]>(INITIAL_ENTRIES);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

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

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = (userId: string) => {
    setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, read: true } : n));
  };

  const getStudentEntries = (studentId: string) => logEntries.filter(e => e.studentId === studentId);

  const getEntriesForSupervisor = () => logEntries.filter(e => e.studentId !== "s3" || true);

  const getUnreadCount = (userId: string) => notifications.filter(n => n.userId === userId && !n.read).length;

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
