import React, { useState } from 'react';
import { 
  BookOpen, 
  Target, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Clock, 
  Calendar, 
  AlertTriangle,
  Play,
  Trash2,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudyTopic, Priority } from '../../types';

export const SubjectsTab: React.FC = () => {
  const { 
    courses, 
    studyGoals, 
    setCourseStudyGoal, 
    studyTopics, 
    addStudyTopic, 
    updateStudyTopic, 
    deleteStudyTopic, 
    studySessions,
    events,
    tasks,
    startFocusSession
  } = useApp();

  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [newTopicModalOpen, setNewTopicModalOpen] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [topicPriority, setTopicPriority] = useState<Priority>('medium');

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const goal = studyGoals.find((g) => g.courseId === selectedCourse?.id);
  const weeklyTargetMins = goal?.weeklyTargetMinutes || 180;

  // Calculate actual hours studied for selected course this current week
  const courseSessions = studySessions.filter((s) => s.courseId === selectedCourse?.id);
  const completedSessions = courseSessions.filter((s) => s.status === 'completed');
  const pendingSessions = courseSessions.filter((s) => s.status === 'planned');
  const actualStudiedMins = completedSessions.reduce((acc, s) => acc + (s.actualDurationMinutes || 0), 0);

  // Topics for selected course
  const topics = studyTopics.filter((t) => t.courseId === selectedCourse?.id);
  const completedTopics = topics.filter((t) => t.status === 'completed');

  // Related exams & assignments
  const courseExams = events.filter((e) => e.type === 'exam' && e.courseId === selectedCourse?.id);
  const courseTasks = tasks.filter((t) => t.courseId === selectedCourse?.id);

  const handleUpdateGoalHours = (hours: number) => {
    if (!selectedCourse) return;
    setCourseStudyGoal(selectedCourse.id, Math.max(hours * 60, 30), goal?.priority || 'medium');
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim() || !selectedCourse) return;

    addStudyTopic({
      courseId: selectedCourse.id,
      title: topicTitle.trim(),
      description: topicDescription.trim() || undefined,
      status: 'not-started',
      priority: topicPriority,
    });

    setTopicTitle('');
    setTopicDescription('');
    setNewTopicModalOpen(false);
  };

  const toggleTopicStatus = (topic: StudyTopic) => {
    const nextStatus = topic.status === 'completed' ? 'not-started' : 'completed';
    updateStudyTopic(topic.id, { status: nextStatus });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Course Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {courses.map((course) => {
          const isSelected = selectedCourse?.id === course.id;
          return (
            <button
              key={course.id}
              onClick={() => setSelectedCourseId(course.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 border ${
                isSelected
                  ? 'bg-white dark:bg-slate-800 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: course.color }}
              />
              <span>{course.code}</span>
            </button>
          );
        })}
      </div>

      {selectedCourse && (
        <div className="space-y-6">
          {/* Top Banner: Course Study Goal Configuration */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden">
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ backgroundColor: selectedCourse.color }}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span
                  className="text-xs font-bold px-2.5 py-0.5 rounded-lg"
                  style={{
                    backgroundColor: `${selectedCourse.color}20`,
                    color: selectedCourse.color,
                  }}
                >
                  {selectedCourse.code}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">
                  {selectedCourse.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Instructor: {selectedCourse.instructor || 'Unassigned'} &bull; {selectedCourse.credits} Credits
                </p>
              </div>

              {/* Goal Setting Widget */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-4">
                <Target className="w-8 h-8 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Weekly Study Target
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={Math.round(weeklyTargetMins / 60)}
                      onChange={(e) => handleUpdateGoalHours(parseInt(e.target.value, 10) || 1)}
                      className="w-16 px-2 py-1 text-sm font-bold text-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      hours / week
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center sm:text-left">
              <div>
                <span className="text-xs text-slate-400">Actual Studied</span>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {(actualStudiedMins / 60).toFixed(1)} / {Math.round(weeklyTargetMins / 60)} hrs
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Completed Sessions</span>
                <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
                  {completedSessions.length} done
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Pending Sessions</span>
                <p className="text-lg font-bold text-slate-800 dark:text-white mt-0.5">
                  {pendingSessions.length} planned
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Topics Mastered</span>
                <p className="text-lg font-bold text-emerald-600 mt-0.5">
                  {completedTopics.length} / {topics.length}
                </p>
              </div>
            </div>
          </div>

          {/* Topics & Examinations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Topics to Study (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                      Curriculum Topics to Study
                    </h4>
                  </div>
                  <button
                    onClick={() => setNewTopicModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1 cursor-pointer hover:bg-indigo-100"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Topic</span>
                  </button>
                </div>

                {topics.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">
                    No learning topics logged yet. Add your curriculum topics above!
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {topics.map((top) => {
                      const isDone = top.status === 'completed';
                      return (
                        <div
                          key={top.id}
                          className={`p-3 rounded-2xl border transition flex items-start justify-between gap-3 ${
                            isDone
                              ? 'border-slate-100 dark:border-slate-800 opacity-60 bg-slate-50/50'
                              : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <button
                              onClick={() => toggleTopicStatus(top)}
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
                                <h5
                                  className={`text-xs font-bold text-slate-800 dark:text-white ${
                                    isDone ? 'line-through text-slate-400' : ''
                                  }`}
                                >
                                  {top.title}
                                </h5>
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                    top.priority === 'high'
                                      ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                  }`}
                                >
                                  {top.priority}
                                </span>
                              </div>
                              {top.description && (
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  {top.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => startFocusSession(undefined, selectedCourse.id, top.title)}
                              className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer"
                              title="Start Focus Session on this topic"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteStudyTopic(top.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                              title="Delete topic"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Exams & Assignments (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Upcoming Exams Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                    Target Examinations
                  </h4>
                </div>

                {courseExams.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No upcoming exams scheduled for this course.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {courseExams.map((ex) => (
                      <div
                        key={ex.id}
                        className="p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 text-xs"
                      >
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {ex.title}
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          📅 {ex.date} &bull; {ex.startTime} - {ex.endTime}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Related Assignments Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                    Course Assignments
                  </h4>
                </div>

                {courseTasks.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">
                    No tasks or assignments due for this course.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {courseTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs flex items-center justify-between"
                      >
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 dark:text-white truncate">
                            {t.title}
                          </p>
                          <p className="text-[10px] text-slate-400">Due {t.dueAt.replace('T', ' ')}</p>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded capitalize bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {newTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Curriculum Topic
              </h3>
              <button
                onClick={() => setNewTopicModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Topic Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graph Traversal Applications"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Subtopics
                </label>
                <textarea
                  rows={2}
                  placeholder="Key concepts or textbook page references..."
                  value={topicDescription}
                  onChange={(e) => setTopicDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  value={topicPriority}
                  onChange={(e) => setTopicPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setNewTopicModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                >
                  Save Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

