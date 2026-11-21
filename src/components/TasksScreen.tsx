import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit3, 
  AlertCircle,
  Calendar,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Priority, Task, TaskStatus, TaskType } from '../types';
import confetti from 'canvas-confetti';

export const TasksScreen: React.FC = () => {
  const { tasks, courses, addTask, updateTask, deleteTask, toggleTaskStatus } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [filterType, setFilterType] = useState('all');

  // Modal create/edit state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCourseId, setTaskCourseId] = useState('');
  const [taskTypeVal, setTaskTypeVal] = useState<TaskType>('assignment');
  const [taskDueAt, setTaskDueAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T18:00`;
  });
  const [taskPriorityVal, setTaskPriorityVal] = useState<Priority>('medium');
  const [taskDuration, setTaskDuration] = useState('60');
  const [taskStatusVal, setTaskStatusVal] = useState<TaskStatus>('todo');
  const [taskNotes, setTaskNotes] = useState('');

  const getCourse = (courseId?: string) => courses.find((c) => c.id === courseId);

  const openCreateModal = () => {
    setEditingTaskId(null);
    setTaskTitle('');
    setTaskCourseId(courses[0]?.id || '');
    setTaskTypeVal('assignment');
    setTaskPriorityVal('medium');
    setTaskDuration('60');
    setTaskStatusVal('todo');
    setTaskNotes('');
    setModalOpen(true);
  };

  const openEditModal = (t: Task) => {
    setEditingTaskId(t.id);
    setTaskTitle(t.title);
    setTaskCourseId(t.courseId || '');
    setTaskTypeVal(t.type);
    setTaskDueAt(t.dueAt);
    setTaskPriorityVal(t.priority);
    setTaskDuration(t.estimatedMinutes?.toString() || '60');
    setTaskStatusVal(t.status);
    setTaskNotes(t.notes || '');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    if (editingTaskId) {
      updateTask(editingTaskId, {
        title: taskTitle.trim(),
        courseId: taskCourseId || undefined,
        type: taskTypeVal,
        dueAt: taskDueAt,
        priority: taskPriorityVal,
        estimatedMinutes: parseInt(taskDuration, 10) || 60,
        status: taskStatusVal,
        notes: taskNotes.trim() || undefined,
      });
    } else {
      addTask({
        title: taskTitle.trim(),
        courseId: taskCourseId || undefined,
        type: taskTypeVal,
        dueAt: taskDueAt,
        priority: taskPriorityVal,
        estimatedMinutes: parseInt(taskDuration, 10) || 60,
        status: taskStatusVal,
        notes: taskNotes.trim() || undefined,
      });
    }
    setModalOpen(false);
  };

  const handleToggle = (id: string, currentStatus: string) => {
    toggleTaskStatus(id);
    if (currentStatus !== 'completed') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (searchQuery.trim() && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterCourse !== 'all' && t.courseId !== filterCourse) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterStatus === 'pending' && t.status === 'completed') return false;
    if (filterStatus === 'completed' && t.status !== 'completed') return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top action & title bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Academic Tasks & Deadlines</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your assignments, readings, project milestones, and exam preparation.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="w-full md:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Task</span>
        </button>
      </div>

      {/* Filters row */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Status filter tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          {(['all', 'pending', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition cursor-pointer ${
                filterStatus === st
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Course Filter */}
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="all">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        {/* Task Type Filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="assignment">Assignment</option>
          <option value="reading">Reading</option>
          <option value="revision">Revision</option>
          <option value="project">Project</option>
          <option value="exam-prep">Exam Prep</option>
        </select>
      </div>

      {/* Task list rendering */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
            <CheckSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No tasks found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No tasks match your selected filters. Create a new task or adjust your filters above.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-indigo-700 cursor-pointer"
            >
              + Create Task
            </button>
          </div>
        ) : (
          filteredTasks.map((t) => {
            const course = getCourse(t.courseId);
            const isDone = t.status === 'completed';
            const isHighPriority = t.priority === 'high';

            return (
              <div
                key={t.id}
                className={`group bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-xs transition hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isDone
                    ? 'border-slate-200/60 dark:border-slate-800 opacity-60 bg-slate-50/40 dark:bg-slate-900/40'
                    : isHighPriority
                    ? 'border-red-200/70 dark:border-red-950/70 hover:border-red-300'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggle(t.id, t.status)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-500 transition cursor-pointer shrink-0"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5 hover:border-emerald-500" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {course && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                          style={{
                            backgroundColor: `${course.color}20`,
                            color: course.color,
                          }}
                        >
                          {course.code}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          t.priority === 'high'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                            : t.priority === 'medium'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {t.priority}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 capitalize">
                        {t.type}
                      </span>
                    </div>

                    <h4
                      className={`text-sm font-bold text-slate-900 dark:text-white ${
                        isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {t.title}
                    </h4>

                    {t.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                        {t.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Due {t.dueAt.replace('T', ' ')}
                      </span>
                      {t.estimatedMinutes && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {t.estimatedMinutes} mins
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <select
                    value={t.status}
                    onChange={(e) => updateTask(t.id, { status: e.target.value as TaskStatus })}
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>

                  <button
                    onClick={() => openEditModal(t)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Edit task"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteTask(t.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Edit/Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTaskId ? 'Edit Task' : 'Add New Task'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course
                  </label>
                  <select
                    value={taskCourseId}
                    onChange={(e) => setTaskCourseId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs"
                  >
                    <option value="">(None)</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    value={taskTypeVal}
                    onChange={(e) => setTaskTypeVal(e.target.value as TaskType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={taskDueAt}
                    onChange={(e) => setTaskDueAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriorityVal}
                    onChange={(e) => setTaskPriorityVal(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Time (mins)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={taskStatusVal}
                    onChange={(e) => setTaskStatusVal(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="Task instructions or notes..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

