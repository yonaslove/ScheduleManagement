import React, { useState } from 'react';
import { X, Calendar, CheckSquare, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EventType, Priority, TaskType } from '../types';

export const QuickAddModal: React.FC = () => {
  const { quickAddOpen, setQuickAddOpen, courses, addEvent, addTask } = useApp();

  const [activeTab, setActiveTab] = useState<'task' | 'event'>('task');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCourseId, setTaskCourseId] = useState(courses[0]?.id || '');
  const [taskDueDate, setTaskDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T18:00`;
  });
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskDuration, setTaskDuration] = useState('60');
  const [taskType, setTaskType] = useState<TaskType>('assignment');
  const [taskNotes, setTaskNotes] = useState('');

  // Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventCourseId, setEventCourseId] = useState(courses[0]?.id || '');
  const [eventType, setEventType] = useState<EventType>('class');
  const [eventDate, setEventDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [eventStartTime, setEventStartTime] = useState('10:00');
  const [eventEndTime, setEventEndTime] = useState('11:30');
  const [eventLocation, setEventLocation] = useState('');
  const [eventIsRecurring, setEventIsRecurring] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  if (!quickAddOpen) return null;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) {
      setErrorMsg('Please enter a task title');
      return;
    }
    addTask({
      title: taskTitle.trim(),
      courseId: taskCourseId || undefined,
      type: taskType,
      dueAt: taskDueDate,
      priority: taskPriority,
      estimatedMinutes: parseInt(taskDuration, 10) || 60,
      status: 'todo',
      notes: taskNotes.trim() || undefined,
    });
    setTaskTitle('');
    setTaskNotes('');
    setErrorMsg('');
    setQuickAddOpen(false);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) {
      setErrorMsg('Please enter an event or class title');
      return;
    }
    if (eventStartTime >= eventEndTime) {
      setErrorMsg('Start time must be before end time');
      return;
    }

    const eventDateObj = new Date(eventDate);
    const dayOfWeek = eventDateObj.getDay();

    addEvent({
      title: eventTitle.trim(),
      type: eventType,
      courseId: eventCourseId || undefined,
      date: eventDate,
      startTime: eventStartTime,
      endTime: eventEndTime,
      dayOfWeek: eventIsRecurring ? dayOfWeek : undefined,
      isRecurring: eventIsRecurring,
      location: eventLocation.trim() || undefined,
    });
    setEventTitle('');
    setEventLocation('');
    setErrorMsg('');
    setQuickAddOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-slate-800 dark:text-white">Quick Add</span>
          </div>
          <button
            onClick={() => setQuickAddOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-2 gap-2">
          <button
            type="button"
            onClick={() => { setActiveTab('task'); setErrorMsg(''); }}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'task'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Task or Assignment</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('event'); setErrorMsg(''); }}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'event'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Class or Event</span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs rounded-xl flex items-center gap-2 border border-red-200 dark:border-red-900/50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'task' ? (
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Finish Algorithm Homework Set 3"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Course
                  </label>
                  <select
                    value={taskCourseId}
                    onChange={(e) => setTaskCourseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">(None / General)</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Task Type
                  </label>
                  <select
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as TaskType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="reading">Reading</option>
                    <option value="revision">Revision</option>
                    <option value="project">Project</option>
                    <option value="exam-prep">Exam Prep</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Deadline (Date & Time)
                  </label>
                  <input
                    type="datetime-local"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Estimated Duration (Minutes)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-400 font-medium">mins</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Notes / Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional details, rubric notes, or links..."
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setQuickAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-indigo-500/20 cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Event / Class Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics Midterm or CS Lecture"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Course
                  </label>
                  <select
                    value={eventCourseId}
                    onChange={(e) => setEventCourseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">(None / Personal)</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Event Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as EventType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="class">Class</option>
                    <option value="lab">Lab</option>
                    <option value="study">Study Session</option>
                    <option value="exam">Exam / Quiz</option>
                    <option value="personal">Personal / Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Location / Room
                </label>
                <input
                  type="text"
                  placeholder="e.g. Science Center B12 or Zoom link"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recurringCheck"
                  checked={eventIsRecurring}
                  onChange={(e) => setEventIsRecurring(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <label htmlFor="recurringCheck" className="text-xs text-slate-600 dark:text-slate-300">
                  Recurring weekly class on this weekday
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setQuickAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-indigo-500/20 cursor-pointer"
                >
                  Add Event
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

