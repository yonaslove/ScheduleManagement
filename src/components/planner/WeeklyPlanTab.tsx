import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  BookOpen, 
  AlertCircle, 
  Sparkles, 
  Trash2, 
  Play, 
  X,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudySession, StudyType, StudySessionStatus } from '../../types';
import { 
  addDays, 
  format, 
  startOfWeek, 
  subDays, 
  isToday 
} from 'date-fns';
import { PlanMyWeekModal } from './PlanMyWeekModal';
import { MissedSessionModal } from './MissedSessionModal';

export const WeeklyPlanTab: React.FC = () => {
  const { 
    studySessions, 
    courses, 
    addStudySession, 
    updateStudySession, 
    deleteStudySession, 
    startFocusSession, 
    checkScheduleConflict 
  } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [planMyWeekOpen, setPlanMyWeekOpen] = useState(false);
  const [selectedMissedSession, setSelectedMissedSession] = useState<StudySession | null>(null);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form states for new/edit study session
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [topic, setTopic] = useState('');
  const [studyType, setStudyType] = useState<StudyType>('learning');
  const [sessionDate, setSessionDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('16:00');
  const [endTime, setEndTime] = useState('17:30');
  const [goal, setGoal] = useState('');
  const [notes, setNotes] = useState('');
  const [conflictWarning, setConflictWarning] = useState<string>('');

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Mon to Sun
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Time grid hours: 07:00 to 22:00
  const hours = Array.from({ length: 16 }, (_, i) => i + 7);

  const getCourse = (cId: string) => courses.find((c) => c.id === cId);

  // Missed sessions awaiting review
  const missedSessions = studySessions.filter((s) => s.status === 'missed');

  const openCreateModalForDay = (dateStr: string) => {
    setEditingSession(null);
    setCourseId(courses[0]?.id || '');
    setTopic('');
    setStudyType('learning');
    setSessionDate(dateStr);
    setStartTime('16:00');
    setEndTime('17:30');
    setGoal('');
    setNotes('');
    setConflictWarning('');
    setIsNewModalOpen(true);
  };

  const openEditModal = (session: StudySession) => {
    setEditingSession(session);
    setCourseId(session.courseId);
    setTopic(session.topic);
    setStudyType(session.studyType);
    setSessionDate(session.date);
    setStartTime(session.startTime);
    setEndTime(session.endTime);
    setGoal(session.goal);
    setNotes(session.notes || '');
    setConflictWarning('');
    setIsNewModalOpen(true);
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    // Check conflict with university classes or existing study sessions
    const conflict = checkScheduleConflict(
      sessionDate, 
      startTime, 
      endTime, 
      undefined, 
      editingSession ? editingSession.id : undefined
    );

    if (conflict.hasConflict) {
      setConflictWarning(
        `Schedule collision with: ${conflict.conflicts[0].title} (${conflict.conflicts[0].time})`
      );
      return;
    }

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const duration = (endH * 60 + endM) - (startH * 60 + startM);

    if (editingSession) {
      updateStudySession(editingSession.id, {
        courseId,
        topic: topic.trim(),
        studyType,
        date: sessionDate,
        startTime,
        endTime,
        durationMinutes: Math.max(duration, 30),
        goal: goal.trim(),
        notes: notes.trim() || undefined,
      });
    } else {
      addStudySession({
        courseId,
        topic: topic.trim(),
        studyType,
        date: sessionDate,
        startTime,
        endTime,
        durationMinutes: Math.max(duration, 30),
        goal: goal.trim(),
        status: 'planned',
        actualDurationMinutes: 0,
        notes: notes.trim() || undefined,
      });
    }

    setIsNewModalOpen(false);
  };

  const getPositionStyles = (sTime: string, eTime: string) => {
    const [startH, startM] = sTime.split(':').map(Number);
    const [endH, endM] = eTime.split(':').map(Number);

    const startMinutes = (startH - 7) * 60 + startM;
    const endMinutes = (endH - 7) * 60 + endM;
    const duration = Math.max(endMinutes - startMinutes, 30);

    const top = (startMinutes * 56) / 60;
    const height = (duration * 56) / 60;

    return { top: `${top}px`, height: `${height}px` };
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Top Banner & Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Navigation */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentDate((d) => subDays(d, 7))}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
            >
              This Week
            </button>
            <button
              onClick={() => setCurrentDate((d) => addDays(d, 7))}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {format(weekDays[0], 'MMM d')} – {format(weekDays[6], 'MMM d, yyyy')}
          </h2>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={() => setPlanMyWeekOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Plan My Week</span>
          </button>

          <button
            onClick={() => openCreateModalForDay(format(new Date(), 'yyyy-MM-dd'))}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Session</span>
          </button>
        </div>
      </div>

      {/* Missed Sessions Recovery Notice Banner */}
      {missedSessions.length > 0 && (
        <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                You have {missedSessions.length} missed study session{missedSessions.length > 1 ? 's' : ''}
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Reschedule without overloading your timetable or skip to keep your progress accurate.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {missedSessions.slice(0, 2).map((ms) => (
              <button
                key={ms.id}
                onClick={() => setSelectedMissedSession(ms)}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 text-amber-900 dark:text-amber-200 text-xs font-bold rounded-xl border border-amber-200 dark:border-amber-800 shadow-xs hover:bg-amber-50 cursor-pointer truncate max-w-[150px]"
              >
                Recover: {ms.topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Study Time Grid (Mon-Sun) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Days Header */}
          <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
            <div className="p-3 text-center border-r border-slate-100 dark:border-slate-800 text-xs text-slate-400 font-medium">
              Time
            </div>
            {weekDays.map((day) => {
              const today = isToday(day);
              return (
                <div
                  key={day.toISOString()}
                  className={`p-3 text-center border-r border-slate-100 dark:border-slate-800 last:border-r-0 ${
                    today ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    {format(day, 'EEE')}
                  </span>
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 mt-0.5 rounded-full text-xs font-bold ${
                      today ? 'bg-indigo-600 text-white' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Grid Body */}
          <div className="relative grid grid-cols-[64px_repeat(7,1fr)]">
            {/* Time labels */}
            <div className="border-r border-slate-100 dark:border-slate-800">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-14 text-[11px] font-medium text-slate-400 flex items-start justify-center pt-1 border-b border-slate-100 dark:border-slate-800/80"
                >
                  {String(hour).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* 7 Day Columns */}
            {weekDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const today = isToday(day);
              const daySessions = studySessions.filter((s) => s.date === dateStr);

              return (
                <div
                  key={day.toISOString()}
                  className={`relative border-r border-slate-100 dark:border-slate-800 last:border-r-0 ${
                    today ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                  }`}
                >
                  {/* Hour slots */}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      onClick={() => openCreateModalForDay(dateStr)}
                      className="h-14 border-b border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition cursor-pointer"
                    />
                  ))}

                  {/* Study Session Blocks */}
                  {daySessions.map((session) => {
                    const course = getCourse(session.courseId);
                    const pos = getPositionStyles(session.startTime, session.endTime);
                    const isDone = session.status === 'completed';
                    const isMissed = session.status === 'missed';
                    const baseColor = course?.color || '#10b981';

                    return (
                      <div
                        key={session.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isMissed) {
                            setSelectedMissedSession(session);
                          } else {
                            openEditModal(session);
                          }
                        }}
                        style={{
                          ...pos,
                          borderLeft: `4px solid ${isMissed ? '#f59e0b' : baseColor}`,
                          backgroundColor: isMissed ? '#fef3c730' : `${baseColor}15`,
                        }}
                        className={`absolute inset-x-1 p-2 rounded-r-xl overflow-hidden cursor-pointer hover:shadow-md transition-all z-5 border-t border-r border-b ${
                          isDone ? 'opacity-60' : ''
                        } border-slate-200/60 dark:border-slate-700/60`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className="text-[10px] font-bold uppercase truncate"
                            style={{ color: isMissed ? '#d97706' : baseColor }}
                          >
                            {course ? course.code : 'Study'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {session.startTime}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">
                          {session.topic}
                        </h4>

                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                            {session.studyType}
                          </span>
                          {isMissed && (
                            <span className="text-[9px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-950 px-1 py-0.5 rounded">
                              MISSED
                            </span>
                          )}
                          {isDone && (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-1 py-0.5 rounded">
                              DONE ({session.actualDurationMinutes}m)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Plan My Week Assistant Modal */}
      <PlanMyWeekModal
        isOpen={planMyWeekOpen}
        onClose={() => setPlanMyWeekOpen(false)}
        targetWeekStart={currentDate}
      />

      {/* Missed Session Recovery Modal */}
      {selectedMissedSession && (
        <MissedSessionModal
          session={selectedMissedSession}
          onClose={() => setSelectedMissedSession(null)}
        />
      )}

      {/* Add / Edit Study Session Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingSession ? 'Edit Study Session' : 'Plan Study Session'}
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="mt-4 space-y-4">
              {conflictWarning && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-200 dark:border-red-900/40">
                  {conflictWarning}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Study Topic *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graph Traversal Algorithms or Eigenvectors practice"
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    setConflictWarning('');
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course
                  </label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Session Type
                  </label>
                  <select
                    value={studyType}
                    onChange={(e) => setStudyType(e.target.value as StudyType)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    <option value="learning">Learning</option>
                    <option value="revision">Revision</option>
                    <option value="practice">Practice</option>
                    <option value="assignment">Assignment</option>
                    <option value="group-work">Group Work</option>
                    <option value="exam-prep">Exam Preparation</option>
                    <option value="catch-up">Catch-up</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={sessionDate}
                    onChange={(e) => {
                      setSessionDate(e.target.value);
                      setConflictWarning('');
                    }}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      setConflictWarning('');
                    }}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      setConflictWarning('');
                    }}
                    className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Goal / Desired Outcome
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master problem set 4 and write down formula sheet"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="References, textbook chapters..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                {editingSession ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        deleteStudySession(editingSession.id);
                        setIsNewModalOpen(false);
                      }}
                      className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl"
                    >
                      Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        startFocusSession(
                          editingSession.id, 
                          editingSession.courseId, 
                          editingSession.topic, 
                          editingSession.goal, 
                          editingSession.durationMinutes
                        );
                        setIsNewModalOpen(false);
                      }}
                      className="px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-xl flex items-center gap-1"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Now</span>
                    </button>
                  </div>
                ) : <div />}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                  >
                    Save Session
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

