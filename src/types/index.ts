export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'completed';
export type TaskType = 'assignment' | 'reading' | 'revision' | 'project' | 'exam-prep' | 'other';
export type EventType = 'class' | 'lab' | 'study' | 'exam' | 'personal';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Plain/simple hashed string for mock auth
  program?: string;
  createdAt: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  color: string; // Hex color e.g. #3b82f6
  instructor?: string;
  location?: string;
  notes?: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  type: EventType;
  courseId?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24-hr e.g. "09:00")
  endTime: string; // HH:mm
  dayOfWeek?: number; // 0=Sun, 1=Mon, ..., 6=Sat (for recurring classes)
  isRecurring?: boolean;
  location?: string;
  notes?: string;
  studySessionId?: string;
}

export interface Task {
  id: string;
  title: string;
  courseId?: string;
  type: TaskType;
  dueAt: string; // ISO date string or YYYY-MM-DDTHH:mm
  priority: Priority;
  estimatedMinutes?: number;
  status: TaskStatus;
  notes?: string;
}

export interface UserSettings {
  studyHoursStart: string; // e.g. "08:00"
  studyHoursEnd: string; // e.g. "22:00"
  availableDays: number[]; // e.g. [1, 2, 3, 4, 5] (Mon-Fri)
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  defaultFocusDuration?: number;
  defaultBreakDuration?: number;
}

export type ActiveScreen = 'dashboard' | 'calendar' | 'tasks' | 'courses' | 'planner' | 'settings';

/* Study Planner specific types */
export type StudyType = 
  | 'learning' 
  | 'revision' 
  | 'practice' 
  | 'assignment' 
  | 'exam-prep' 
  | 'catch-up';

export type StudySessionStatus = 
  | 'planned' 
  | 'in-progress' 
  | 'completed' 
  | 'missed' 
  | 'skipped';

export interface StudySession {
  id: string;
  courseId: string;
  topic: string;
  studyType: StudyType;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  goal: string;
  status: StudySessionStatus;
  actualDurationMinutes: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyGoal {
  id: string;
  courseId: string;
  weeklyTargetMinutes: number;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
}

export type TopicStatus = 'not-started' | 'in-progress' | 'completed';

export interface StudyTopic {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  status: TopicStatus;
  priority: Priority;
}

export interface StudyAvailability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export type PlannerSubSection = 'weekly-plan' | 'subjects' | 'focus-mode' | 'study-history';

export interface ActiveFocusState {
  sessionId?: string;
  courseId: string;
  topic: string;
  goal: string;
  durationPreset: number;
  breakPreset: number;
  elapsedFocusSeconds: number;
  isRunning: boolean;
  isBreak: boolean;
  notes: string;
}
