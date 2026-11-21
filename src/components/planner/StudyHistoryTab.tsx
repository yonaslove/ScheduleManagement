import React, { useState } from 'react';
import { 
  History, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  BarChart3, 
  BookOpen, 
  Search, 
  Filter,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { format, parseISO } from 'date-fns';

export const StudyHistoryTab: React.FC = () => {
  const { studySessions, courses, studyGoals } = useApp();

  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const completedSessions = studySessions
    .filter((s) => s.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime));

  const missedSessions = studySessions.filter((s) => s.status === 'missed');

  // Aggregate stats
  const totalActualMinutes = completedSessions.reduce((acc, s) => acc + (s.actualDurationMinutes || 0), 0);
  const totalHours = (totalActualMinutes / 60).toFixed(1);

  const getCourse = (cId: string) => courses.find((c) => c.id === cId);

  // Filtered session records
  const filteredSessions = completedSessions.filter((s) => {
    if (selectedCourseFilter !== 'all' && s.courseId !== selectedCourseFilter) return false;
    if (searchQuery.trim() && !s.topic.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
            <Clock className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Total Focus Time</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalHours} hrs</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Recorded across {completedSessions.length} sessions</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Completed Sessions</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{completedSessions.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Honest recorded focus duration</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <AlertCircle className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Missed Sessions</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{missedSessions.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Tracked for recovery</p>
        </div>
      </div>

      {/* Course Breakdown Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Study Hours by Course vs Target</span>
        </h3>

        <div className="space-y-4">
          {courses.map((course) => {
            const courseCompleted = completedSessions.filter((s) => s.courseId === course.id);
            const actualMins = courseCompleted.reduce((acc, s) => acc + (s.actualDurationMinutes || 0), 0);
            const goal = studyGoals.find((g) => g.courseId === course.id);
            const targetMins = goal?.weeklyTargetMinutes || 180;
            const progress = Math.min(Math.round((actualMins / targetMins) * 100), 100);

            return (
              <div key={course.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: course.color }}
                    />
                    <span className="font-bold text-slate-800 dark:text-white">
                      {course.code} &bull; {course.title}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-500">
                    {(actualMins / 60).toFixed(1)} / {Math.round(targetMins / 60)} hrs ({progress}%)
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%`, backgroundColor: course.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search past study sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
          />
        </div>

        <select
          value={selectedCourseFilter}
          onChange={(e) => setSelectedCourseFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
        >
          <option value="all">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code}
            </option>
          ))}
        </select>
      </div>

      {/* Completed Study Sessions Activity Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
          Session Activity Log
        </h4>

        {filteredSessions.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">
            No completed sessions found matching your filters.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => {
              const course = getCourse(session.courseId);
              return (
                <div
                  key={session.id}
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      {course && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: `${course.color}20`, color: course.color }}
                        >
                          {course.code}
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {session.topic}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 capitalize">
                        {session.studyType}
                      </span>
                    </div>

                    {session.goal && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Goal: {session.goal}
                      </p>
                    )}

                    {session.notes && (
                      <p className="text-[11px] text-slate-400 mt-1.5 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
                        {session.notes}
                      </p>
                    )}
                  </div>

                  <div className="text-right sm:self-center shrink-0 text-xs">
                    <span className="font-bold text-emerald-600 block">
                      {session.actualDurationMinutes} mins studied
                    </span>
                    <span className="text-[11px] text-slate-400">
                      📅 {session.date}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

