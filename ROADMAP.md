# Modern Simple Schedule Management System — Roadmap

## 1. Product Goal
Build a clean, mobile-friendly schedule manager that helps a student organize courses, class times, study sessions, assignments, exams, reminders, and daily priorities without unnecessary complexity.

**MVP principle:** Build a reliable personal planner first. Do not add AI, social features, or complicated account systems until the core schedule works well.

## 2. MVP Scope

### Core features
- Dashboard: today's schedule, next class, overdue tasks, upcoming deadlines, study metrics, and quick Focus Mode launcher.
- Course management: add/edit/delete courses; course code, title, credits, color, and instructor (optional).
- Weekly timetable: days and time slots; support recurring classes and labs.
- Study planner: dedicated module with Weekly Plan, Subjects (goals & topics), Focus Mode (timer with persistent session state), and Study History.
- Task management: assignments, reading, revision, projects, and exams with due dates and priorities.
- Calendar views: day, week, and month with color-coded categories (Classes: Blue, Study: Green, Tasks/Assignments: Orange, Exams: Red) and toggleable filters.
- Reminders: in-app reminders initially; browser notifications only if supported and permission is granted.
- Progress: mark tasks and study goals complete; view course/task/study progress.
- Responsive design: usable on phone, tablet, and desktop (sidebar to mobile bottom nav).
- Data persistence: save locally so data survives refresh and browser restart.

### Explicitly out of scope for Version 1
- AI tutor or AI schedule generation
- Social/group study features
- Payments
- Complex analytics
- Multi-user collaboration
- Backend/cloud sync
- Native mobile app

## 3. Recommended Simple Stack

- **Frontend:** React + TypeScript + Vite
- **UI styling:** Tailwind CSS
- **Icons:** Lucide
- **Date/time:** date-fns
- **Storage:** localStorage / IndexedDB for structured local data
- **Testing:** Production build verification and manual test plan
- **Deployment:** Vercel or Netlify

Keep the app frontend-only for the MVP. This reduces deployment, security, and maintenance burden. Add a backend only if cross-device sync, accounts, or shared calendars become real requirements.

## 4. Primary User Flows

### A. First-time setup
1. User opens app.
2. User adds courses.
3. User enters recurring class times.
4. User sets preferred study hours and unavailable hours.
5. App displays the weekly schedule.

### B. Create a task
1. Select course (optional).
2. Enter title and task type.
3. Set due date/time and priority.
4. Add estimated duration.
5. Save.
6. Task appears in Today, Upcoming, and course views.

### C. Plan a study session & weekly plan ("Plan My Week")
1. Open Study Planner -> Weekly Plan or click "Plan My Week".
2. Review commitments (classes, labs, exams, assignment deadlines).
3. Select courses, topics, and study type (Learning, Revision, Practice, Assignment, Exam Prep, Catch-up).
4. System detects conflicts and suggests available time slots without overloading.
5. Confirm and add sessions to timetable and study schedule.

### D. Focus Mode Execution
1. Select a scheduled study session or start an ad-hoc session.
2. Configure focus ratio (50/10, 25/5, 45/10, 60/10, or custom).
3. Focus timer runs with pause/resume support; continues uninterrupted if navigating app screens.
4. Take notes during study.
5. Complete session; system records actual focused minutes and updates progress.

### E. Missed Session Recovery
1. System identifies overdue planned study sessions without creating panic or blanket auto-moves.
2. In-app recovery prompt offers: Reschedule to an open slot, Complete now, Skip, or Split into shorter sessions.
3. Checks availability to avoid timetable collisions.

### F. Weekly review & history
1. Inspect Study History: completed sessions, actual vs. target hours by course, daily activity.
2. Review next week's exams and deadlines.
3. Adjust study goals and topics for the coming week.

## 5. Data Model (Extended MVP)

### Course
- id
- code
- title
- credits
- color
- instructor (optional)
- notes (optional)

### Event (ScheduleEvent)
- id
- title
- type: class | lab | study | exam | personal
- courseId (optional)
- date (YYYY-MM-DD)
- startTime (HH:mm)
- endTime (HH:mm)
- dayOfWeek (optional for recurring)
- isRecurring (optional)
- location (optional)
- notes (optional)

### Task
- id
- title
- courseId (optional)
- type: assignment | reading | revision | project | exam-prep | other
- dueAt (ISO string)
- priority: low | medium | high
- estimatedMinutes (optional)
- status: todo | in-progress | completed
- notes (optional)

### StudySession
- id: string
- courseId: string
- topic: string
- studyType: 'learning' | 'revision' | 'practice' | 'assignment' | 'exam-prep' | 'catch-up'
- date: string (YYYY-MM-DD)
- startTime: string (HH:mm)
- endTime: string (HH:mm)
- durationMinutes: number
- goal: string
- status: 'planned' | 'in-progress' | 'completed' | 'missed' | 'skipped'
- actualDurationMinutes: number
- notes?: string
- createdAt: string
- updatedAt: string

### StudyGoal
- id: string
- courseId: string
- weeklyTargetMinutes: number
- priority: 'low' | 'medium' | 'high'
- createdAt: string
- updatedAt: string

### StudyTopic
- id: string
- courseId: string
- title: string
- description?: string
- status: 'not-started' | 'in-progress' | 'completed'
- priority: 'low' | 'medium' | 'high'

### StudyAvailability
- id: string
- dayOfWeek: number (0=Sun, 1=Mon, ..., 6=Sat)
- startTime: string (HH:mm)
- endTime: string (HH:mm)
- isAvailable: boolean

### UserSettings
- studyHoursStart
- studyHoursEnd
- availableDays
- defaultFocusDuration (minutes)
- defaultBreakDuration (minutes)
- notificationsEnabled
- theme

## 6. UX / Design Direction
- Minimal, calm interface; no clutter.
- Sidebar/navigation: Dashboard, Calendar, Tasks, Courses, Study Planner, Settings.
- Dashboard highlights **what to do next** and actionable study timers.
- Visual event color code:
  - Blue: University classes & labs
  - Green: Study sessions
  - Orange: Assignments and tasks
  - Red: Exams
- Clean empty and loading states.
- High accessibility, responsive on all devices.

## 7. Suggested Screens
1. **Dashboard** — Today's timetable, next upcoming class/study session, priority tasks, study progress, Quick-Add.
2. **Calendar** — Day/week/month views; category visibility toggles (Classes, Study, Tasks, Exams).
3. **Tasks** — Filters by due date, course, status, priority, type.
4. **Courses** — Course list, details, related timetable and tasks.
5. **Study Planner** — Sub-tabs: Weekly Plan, Subjects, Focus Mode, Study History, plus "Plan My Week" assistant.
6. **Settings** — Study preferences, study window, notifications, export/import.

## 8. Milestones & Phases

### Milestone 0 — Project Setup & App Shell (Completed)
- React 19 + TypeScript + Vite + Tailwind CSS v4 setup.
- App shell with desktop sidebar & mobile navigation.

### Milestone 1 — Core Modules (Completed)
- Courses CRUD & color badges.
- Weekly timetable & time grid.
- Tasks CRUD, statuses, filters.
- Calendar Day/Week/Month views.
- Settings & Data Backup/Restore.

### Milestone 2 — Study Planner Architecture & Data Design (Phase 1 & 2)
- Formalize Study Planner entity types: StudySession, StudyGoal, StudyTopic, StudyAvailability.
- Extend AppContext and local storage sync with backwards compatibility.

### Milestone 3 — Weekly Plan & Session Management (Phase 3)
- Monday-Sunday time-based study grid.
- Session CRUD with collision detection (university classes & other study sessions).
- "Plan My Week" workflow and Missed Session Recovery workflow.

### Milestone 4 — Subjects & Study Goals (Phase 4)
- Per-course study target configuration (individual weekly study hours).
- Topic roadmap (to study vs. completed).
- Associated assignments and upcoming exams view.

### Milestone 5 — Focus Mode (Phase 5)
- Dedicated execution interface with focus/break presets (50/10, 25/5, 45/10, 60/10, custom).
- Persistent timer state surviving tab navigation.
- Actual duration logging and session completion.

### Milestone 6 — Study History & Progress Tracking (Phase 6)
- Activity log of completed sessions and total hours.
- Study hours breakdown by course vs. target.
- Objective progress indicators without misleading productivity metrics.

### Milestone 7 — Cross-Module Integrations & Polish (Phase 7 & 8)
- Update Dashboard with today's study target, next study session, and "Start Studying" action.
- Harmonize Calendar event colors (Blue/Green/Orange/Red) with toggleable visibility.
- Comprehensive testing (conflicts, timer persistence, recovery, data import/export).
