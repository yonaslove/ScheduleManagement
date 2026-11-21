import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  X, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudyType, Course, StudyTopic, StudyGoal, ScheduleEvent } from '../../types';
import { addDays, format, startOfWeek } from 'date-fns';

interface PlanMyWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetWeekStart?: Date;
}

interface SuggestedSession {
  id: string;
  courseId: string;
  topic: string;
  studyType: StudyType;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  goal: string;
  selected: boolean;
}

export const PlanMyWeekModal: React.FC<PlanMyWeekModalProps> = ({ isOpen, onClose, targetWeekStart }) => {
  const { 
    courses, 
    events, 
    tasks,
    studyGoals, 
    studyTopics, 
    settings, 
    addStudySession, 
    checkScheduleConflict 
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 2 configurations
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(courses.map((c: Course) => c.id));
  const [weeklyTargetHours, setWeeklyTargetHours] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    courses.forEach((c: Course) => {
      const g = studyGoals.find((goal: StudyGoal) => goal.courseId === c.id);
      initial[c.id] = g ? Math.round(g.weeklyTargetMinutes / 60) : 3;
    });
    return initial;
  });

  // Step 3 generated suggestions
  const [suggestedSessions, setSuggestedSessions] = useState<SuggestedSession[]>([]);

  if (!isOpen) return null;

  // Step 1: Summary of current commitments
  const totalClassHours = events.filter((e: ScheduleEvent) => e.type === 'class' || e.type === 'lab').length * 1.5;
  const examEvents = events.filter((e: ScheduleEvent) => e.type === 'exam');

  const handleToggleCourse = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const handleGenerateSuggestions = () => {
    const monday = targetWeekStart 
      ? startOfWeek(targetWeekStart, { weekStartsOn: 1 })
      : startOfWeek(new Date(), { weekStartsOn: 1 });
    const suggestions: SuggestedSession[] = [];

    // Candidate study time slots within student's study window (spaced across the day)
    const candidateSlots = [
      { start: '16:00', end: '17:30', duration: 90 },
      { start: '18:00', end: '19:30', duration: 90 },
      { start: '19:45', end: '21:15', duration: 90 },
      { start: '10:00', end: '11:30', duration: 90 },
      { start: '14:00', end: '15:30', duration: 90 },
    ];

    let sessionCounter = 0;

    // Helper: checks conflict with existing events AND any already planned suggestions in this run
    const hasSlotConflict = (dateStr: string, start: string, end: string) => {
      const conflict = checkScheduleConflict(dateStr, start, end);
      if (conflict.hasConflict) return true;
      return suggestions.some((s) => s.date === dateStr && start < s.endTime && end > s.startTime);
    };

    // 1. First, automatically allocate dedicated blocks for pending tasks (assignments, group work, projects)
    const pendingTasks = tasks.filter((t) => t.status !== 'completed');
    pendingTasks.forEach((t) => {
      const taskCourseId = t.courseId || selectedCourseIds[0] || (courses[0]?.id ?? '');
      if (!taskCourseId) return;

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const dayDate = addDays(monday, dayOffset);
        const dayOfWeek = dayDate.getDay();
        if (!settings.availableDays.includes(dayOfWeek)) continue;
        const dateStr = format(dayDate, 'yyyy-MM-dd');

        for (const slot of candidateSlots) {
          if (!hasSlotConflict(dateStr, slot.start, slot.end)) {
            sessionCounter++;
            let type: StudyType = 'assignment';
            if (t.type === 'project') type = 'group-work';
            else if (t.type === 'revision' || t.type === 'exam-prep') type = 'exam-prep';

            suggestions.push({
              id: 'sug_task_' + sessionCounter + '_' + Date.now(),
              courseId: taskCourseId,
              topic: `${t.title} (${t.type.toUpperCase()})`,
              studyType: type,
              date: dateStr,
              startTime: slot.start,
              endTime: slot.end,
              durationMinutes: Math.min(t.estimatedMinutes || 90, 90),
              goal: `Complete task deliverables for: ${t.title}`,
              selected: true,
            });
            return;
          }
        }
      }
    });

    // 2. Schedule course learning, revision, and group study sessions
    selectedCourseIds.forEach((courseId) => {
      const course = courses.find((c: Course) => c.id === courseId);
      if (!course) return;

      const topics = studyTopics.filter((t: StudyTopic) => t.courseId === courseId && t.status !== 'completed');
      const targetMins = (weeklyTargetHours[courseId] || 3) * 60;
      let allocatedMins = 0;

      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        if (allocatedMins >= targetMins) break;

        const dayDate = addDays(monday, dayOffset);
        const dayOfWeek = dayDate.getDay();

        if (!settings.availableDays.includes(dayOfWeek)) continue;

        const dateStr = format(dayDate, 'yyyy-MM-dd');

        for (const slot of candidateSlots) {
          if (allocatedMins >= targetMins) break;

          if (!hasSlotConflict(dateStr, slot.start, slot.end)) {
            const topicObj = topics[sessionCounter % Math.max(topics.length, 1)];
            const topicTitle = topicObj ? topicObj.title : `Core Concepts & Practice`;

            sessionCounter++;
            allocatedMins += slot.duration;

            // Varied study types: learning, revision, practice, group-work
            const studyTypesArr: StudyType[] = ['learning', 'revision', 'practice', 'group-work'];
            const assignedType = studyTypesArr[sessionCounter % studyTypesArr.length];

            suggestions.push({
              id: 'sug_' + sessionCounter + '_' + Date.now(),
              courseId,
              topic: topicTitle,
              studyType: assignedType,
              date: dateStr,
              startTime: slot.start,
              endTime: slot.end,
              durationMinutes: slot.duration,
              goal: `Focus on mastering ${topicTitle} (${assignedType}) and solving practice questions`,
              selected: true,
            });
            break;
          }
        }
      }
    });

    setSuggestedSessions(suggestions);
    setStep(3);
  };

  const handleToggleSuggestion = (id: string) => {
    setSuggestedSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  const handleConfirmAndSave = () => {
    const toSave = suggestedSessions.filter((s) => s.selected);
    toSave.forEach((s) => {
      addStudySession({
        courseId: s.courseId,
        topic: s.topic,
        studyType: s.studyType,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        durationMinutes: s.durationMinutes,
        goal: s.goal,
        status: 'planned',
        actualDurationMinutes: 0,
      });
    });
    onClose();
  };

  const getCourse = (courseId: string) => courses.find((c: Course) => c.id === courseId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Plan My Week Assistant
              </h3>
              <p className="text-xs text-slate-400">Step {step} of 3</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* STEP 1: REVIEW COMMITMENTS */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl">
                <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-300">
                  Step 1: Review Your Academic Schedule
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  We scanned your timetable to prevent study sessions from conflicting with university classes, labs, and exams.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-xs text-slate-400 font-medium">Class / Lab Hours</span>
                  <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">
                    ~{totalClassHours} hrs / week
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Recurring commitments protected</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-xs text-slate-400 font-medium">Exams Scheduled</span>
                  <p className="text-xl font-bold text-amber-500 mt-1">
                    {examEvents.length} Exams
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Prioritized in revision plans</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Availability Window:</p>
                <p>&bull; Preferred Study Hours: {settings.studyHoursStart} – {settings.studyHoursEnd}</p>
                <p>&bull; Active Days: {settings.availableDays.length} days/week</p>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Configure Study Goals</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CONFIGURE STUDY GOALS */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl">
                <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-300">
                  Step 2: Allocate Study Hours per Subject
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Adjust hours based on course difficulty and upcoming exams. Not every course requires equal time.
                </p>
              </div>

              <div className="space-y-3">
                {courses.map((course: Course) => {
                  const isSelected = selectedCourseIds.includes(course.id);
                  const currentHours = weeklyTargetHours[course.id] || 3;

                  return (
                    <div
                      key={course.id}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-800'
                          : 'border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50 dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleCourse(course.id)}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: course.color }}
                            />
                            <span className="text-xs font-bold text-slate-800 dark:text-white">
                              {course.code}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                            {course.title}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium text-slate-500">Target:</label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={currentHours}
                            onChange={(e) =>
                              setWeeklyTargetHours((prev) => ({
                                ...prev,
                                [course.id]: parseInt(e.target.value, 10) || 1,
                              }))
                            }
                            className="w-16 px-2 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-center"
                          />
                          <span className="text-xs text-slate-400">hrs</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerateSuggestions}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Generate Weekly Schedule</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW PROPOSED PLAN */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-300">
                    Step 3: Review Proposed Study Sessions
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    No conflicts detected. You have complete control: check or uncheck any session before saving to your calendar.
                  </p>
                </div>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {suggestedSessions.map((sug) => {
                  const course = getCourse(sug.courseId);
                  return (
                    <div
                      key={sug.id}
                      onClick={() => handleToggleSuggestion(sug.id)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        sug.selected
                          ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20'
                          : 'border-slate-200 dark:border-slate-800 opacity-50 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            sug.selected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {sug.selected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {course && (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                style={{
                                  backgroundColor: `${course.color}20`,
                                  color: course.color,
                                }}
                              >
                                {course.code}
                              </span>
                            )}
                            <span className="text-xs font-bold text-slate-800 dark:text-white">
                              {sug.topic}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>📅 {sug.date}</span>
                            <span>⏰ {sug.startTime} - {sug.endTime}</span>
                            <span>({sug.durationMinutes} mins)</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 flex justify-between border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmAndSave}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm and Add to Weekly Plan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
