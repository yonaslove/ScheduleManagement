import React, { useState } from 'react';
import { 
  AlertCircle, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Check, 
  X, 
  Split, 
  RotateCcw 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudySession, Course } from '../../types';
import { addDays, format } from 'date-fns';

interface MissedSessionModalProps {
  session: StudySession;
  onClose: () => void;
}

export const MissedSessionModal: React.FC<MissedSessionModalProps> = ({ session, onClose }) => {
  const { 
    courses, 
    updateStudySession, 
    rescheduleSession, 
    addStudySession, 
    checkScheduleConflict,
    startFocusSession 
  } = useApp();

  const [mode, setMode] = useState<'options' | 'reschedule' | 'split'>('options');
  const [targetDate, setTargetDate] = useState(() => {
    const tomorrow = addDays(new Date(), 1);
    return format(tomorrow, 'yyyy-MM-dd');
  });
  const [targetStartTime, setTargetStartTime] = useState('16:00');
  const [targetEndTime, setTargetEndTime] = useState('17:30');
  const [conflictWarning, setConflictWarning] = useState<string>('');

  const course = courses.find((c: Course) => c.id === session.courseId);

  // 1. Complete Now Action
  const handleCompleteNow = () => {
    startFocusSession(session.id, session.courseId, session.topic, session.goal, session.durationMinutes);
    onClose();
  };

  // 2. Skip Session Action
  const handleSkip = () => {
    updateStudySession(session.id, {
      status: 'skipped',
      notes: (session.notes ? session.notes + '\n' : '') + 'Skipped during missed session review.',
    });
    onClose();
  };

  // 3. Reschedule Action
  const handleReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    const conflict = checkScheduleConflict(targetDate, targetStartTime, targetEndTime, undefined, session.id);
    if (conflict.hasConflict) {
      setConflictWarning(`Conflict detected with: ${conflict.conflicts[0].title} (${conflict.conflicts[0].time})`);
      return;
    }

    rescheduleSession(session.id, targetDate, targetStartTime, targetEndTime);
    onClose();
  };

  // 4. Split Session into two shorter sessions
  const handleSplit = () => {
    const halfDuration = Math.round(session.durationMinutes / 2);
    const date1 = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const date2 = format(addDays(new Date(), 2), 'yyyy-MM-dd');

    // First half replaces this session
    rescheduleSession(session.id, date1, '16:00', '16:45');
    updateStudySession(session.id, {
      topic: `${session.topic} (Part 1)`,
      durationMinutes: halfDuration,
      status: 'planned',
    });

    // Second half created as a new session
    addStudySession({
      courseId: session.courseId,
      topic: `${session.topic} (Part 2)`,
      studyType: 'catch-up',
      date: date2,
      startTime: '16:00',
      endTime: '16:45',
      durationMinutes: halfDuration,
      goal: `Complete second half of ${session.topic}`,
      status: 'planned',
      actualDurationMinutes: 0,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-500">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recover Missed Session
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl">
            <div className="flex items-center gap-2">
              {course && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${course.color}20`, color: course.color }}
                >
                  {course.code}
                </span>
              )}
              <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                {session.topic}
              </h4>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Was planned for {session.date} ({session.startTime} - {session.endTime}). Choose how you want to handle this session without overloading your schedule.
            </p>
          </div>

          {mode === 'options' && (
            <div className="space-y-2.5">
              <button
                onClick={handleCompleteNow}
                className="w-full p-3 rounded-xl border border-indigo-200 dark:border-indigo-900/60 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 flex items-center justify-between transition cursor-pointer text-left"
              >
                <div>
                  <h5 className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                    Complete Right Now in Focus Mode
                  </h5>
                  <p className="text-[11px] text-slate-400">Launch timer immediately</p>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-600" />
              </button>

              <button
                onClick={() => setMode('reschedule')}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between transition cursor-pointer text-left"
              >
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-white">
                    Reschedule to an Available Slot
                  </h5>
                  <p className="text-[11px] text-slate-400">Pick date & time with conflict check</p>
                </div>
                <Calendar className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={handleSplit}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between transition cursor-pointer text-left"
              >
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-white">
                    Split into Two Shorter Sessions
                  </h5>
                  <p className="text-[11px] text-slate-400">Two {Math.round(session.durationMinutes / 2)}-minute manageable sessions</p>
                </div>
                <Split className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={handleSkip}
                className="w-full p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-500 hover:text-slate-800 flex items-center justify-between transition cursor-pointer text-left"
              >
                <div>
                  <h5 className="text-xs font-medium">Skip this Session</h5>
                  <p className="text-[11px] text-slate-400">Keep records clean without penalty</p>
                </div>
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}

          {mode === 'reschedule' && (
            <form onSubmit={handleReschedule} className="space-y-4">
              {conflictWarning && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-200 dark:border-red-900/40">
                  {conflictWarning}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => {
                    setTargetDate(e.target.value);
                    setConflictWarning('');
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={targetStartTime}
                    onChange={(e) => {
                      setTargetStartTime(e.target.value);
                      setConflictWarning('');
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={targetEndTime}
                    onChange={(e) => {
                      setTargetEndTime(e.target.value);
                      setConflictWarning('');
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setMode('options')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Reschedule Session
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
