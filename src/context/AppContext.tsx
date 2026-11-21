import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Course, 
  ScheduleEvent, 
  Task, 
  UserSettings, 
  ActiveScreen,
  StudySession,
  StudyGoal,
  StudyTopic,
  ActiveFocusState,
  PlannerSubSection,
  UserAccount
} from '../types';
import { 
  FIKIRTE_USER_ID,
  FIKIRTE_COURSES,
  FIKIRTE_EVENTS,
  FIKIRTE_TASKS,
  FIKIRTE_STUDY_SESSIONS,
  FIKIRTE_STUDY_GOALS,
  FIKIRTE_STUDY_TOPICS,
  DEFAULT_SETTINGS
} from '../data/initialData';

// Pre-configured accounts: Frehiwet / Fikirte (Public Health)
const DEFAULT_ACCOUNTS: UserAccount[] = [
  {
    id: FIKIRTE_USER_ID,
    name: 'Frehiwet (Fre)',
    email: 'fre@gmail.com',
    passwordHash: '12345678F',
    program: 'Public Health (Year II, Sem I)',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_fikirte_legacy',
    name: 'Frehiwet (Fre)',
    email: 'fikirte@university.edu',
    passwordHash: 'demo123',
    program: 'Public Health (Year II, Sem I)',
    createdAt: new Date().toISOString(),
  },
];

interface AppContextType {
  currentUser: UserAccount | null;
  login: (email: string, passwordHash: string) => { success: boolean; message: string };
  register: (name: string, email: string, passwordHash: string, program?: string) => { success: boolean; message: string };
  updateProfile: (updates: { name?: string; email?: string; program?: string; avatarUrl?: string; password?: string }) => { success: boolean; message: string };
  logout: () => void;

  currentScreen: ActiveScreen;
  setCurrentScreen: (screen: ActiveScreen) => void;
  plannerSubSection: PlannerSubSection;
  setPlannerSubSection: (section: PlannerSubSection) => void;
  
  courses: Course[];
  addCourse: (course: Omit<Course, 'id'>) => Course;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
  selectedCourseForDetails: string | null;
  setSelectedCourseForDetails: (courseId: string | null) => void;

  events: ScheduleEvent[];
  addEvent: (event: Omit<ScheduleEvent, 'id'>) => ScheduleEvent;
  updateEvent: (id: string, event: Partial<ScheduleEvent>) => void;
  deleteEvent: (id: string) => void;

  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => Task;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;

  studySessions: StudySession[];
  addStudySession: (session: Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'>) => StudySession;
  updateStudySession: (id: string, session: Partial<StudySession>) => void;
  deleteStudySession: (id: string) => void;
  rescheduleSession: (id: string, newDate: string, newStartTime: string, newEndTime: string) => void;

  studyGoals: StudyGoal[];
  setCourseStudyGoal: (courseId: string, weeklyTargetMinutes: number, priority?: 'low' | 'medium' | 'high') => void;
  studyTopics: StudyTopic[];
  addStudyTopic: (topic: Omit<StudyTopic, 'id'>) => StudyTopic;
  updateStudyTopic: (id: string, topic: Partial<StudyTopic>) => void;
  deleteStudyTopic: (id: string) => void;

  focusState: ActiveFocusState;
  setFocusState: React.Dispatch<React.SetStateAction<ActiveFocusState>>;
  startFocusSession: (sessionId?: string, courseId?: string, topic?: string, goal?: string, durationMins?: number) => void;
  completeFocusSession: (actualMins: number, notes?: string) => void;

  checkScheduleConflict: (
    date: string, 
    startTime: string, 
    endTime: string, 
    excludeEventId?: string, 
    excludeStudySessionId?: string
  ) => { hasConflict: boolean; conflicts: Array<{ title: string; type: string; time: string }> };

  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
  resetToDefaults: () => void;
  quickAddOpen: boolean;
  setQuickAddOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const GLOBAL_ACCOUNTS_KEY = 'sched_app_accounts_v2';
const ACTIVE_USER_ID_KEY = 'sched_app_active_user_id_v2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. User Accounts management
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(GLOBAL_ACCOUNTS_KEY);
      if (saved) {
        const parsed: UserAccount[] = JSON.parse(saved);
        // Ensure default accounts (like fre@gmail.com) exist or get updated with fresh credentials
        const merged = [...parsed];
        for (const def of DEFAULT_ACCOUNTS) {
          const idx = merged.findIndex((a) => a.email.toLowerCase() === def.email.toLowerCase() || a.id === def.id);
          if (idx >= 0) {
            merged[idx] = { ...merged[idx], email: def.email, passwordHash: def.passwordHash, name: def.name };
          } else {
            merged.push(def);
          }
        }
        return merged;
      }
      return DEFAULT_ACCOUNTS;
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_USER_ID_KEY) || null;
  });

  const currentUser = accounts.find((a) => a.id === currentUserId) || null;

  useEffect(() => {
    localStorage.setItem(GLOBAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(ACTIVE_USER_ID_KEY, currentUserId);
    } else {
      localStorage.removeItem(ACTIVE_USER_ID_KEY);
    }
  }, [currentUserId]);

  // Per-user storage key helpers
  const getUserKey = (prefix: string) => `${prefix}_${currentUserId || 'guest'}`;

  // Default data depending on whether it's Frehiwet / Fikirte or a new user
  const getInitialCoursesForUser = (userId: string | null) => {
    return (userId === FIKIRTE_USER_ID || userId === 'usr_fikirte_legacy') ? FIKIRTE_COURSES : [];
  };

  const getInitialEventsForUser = (userId: string | null) => {
    return (userId === FIKIRTE_USER_ID || userId === 'usr_fikirte_legacy') ? FIKIRTE_EVENTS : [];
  };

  const getInitialTasksForUser = (userId: string | null) => {
    return (userId === FIKIRTE_USER_ID || userId === 'usr_fikirte_legacy') ? FIKIRTE_TASKS : [];
  };

  const getInitialSessionsForUser = (userId: string | null) => {
    return (userId === FIKIRTE_USER_ID || userId === 'usr_fikirte_legacy') ? FIKIRTE_STUDY_SESSIONS : [];
  };

  const getInitialGoalsForUser = (userId: string | null) => {
    return (userId === FIKIRTE_USER_ID || userId === 'usr_fikirte_legacy') ? FIKIRTE_STUDY_GOALS : [];
  };

  const getInitialTopicsForUser = (userId: string | null) => {
    return (userId === FIKIRTE_USER_ID || userId === 'usr_fikirte_legacy') ? FIKIRTE_STUDY_TOPICS : [];
  };

  // User Auth Actions
  const login = (email: string, passwordHash: string) => {
    const acc = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (!acc) {
      return { success: false, message: 'No account registered with this email.' };
    }
    if (acc.passwordHash !== passwordHash) {
      return { success: false, message: 'Incorrect password. Please try again.' };
    }
    setCurrentUserId(acc.id);
    setCurrentScreen('dashboard');
    return { success: true, message: 'Logged in successfully.' };
  };

  const register = (name: string, email: string, passwordHash: string, program = 'General') => {
    const existing = accounts.find((a) => a.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    const newAcc: UserAccount = {
      id: 'usr_' + Date.now() + Math.random().toString(36).substring(2, 6),
      name,
      email,
      passwordHash,
      program,
      createdAt: new Date().toISOString(),
    };
    setAccounts((prev) => [...prev, newAcc]);
    // Do NOT auto-login or redirect to dashboard immediately.
    // The user will be redirected to the login form to enter their credentials.
    return { success: true, message: 'Account created successfully! Please sign in.' };
  };

  const updateProfile = (updates: { name?: string; email?: string; program?: string; avatarUrl?: string; password?: string }) => {
    if (!currentUserId) return { success: false, message: 'No user logged in.' };

    if (updates.email) {
      const emailTrimmed = updates.email.trim().toLowerCase();
      const conflict = accounts.find((a) => a.id !== currentUserId && a.email.toLowerCase() === emailTrimmed);
      if (conflict) {
        return { success: false, message: 'This email is already in use by another account.' };
      }
    }

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === currentUserId) {
          return {
            ...acc,
            name: updates.name !== undefined ? updates.name : acc.name,
            email: updates.email !== undefined && updates.email.trim() ? updates.email.trim() : acc.email,
            program: updates.program !== undefined ? updates.program : acc.program,
            avatarUrl: updates.avatarUrl !== undefined ? updates.avatarUrl : acc.avatarUrl,
            passwordHash: updates.password ? updates.password : acc.passwordHash,
          };
        }
        return acc;
      })
    );
    return { success: true, message: 'Profile updated successfully.' };
  };

  const logout = () => {
    setCurrentUserId(null);
  };

  // Screen state
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('dashboard');
  const [plannerSubSection, setPlannerSubSection] = useState<PlannerSubSection>('weekly-plan');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState<string | null>(null);

  // Per-user isolated states
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const key = getUserKey('sched_courses');
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : getInitialCoursesForUser(currentUserId);
    } catch {
      return getInitialCoursesForUser(currentUserId);
    }
  });

  const [events, setEvents] = useState<ScheduleEvent[]>(() => {
    try {
      const key = getUserKey('sched_events');
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : getInitialEventsForUser(currentUserId);
    } catch {
      return getInitialEventsForUser(currentUserId);
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const key = getUserKey('sched_tasks');
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : getInitialTasksForUser(currentUserId);
    } catch {
      return getInitialTasksForUser(currentUserId);
    }
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const key = getUserKey('sched_settings');
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [studySessions, setStudySessions] = useState<StudySession[]>(() => {
    try {
      const key = getUserKey('sched_sessions');
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : getInitialSessionsForUser(currentUserId);
    } catch {
      return getInitialSessionsForUser(currentUserId);
    }
  });

  const [studyGoals, setStudyGoals] = useState<StudyGoal[]>(() => {
    try {
      const key = getUserKey('sched_goals');
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : getInitialGoalsForUser(currentUserId);
    } catch {
      return getInitialGoalsForUser(currentUserId);
    }
  });

  const [studyTopics, setStudyTopics] = useState<StudyTopic[]>(() => {
    try {
      const key = getUserKey('sched_topics');
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : getInitialTopicsForUser(currentUserId);
    } catch {
      return getInitialTopicsForUser(currentUserId);
    }
  });

  const [focusState, setFocusState] = useState<ActiveFocusState>({
    courseId: '',
    topic: '',
    goal: '',
    durationPreset: 50 * 60,
    breakPreset: 10 * 60,
    elapsedFocusSeconds: 0,
    isRunning: false,
    isBreak: false,
    notes: '',
  });

  // When active user switches, reload their data cleanly
  useEffect(() => {
    if (!currentUserId) return;
    try {
      const savedCourses = localStorage.getItem(getUserKey('sched_courses'));
      setCourses(savedCourses ? JSON.parse(savedCourses) : getInitialCoursesForUser(currentUserId));

      const savedEvents = localStorage.getItem(getUserKey('sched_events'));
      setEvents(savedEvents ? JSON.parse(savedEvents) : getInitialEventsForUser(currentUserId));

      const savedTasks = localStorage.getItem(getUserKey('sched_tasks'));
      setTasks(savedTasks ? JSON.parse(savedTasks) : getInitialTasksForUser(currentUserId));

      const savedSessions = localStorage.getItem(getUserKey('sched_sessions'));
      setStudySessions(savedSessions ? JSON.parse(savedSessions) : getInitialSessionsForUser(currentUserId));

      const savedGoals = localStorage.getItem(getUserKey('sched_goals'));
      setStudyGoals(savedGoals ? JSON.parse(savedGoals) : getInitialGoalsForUser(currentUserId));

      const savedTopics = localStorage.getItem(getUserKey('sched_topics'));
      setStudyTopics(savedTopics ? JSON.parse(savedTopics) : getInitialTopicsForUser(currentUserId));

      const savedSettings = localStorage.getItem(getUserKey('sched_settings'));
      setSettings(savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS);
    } catch (e) {
      console.error('Error switching user storage', e);
    }
  }, [currentUserId]);

  // Sync state changes with current user's local storage
  useEffect(() => {
    if (currentUserId) localStorage.setItem(getUserKey('sched_courses'), JSON.stringify(courses));
  }, [courses, currentUserId]);

  useEffect(() => {
    if (currentUserId) localStorage.setItem(getUserKey('sched_events'), JSON.stringify(events));
  }, [events, currentUserId]);

  useEffect(() => {
    if (currentUserId) localStorage.setItem(getUserKey('sched_tasks'), JSON.stringify(tasks));
  }, [tasks, currentUserId]);

  useEffect(() => {
    if (currentUserId) localStorage.setItem(getUserKey('sched_sessions'), JSON.stringify(studySessions));
  }, [studySessions, currentUserId]);

  useEffect(() => {
    if (currentUserId) localStorage.setItem(getUserKey('sched_goals'), JSON.stringify(studyGoals));
  }, [studyGoals, currentUserId]);

  useEffect(() => {
    if (currentUserId) localStorage.setItem(getUserKey('sched_topics'), JSON.stringify(studyTopics));
  }, [studyTopics, currentUserId]);

  useEffect(() => {
    if (currentUserId) localStorage.setItem(getUserKey('sched_settings'), JSON.stringify(settings));
    if (settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings, currentUserId]);

  // Course actions
  const addCourse = (courseData: Omit<Course, 'id'>) => {
    const newCourse: Course = { ...courseData, id: 'c_' + Date.now() + Math.random().toString(36).substring(2, 6) };
    setCourses((prev) => [...prev, newCourse]);
    setStudyGoals((prev) => [
      ...prev,
      {
        id: 'sg_' + Date.now(),
        courseId: newCourse.id,
        weeklyTargetMinutes: 180,
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
    return newCourse;
  };

  const updateCourse = (id: string, updated: Partial<Course>) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setEvents((prev) => prev.filter((e) => e.courseId !== id));
    setTasks((prev) => prev.filter((t) => t.courseId !== id));
    setStudySessions((prev) => prev.filter((s) => s.courseId !== id));
    setStudyGoals((prev) => prev.filter((g) => g.courseId !== id));
    setStudyTopics((prev) => prev.filter((tp) => tp.courseId !== id));
  };

  // Event actions
  const addEvent = (eventData: Omit<ScheduleEvent, 'id'>) => {
    const newEvent: ScheduleEvent = { ...eventData, id: 'e_' + Date.now() + Math.random().toString(36).substring(2, 6) };
    setEvents((prev) => [...prev, newEvent]);
    return newEvent;
  };

  const updateEvent = (id: string, updated: Partial<ScheduleEvent>) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
  };

  const deleteEvent = (id: string) => {
    const target = events.find((e) => e.id === id);
    if (target?.studySessionId) {
      setStudySessions((prev) => prev.filter((s) => s.id !== target.studySessionId));
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // Task actions
  const addTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = { ...taskData, id: 't_' + Date.now() + Math.random().toString(36).substring(2, 6) };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (id: string, updated: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === 'completed' ? 'todo' : 'completed';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  // Conflict Checking Utility
  const checkScheduleConflict = (
    date: string,
    startTime: string,
    endTime: string,
    excludeEventId?: string,
    excludeStudySessionId?: string
  ) => {
    const conflicts: Array<{ title: string; type: string; time: string }> = [];
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    events.forEach((ev) => {
      if (excludeEventId && ev.id === excludeEventId) return;
      if (excludeStudySessionId && ev.studySessionId === excludeStudySessionId) return;

      const isSameDate = (ev.isRecurring && ev.dayOfWeek === dayOfWeek) || ev.date === date;
      if (isSameDate) {
        if (startTime < ev.endTime && endTime > ev.startTime) {
          conflicts.push({
            title: ev.title,
            type: ev.type,
            time: `${ev.startTime} - ${ev.endTime}`,
          });
        }
      }
    });

    studySessions.forEach((sess) => {
      if (excludeStudySessionId && sess.id === excludeStudySessionId) return;
      if (sess.status === 'skipped' || sess.status === 'completed') return;

      if (sess.date === date) {
        if (startTime < sess.endTime && endTime > sess.startTime) {
          conflicts.push({
            title: `Study: ${sess.topic}`,
            type: 'study',
            time: `${sess.startTime} - ${sess.endTime}`,
          });
        }
      }
    });

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
    };
  };

  // Study Planner Sessions CRUD
  const addStudySession = (sessionData: Omit<StudySession, 'id' | 'createdAt' | 'updatedAt'>) => {
    const sessionId = 'ss_' + Date.now() + Math.random().toString(36).substring(2, 6);
    const newSession: StudySession = {
      ...sessionData,
      id: sessionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setStudySessions((prev) => [...prev, newSession]);

    const course = courses.find((c) => c.id === sessionData.courseId);
    const newEvent: ScheduleEvent = {
      id: 'e_ss_' + sessionId,
      title: `${course ? course.code + ': ' : ''}${sessionData.topic}`,
      type: 'study',
      courseId: sessionData.courseId,
      date: sessionData.date,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      notes: sessionData.goal,
      studySessionId: sessionId,
    };
    setEvents((prev) => [...prev, newEvent]);

    return newSession;
  };

  const updateStudySession = (id: string, updated: Partial<StudySession>) => {
    setStudySessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated, updatedAt: new Date().toISOString() } : s))
    );

    setEvents((prev) =>
      prev.map((e) => {
        if (e.studySessionId === id) {
          return {
            ...e,
            date: updated.date ?? e.date,
            startTime: updated.startTime ?? e.startTime,
            endTime: updated.endTime ?? e.endTime,
            title: updated.topic ? updated.topic : e.title,
            courseId: updated.courseId ?? e.courseId,
          };
        }
        return e;
      })
    );
  };

  const deleteStudySession = (id: string) => {
    setStudySessions((prev) => prev.filter((s) => s.id !== id));
    setEvents((prev) => prev.filter((e) => e.studySessionId !== id));
  };

  const rescheduleSession = (id: string, newDate: string, newStartTime: string, newEndTime: string) => {
    const [startH, startM] = newStartTime.split(':').map(Number);
    const [endH, endM] = newEndTime.split(':').map(Number);
    const duration = (endH * 60 + endM) - (startH * 60 + startM);

    updateStudySession(id, {
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      durationMinutes: Math.max(duration, 30),
      status: 'planned',
    });
  };

  // Study Goals & Topics
  const setCourseStudyGoal = (courseId: string, weeklyTargetMinutes: number, priority: 'low' | 'medium' | 'high' = 'medium') => {
    setStudyGoals((prev) => {
      const existing = prev.find((g) => g.courseId === courseId);
      if (existing) {
        return prev.map((g) =>
          g.courseId === courseId
            ? { ...g, weeklyTargetMinutes, priority, updatedAt: new Date().toISOString() }
            : g
        );
      }
      return [
        ...prev,
        {
          id: 'sg_' + Date.now(),
          courseId,
          weeklyTargetMinutes,
          priority,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    });
  };

  const addStudyTopic = (topicData: Omit<StudyTopic, 'id'>) => {
    const newTopic: StudyTopic = {
      ...topicData,
      id: 'st_' + Date.now() + Math.random().toString(36).substring(2, 6),
    };
    setStudyTopics((prev) => [...prev, newTopic]);
    return newTopic;
  };

  const updateStudyTopic = (id: string, updated: Partial<StudyTopic>) => {
    setStudyTopics((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
  };

  const deleteStudyTopic = (id: string) => {
    setStudyTopics((prev) => prev.filter((t) => t.id !== id));
  };

  // Focus Mode Actions
  const startFocusSession = (sessionId?: string, courseId?: string, topic?: string, goal?: string, durationMins = 50) => {
    const cId = courseId || courses[0]?.id || '';
    setFocusState({
      sessionId,
      courseId: cId,
      topic: topic || 'General Study Session',
      goal: goal || 'Review core concepts and complete practice exercises',
      durationPreset: durationMins * 60,
      breakPreset: 10 * 60,
      elapsedFocusSeconds: 0,
      isRunning: true,
      isBreak: false,
      notes: '',
    });

    if (sessionId) {
      updateStudySession(sessionId, { status: 'in-progress' });
    }

    setCurrentScreen('planner');
    setPlannerSubSection('focus-mode');
  };

  const completeFocusSession = (actualMins: number, notes?: string) => {
    if (focusState.sessionId) {
      const session = studySessions.find((s) => s.id === focusState.sessionId);
      if (session) {
        updateStudySession(session.id, {
          status: 'completed',
          actualDurationMinutes: (session.actualDurationMinutes || 0) + actualMins,
          notes: notes ? (session.notes ? session.notes + '\n' + notes : notes) : session.notes,
        });
      }
    } else {
      const today = new Date().toISOString().split('T')[0];
      const nowH = new Date().getHours();
      const startH = Math.max(nowH - 1, 0);
      addStudySession({
        courseId: focusState.courseId || courses[0]?.id || '',
        topic: focusState.topic || 'Ad-hoc Focus Session',
        studyType: 'learning',
        date: today,
        startTime: `${String(startH).padStart(2, '0')}:00`,
        endTime: `${String(nowH).padStart(2, '0')}:00`,
        durationMinutes: actualMins,
        actualDurationMinutes: actualMins,
        goal: focusState.goal || 'Focused learning',
        status: 'completed',
        notes: notes || undefined,
      });
    }

    setFocusState({
      courseId: '',
      topic: '',
      goal: '',
      durationPreset: 50 * 60,
      breakPreset: 10 * 60,
      elapsedFocusSeconds: 0,
      isRunning: false,
      isBreak: false,
      notes: '',
    });
  };

  const updateSettings = (updated: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...updated }));
  };

  const exportData = () => {
    const backup = {
      version: '2.0',
      user: currentUser,
      exportedAt: new Date().toISOString(),
      courses,
      events,
      tasks,
      settings,
      studySessions,
      studyGoals,
      studyTopics,
    };
    return JSON.stringify(backup, null, 2);
  };

  const importData = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (Array.isArray(data.courses) && Array.isArray(data.tasks)) {
        if (data.courses) setCourses(data.courses);
        if (data.events) setEvents(data.events);
        if (data.tasks) setTasks(data.tasks);
        if (data.settings) setSettings(data.settings);
        if (data.studySessions) setStudySessions(data.studySessions);
        if (data.studyGoals) setStudyGoals(data.studyGoals);
        if (data.studyTopics) setStudyTopics(data.studyTopics);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  };

  const resetToDefaults = () => {
    if (currentUserId === FIKIRTE_USER_ID) {
      setCourses(FIKIRTE_COURSES);
      setEvents(FIKIRTE_EVENTS);
      setTasks(FIKIRTE_TASKS);
      setStudySessions(FIKIRTE_STUDY_SESSIONS);
      setStudyGoals(FIKIRTE_STUDY_GOALS);
      setStudyTopics(FIKIRTE_STUDY_TOPICS);
    } else {
      setCourses([]);
      setEvents([]);
      setTasks([]);
      setStudySessions([]);
      setStudyGoals([]);
      setStudyTopics([]);
    }
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        register,
        updateProfile,
        logout,
        currentScreen,
        setCurrentScreen,
        plannerSubSection,
        setPlannerSubSection,
        courses,
        events,
        tasks,
        studySessions,
        studyGoals,
        studyTopics,
        focusState,
        setFocusState,
        settings,
        addCourse,
        updateCourse,
        deleteCourse,
        addEvent,
        updateEvent,
        deleteEvent,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        addStudySession,
        updateStudySession,
        deleteStudySession,
        rescheduleSession,
        setCourseStudyGoal,
        addStudyTopic,
        updateStudyTopic,
        deleteStudyTopic,
        startFocusSession,
        completeFocusSession,
        checkScheduleConflict,
        updateSettings,
        exportData,
        importData,
        resetToDefaults,
        quickAddOpen,
        setQuickAddOpen,
        selectedCourseForDetails,
        setSelectedCourseForDetails,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
