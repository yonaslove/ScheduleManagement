import React from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Plus, 
  CheckSquare,
  Play,
  Flame,
  BookOpen,
  Target
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';

export const DashboardScreen: React.FC = () => {
  const { 
    events, 
    tasks, 
    courses, 
    setCurrentScreen, 
    setPlannerSubSection,
    setQuickAddOpen, 
    toggleTaskStatus,
    studySessions,
    studyGoals,
    startFocusSession,
    focusState
  } = useApp();

  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const currentDayOfWeek = now.getDay();
  const currentTimeStr = format(now, 'HH:mm');

  // Today's classes & events
  const todaysEvents = events.filter((ev) => {
    if (ev.isRecurring && ev.dayOfWeek !== undefined) {
      return ev.dayOfWeek === currentDayOfWeek;
    }
    return ev.date === todayStr;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Next upcoming class / event today
  const nextUpcomingEvent = todaysEvents.find((ev) => ev.startTime >= currentTimeStr) || todaysEvents[0];

  // Today's planned study sessions
  const todaysStudySessions = studySessions.filter((s) => s.date === todayStr);
  const nextStudySession = todaysStudySessions.find((s) => s.status === 'planned' && s.startTime >= currentTimeStr) || todaysStudySessions.find((s) => s.status === 'planned');

  // Today's study target & actual study hours
  // Aggregated weekly target divided by available days
  const totalWeeklyTargetMinutes = studyGoals.reduce((acc, g) => acc + g.weeklyTargetMinutes, 0);
  const dailyTargetMinutes = Math.round(totalWeeklyTargetMinutes / 6); // ~ daily target
  const todayActualMinutes = todaysStudySessions
    .filter((s) => s.status === 'completed')
    .reduce((acc, s) => acc + (s.actualDurationMinutes || 0), 0);

  // Priority tasks
  const priorityTasks = tasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => {
      const pMap = { high: 0, medium: 1, low: 2 };
      if (pMap[a.priority] !== pMap[b.priority]) {
        return pMap[a.priority] - pMap[b.priority];
      }
      return a.dueAt.localeCompare(b.dueAt);
    })
    .slice(0, 4);

  // Upcoming Exams
  const upcomingExams = events
    .filter((ev) => ev.type === 'exam' && ev.date >= todayStr)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .slice(0, 3);

  const getCourse = (courseId?: string) => courses.find((c) => c.id === courseId);

  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;
  const totalTasksCount = tasks.length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const handleToggle = (id: string, currentStatus: string) => {
    toggleTaskStatus(id);
    if (currentStatus !== 'completed') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  const handleStartStudying = (session?: typeof nextStudySession) => {
    if (session) {
      startFocusSession(session.id, session.courseId, session.topic, session.goal, session.durationMinutes);
    } else {
      startFocusSession(undefined, courses[0]?.id, 'General Study Session', 'Focused learning block', 50);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner / Greeting */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-800 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>{format(now, 'EEEE, MMMM do, yyyy')}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Good {now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'}, Alex! 👋
            </h1>
            <p className="text-indigo-200 text-sm max-w-xl">
              You have <span className="font-semibold text-white">{todaysEvents.length} classes & sessions</span> today,{' '}
              <span className="font-semibold text-white">{todaysStudySessions.length} study blocks</span>, and{' '}
              <span className="font-semibold text-white">{priorityTasks.length} high priority tasks</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
            {/* Start Studying Action */}
            <button
              onClick={() => handleStartStudying(nextStudySession)}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/20 transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{focusState.isRunning ? 'Resume Studying' : 'Start Studying'}</span>
            </button>

            <button
              onClick={() => setQuickAddOpen(true)}
              className="px-4 py-2.5 bg-white text-indigo-900 hover:bg-indigo-50 font-semibold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>Quick Add</span>
            </button>
          </div>
        </div>

        {/* Study Progress Row */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-xs text-indigo-200">Daily Study Target</span>
            <p className="text-lg font-bold text-white mt-0.5">
              {todayActualMinutes} / {dailyTargetMinutes} mins
            </p>
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(Math.round((todayActualMinutes / Math.max(dailyTargetMinutes, 1)) * 100), 100)}%` }}
              />
            </div>
          </div>
          <div>
            <span className="text-xs text-indigo-200">Classes Today</span>
            <p className="text-lg font-bold text-white mt-0.5">{todaysEvents.length} scheduled</p>
          </div>
          <div>
            <span className="text-xs text-indigo-200">Upcoming Exams</span>
            <p className="text-lg font-bold text-amber-300 mt-0.5">{upcomingExams.length} ahead</p>
          </div>
          <div>
            <span className="text-xs text-indigo-200">Task Completion</span>
            <p className="text-lg font-bold text-white mt-0.5">{progressPercent}% done</p>
          </div>
        </div>
      </div>

      {/* Grid: Study Blocks & Timetable | Priority tasks & Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Next Study Session Highlight Card */}
          {nextStudySession ? (
            <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-950/60 rounded-3xl p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 mb-2">
                    <Clock className="w-3 h-3" />
                    Next Study Session ({nextStudySession.startTime} - {nextStudySession.endTime})
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    {nextStudySession.topic}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      const course = getCourse(nextStudySession.courseId);
                      return course ? (
                        <>
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: course.color }}
                          />
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            {course.code} &bull; {course.title}
                          </span>
                        </>
                      ) : null;
                    })()}
                  </div>
                  {nextStudySession.goal && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Goal: {nextStudySession.goal}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleStartStudying(nextStudySession)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Launch Focus</span>
                </button>
              </div>
            </div>
          ) : nextUpcomingEvent && (
            <div className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950/60 rounded-3xl p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 mb-2">
                    <Clock className="w-3 h-3" />
                    Next Up ({nextUpcomingEvent.startTime} - {nextUpcomingEvent.endTime})
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                    {nextUpcomingEvent.title}
                  </h3>
                  {nextUpcomingEvent.courseId && (
                    <div className="flex items-center gap-2 mt-1">
                      {(() => {
                        const course = getCourse(nextUpcomingEvent.courseId);
                        return course ? (
                          <>
                            <span 
                              className="w-2.5 h-2.5 rounded-full" 
                              style={{ backgroundColor: course.color }} 
                            />
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                              {course.code} &bull; {course.title}
                            </span>
                          </>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setCurrentScreen('calendar')}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                >
                  View in Grid
                </button>
              </div>
            </div>
          )}

          {/* Today's Full Schedule */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-bold text-slate-800 dark:text-white">Today's Schedule & Study Sessions</h2>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
                  {todaysEvents.length} events
                </span>
              </div>
              <button
                onClick={() => {
                  setCurrentScreen('planner');
                  setPlannerSubSection('weekly-plan');
                }}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Study Planner
              </button>
            </div>

            {todaysEvents.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarIcon className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No classes or study sessions scheduled for today.</p>
                <button
                  onClick={() => handleStartStudying()}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Start Focus Session
                </button>
              </div>
            ) : (
              <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-3 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                {todaysEvents.map((ev) => {
                  const course = getCourse(ev.courseId);
                  const isCurrent = currentTimeStr >= ev.startTime && currentTimeStr <= ev.endTime;
                  const isStudy = ev.type === 'study';

                  return (
                    <div 
                      key={ev.id}
                      className={`relative pl-8 transition-all p-3 rounded-2xl border ${
                        isCurrent 
                          ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60' 
                          : isStudy
                          ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40'
                          : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/80 hover:border-slate-200'
                      }`}
                    >
                      <span 
                        className={`absolute left-2 top-4 w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-slate-900 ${
                          isStudy ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={course?.color ? { backgroundColor: course.color } : {}}
                      />

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {ev.startTime} - {ev.endTime}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide ${
                              ev.type === 'exam' 
                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' 
                                : ev.type === 'study'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            }`}>
                              {ev.type}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-slate-800 dark:text-white mt-1">
                            {ev.title}
                          </h4>
                          {course && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {course.code} &bull; {course.title}
                            </p>
                          )}
                        </div>

                        {isStudy && (
                          <button
                            onClick={() => startFocusSession(ev.studySessionId, ev.courseId, ev.title)}
                            className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shrink-0 flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Study</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Priority Tasks & Exams (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Priority Tasks */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-base font-bold text-slate-800 dark:text-white">Priority Tasks</h2>
              </div>
              <button
                onClick={() => setCurrentScreen('tasks')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {priorityTasks.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {priorityTasks.map((t) => {
                  const course = getCourse(t.courseId);
                  const isDone = t.status === 'completed';
                  return (
                    <div
                      key={t.id}
                      className="group p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-start gap-3"
                    >
                      <button
                        onClick={() => handleToggle(t.id, t.status)}
                        className="mt-0.5 text-slate-400 hover:text-emerald-500 cursor-pointer"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              t.priority === 'high'
                                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {t.priority}
                          </span>
                          {course && (
                            <span 
                              className="text-[11px] font-semibold truncate"
                              style={{ color: course.color }}
                            >
                              {course.code}
                            </span>
                          )}
                        </div>

                        <p className={`text-xs font-semibold text-slate-800 dark:text-slate-100 mt-1 truncate ${
                          isDone ? 'line-through text-slate-400' : ''
                        }`}>
                          {t.title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Exams Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-800 dark:text-white">Upcoming Exams</h2>
              </div>
            </div>

            {upcomingExams.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No upcoming exams scheduled. Take a breather!
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingExams.map((ex) => {
                  const course = getCourse(ex.courseId);
                  return (
                    <div
                      key={ex.id}
                      className="p-3 rounded-2xl border border-red-200/60 dark:border-red-900/40 bg-red-50/20 dark:bg-red-950/10 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white uppercase tracking-wider">
                          EXAM
                        </span>
                        {course && (
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {course.code}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white mt-1">
                        {ex.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        📅 {ex.date} &bull; ⏰ {ex.startTime} - {ex.endTime}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
