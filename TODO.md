# Modern Simple Schedule Management System — TODO

## Phase 0 — Setup (Completed)
- [x] Create repository and README.
- [x] Initialize React + TypeScript + Vite.
- [x] Add Tailwind CSS.
- [x] Install Lucide and date-fns.
- [x] Create responsive app shell/navigation (desktop sidebar & mobile bottom bar).

## Phase 1 — Course Management (Completed)
- [x] Define Course type and schema.
- [x] Build course list page.
- [x] Build add/edit course form.
- [x] Add course color selection.
- [x] Add delete confirmation.
- [x] Persist course data in localStorage.
- [x] Seed optional sample data.

## Phase 2 — Weekly Timetable & Calendar (Completed)
- [x] Define Event type and schema.
- [x] Build weekly timetable view and 7-day time grid (07:00 - 22:00).
- [x] Add recurring weekly class events and one-time events.
- [x] Add create/edit/delete event modal.
- [x] Add Day, Week, and Month views.
- [x] Add Next/Previous navigation and Today jump.

## Phase 3 — Tasks and Deadlines (Completed)
- [x] Define Task type and schema.
- [x] Build task list page with search.
- [x] Add task types (assignment, reading, revision, project, exam prep).
- [x] Add priority, due date, duration, and status (To do, In progress, Completed).
- [x] Filter tasks by course, status, priority, and task type.
- [x] Confetti completion micro-interaction.

## Phase 4 — Settings and Backup (Completed)
- [x] Add study window start and end hours.
- [x] Add available study days selection.
- [x] Add theme preference (Light, Dark, System).
- [x] Add notification preference check.
- [x] Export application data as JSON.
- [x] Import JSON backup with validation.
- [x] Reset demo data option.

---

## STUDY PLANNER MODULE IMPLEMENTATION (Completed)

### Phase 1 — Inspection & Documentation Alignment (Completed)
- [x] Inspect existing architecture, models, AppContext, and components.
- [x] Update ROADMAP.md with complete Study Planner specifications.
- [x] Update TODO.md with detailed multi-phase milestone tracking.

### Phase 2 — Data Models & Architecture Extension (Completed)
- [x] Define `StudySession` type and statuses (`planned`, `in-progress`, `completed`, `missed`, `skipped`).
- [x] Define `StudyGoal` type (per-course weekly target minutes, priority).
- [x] Define `StudyTopic` type (courseId, title, description, status, priority).
- [x] Define `StudyAvailability` and `ActiveFocusState` types.
- [x] Update `AppContext` with CRUD, collision detection, and persistent localStorage sync.
- [x] Seed initial study goals, topics, and planned sessions for demo courses.

### Phase 3 — Weekly Plan & Session Management (Completed)
- [x] Build `StudyPlannerScreen` with section navigation tabs: Weekly Plan, Subjects, Focus Mode, Study History.
- [x] Build Weekly Study Grid (Monday-Sunday, time grid, course-coded cards).
- [x] Display session topic, duration, study type, goal, and status.
- [x] Add/Edit/Delete/Reschedule study session modal.
- [x] Collision & Overlap Detection:
  - [x] Detect overlapping study sessions.
  - [x] Detect conflicts with university classes and labs.
  - [x] Show clear warning banners before saving.
- [x] Implement "Plan My Week" guided assistant (review commitments -> set targets -> suggest open slots -> review and confirm).
- [x] Implement Missed Session Recovery workflow:
  - [x] Detect and flag missed past sessions.
  - [x] Offer reschedule to available slot, complete now in Focus Mode, skip, or split into shorter sessions.

### Phase 4 — Subjects & Study Goals (Completed)
- [x] Build Subjects overview page with course study tabs.
- [x] Configure individual weekly study-hour target for each course.
- [x] Display weekly target vs. actual study hours logged.
- [x] Manage course topics to study (status: not started, in progress, completed).
- [x] Display upcoming examinations and related assignments for each course.

### Phase 5 — Focus Mode Execution (Completed)
- [x] Build Focus Mode interface with course selection, topic, and session goal.
- [x] Implement focus timer with presets (50/10, 25/5, 45/10, 60/10, custom).
- [x] Timer state persistence across route/screen navigation (active in background).
- [x] Accurate time tracking: only count active focus time (exclude paused/break time).
- [x] Session completion form: record actual duration, log study notes, and mark completed.

### Phase 6 — Study History & Progress Tracking (Completed)
- [x] Build Study History screen.
- [x] List completed sessions with dates, topics, courses, and actual duration.
- [x] Aggregate total study hours and breakdown by course vs. target.
- [x] Daily and weekly study activity indicators (honest hours logged, no fake gamification).
- [x] Missed sessions log and tracking.

### Phase 7 — Cross-Module Integration (Completed)
- [x] Update Sidebar with dedicated "Study Planner" navigation item and live timer indicator.
- [x] Update Dashboard:
  - [x] Show today's planned study sessions.
  - [x] Highlight next upcoming study session.
  - [x] Display today's study target vs. actual time.
  - [x] "Start Studying" action button leading directly to Focus Mode.
- [x] Update Calendar:
  - [x] Harmonize color categories: Blue (Classes), Green (Study Sessions), Orange/Purple (Tasks), Red (Exams).
  - [x] Add category visibility toggles to show/hide specific event categories.
  - [x] Maintain single source of truth without duplicated entities.
- [x] Ensure JSON backup/restore exports and imports all study planner data.

### Phase 8 — Quality Assurance & Testing (Completed)
- [x] Test study session CRUD and date navigation.
- [x] Test conflict detection against class timetable.
- [x] Test Focus Mode timer accuracy, pause/resume, and background page switching.
- [x] Test missed session recovery options.
- [x] Test mobile responsiveness on phone and tablet viewports.
- [x] Verify production build (`npm run build` exits 0 with zero TypeScript errors).
