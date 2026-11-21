import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  User, 
  MapPin, 
  Clock, 
  Calendar, 
  CheckSquare, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  ArrowLeft,
  X,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Course } from '../types';

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#ef4444', // red
  '#14b8a6', // teal
];

export const CoursesScreen: React.FC = () => {
  const { 
    courses, 
    events, 
    tasks, 
    addCourse, 
    updateCourse, 
    deleteCourse,
    selectedCourseForDetails,
    setSelectedCourseForDetails,
    setQuickAddOpen
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [credits, setCredits] = useState('3');
  const [color, setColor] = useState('#3b82f6');
  const [instructor, setInstructor] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const activeCourse = courses.find((c) => c.id === selectedCourseForDetails);

  const openCreateModal = () => {
    setEditingCourseId(null);
    setCode('');
    setTitle('');
    setCredits('3');
    setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setInstructor('');
    setLocation('');
    setNotes('');
    setModalOpen(true);
  };

  const openEditModal = (c: Course, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCourseId(c.id);
    setCode(c.code);
    setTitle(c.title);
    setCredits(c.credits.toString());
    setColor(c.color);
    setInstructor(c.instructor || '');
    setLocation(c.location || '');
    setNotes(c.notes || '');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) return;

    if (editingCourseId) {
      updateCourse(editingCourseId, {
        code: code.trim().toUpperCase(),
        title: title.trim(),
        credits: parseInt(credits, 10) || 3,
        color,
        instructor: instructor.trim() || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      addCourse({
        code: code.trim().toUpperCase(),
        title: title.trim(),
        credits: parseInt(credits, 10) || 3,
        color,
        instructor: instructor.trim() || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this course and all associated events & tasks?')) {
      deleteCourse(id);
      if (selectedCourseForDetails === id) {
        setSelectedCourseForDetails(null);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner / Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>Academic Courses & Modules</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize registered courses, instructors, credit hours, and associated schedules.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="w-full md:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Main Layout: If a course is selected, show details view or list */}
      {activeCourse ? (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedCourseForDetails(null)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Courses</span>
          </button>

          {/* Course Details Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            <div
              className="absolute top-0 left-0 right-0 h-2"
              style={{ backgroundColor: activeCourse.color }}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-lg"
                    style={{
                      backgroundColor: `${activeCourse.color}20`,
                      color: activeCourse.color,
                    }}
                  >
                    {activeCourse.code}
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    {activeCourse.credits} Credit Hours
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                  {activeCourse.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => openEditModal(activeCourse, e)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={(e) => handleDelete(activeCourse.id, e)}
                  className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Instructor</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {activeCourse.instructor || 'Not assigned'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Location / Hall</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {activeCourse.location || 'Online / Various'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <div>
                  <span className="text-slate-400 block text-[11px]">Notes</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 line-clamp-1">
                    {activeCourse.notes || 'None'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Schedule and Tasks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Related Schedule */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Classes & Timetable</span>
                </h4>
                <button
                  onClick={() => setQuickAddOpen(true)}
                  className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  + Add Class
                </button>
              </div>

              {events.filter((e) => e.courseId === activeCourse.id).length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No scheduled events for this course.</p>
              ) : (
                <div className="space-y-2.5">
                  {events
                    .filter((e) => e.courseId === activeCourse.id)
                    .map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {ev.startTime} - {ev.endTime}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              {ev.type}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-800 dark:text-white mt-0.5">{ev.title}</p>
                          {ev.location && <p className="text-[11px] text-slate-400 mt-0.5">Room: {ev.location}</p>}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Related Tasks */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  <span>Tasks & Assignments</span>
                </h4>
                <button
                  onClick={() => setQuickAddOpen(true)}
                  className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  + Add Task
                </button>
              </div>

              {tasks.filter((t) => t.courseId === activeCourse.id).length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No tasks assigned to this course.</p>
              ) : (
                <div className="space-y-2.5">
                  {tasks
                    .filter((t) => t.courseId === activeCourse.id)
                    .map((t) => (
                      <div
                        key={t.id}
                        className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              t.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {t.priority}
                          </span>
                          <p className="font-semibold text-slate-800 dark:text-white mt-1">{t.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">Due: {t.dueAt.replace('T', ' ')}</p>
                        </div>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${
                            t.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Course Grid List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => {
            const courseEvents = events.filter((e) => e.courseId === course.id);
            const courseTasks = tasks.filter((t) => t.courseId === course.id);
            const completedTasks = courseTasks.filter((t) => t.status === 'completed');

            return (
              <div
                key={course.id}
                onClick={() => setSelectedCourseForDetails(course.id)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Accent top stripe */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5 transition-all group-hover:h-2"
                  style={{ backgroundColor: course.color }}
                />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-xs font-bold px-2.5 py-0.5 rounded-lg"
                      style={{
                        backgroundColor: `${course.color}20`,
                        color: course.color,
                      }}
                    >
                      {course.code}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {course.credits} Credits
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-white leading-snug">
                    {course.title}
                  </h3>

                  {course.instructor && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{course.instructor}</span>
                    </p>
                  )}
                  {course.location && (
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{course.location}</span>
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-3">
                    <span>{courseEvents.length} Sessions</span>
                    <span>&bull;</span>
                    <span>
                      {completedTasks.length}/{courseTasks.length} Tasks
                    </span>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => openEditModal(course, e)}
                      className="p-1 hover:text-indigo-600 rounded cursor-pointer"
                      title="Edit Course"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(course.id, e)}
                      className="p-1 hover:text-red-600 rounded cursor-pointer"
                      title="Delete Course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Course Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingCourseId ? 'Edit Course' : 'Add New Course'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="CS 101"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs uppercase font-bold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Introduction to Programming"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Credit Hours
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Course Color
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {PRESET_COLORS.map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full cursor-pointer transition ${
                          color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Instructor (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Alan Turing"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Default Room / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Science Center 204"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Course syllabus link or office hours..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                >
                  Save Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

