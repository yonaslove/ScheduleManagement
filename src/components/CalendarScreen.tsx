import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  MapPin, 
  Eye, 
  EyeOff,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScheduleEvent } from '../types';
import { exportScheduleToExcel } from '../utils/excelExport';
import { 
  format, 
  addDays, 
  subDays, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isToday 
} from 'date-fns';

export const CalendarScreen: React.FC = () => {
  const { events, courses, tasks, studySessions, currentUser, setQuickAddOpen, deleteEvent, startFocusSession } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [activeEventModal, setActiveEventModal] = useState<ScheduleEvent | null>(null);

  // Category visibility toggles
  // Blue: Classes & Labs, Green: Study sessions, Orange: Tasks/Assignments, Red: Exams
  const [visibility, setVisibility] = useState({
    classes: true, // Blue
    study: true,   // Green
    exams: true,   // Red
    personal: true,
  });

  // Time grid hours: 07:00 to 22:00
  const hours = Array.from({ length: 16 }, (_, i) => i + 7);

  const handlePrev = () => {
    if (viewMode === 'day') setCurrentDate((d) => subDays(d, 1));
    else if (viewMode === 'week') setCurrentDate((d) => subDays(d, 7));
    else setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const handleNext = () => {
    if (viewMode === 'day') setCurrentDate((d) => addDays(d, 1));
    else if (viewMode === 'week') setCurrentDate((d) => addDays(d, 7));
    else setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Harmonized category color coding:
  // Blue: Classes/Labs (#3b82f6), Green: Study (#10b981), Red: Exams (#ef4444), Personal (#8b5cf6)
  const getEventCategoryColor = (type: string) => {
    switch (type) {
      case 'class':
      case 'lab':
        return '#3b82f6'; // Blue
      case 'study':
        return '#10b981'; // Green
      case 'exam':
        return '#ef4444'; // Red
      default:
        return '#8b5cf6'; // Purple / Personal
    }
  };

  // Filter events based on active category visibility and course filter
  const filteredEvents = events.filter((ev) => {
    if (selectedCourseFilter !== 'all' && ev.courseId !== selectedCourseFilter) return false;
    if ((ev.type === 'class' || ev.type === 'lab') && !visibility.classes) return false;
    if (ev.type === 'study' && !visibility.study) return false;
    if (ev.type === 'exam' && !visibility.exams) return false;
    if (ev.type === 'personal' && !visibility.personal) return false;
    return true;
  });

  const getEventsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();

    return filteredEvents.filter((ev) => {
      if (ev.isRecurring && ev.dayOfWeek !== undefined) {
        return ev.dayOfWeek === dayOfWeek;
      }
      return ev.date === dateStr;
    });
  };

  const getCourse = (courseId?: string) => courses.find((c) => c.id === courseId);

  const getEventPositionStyles = (startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const startMinutes = (startH - 7) * 60 + startM;
    const endMinutes = (endH - 7) * 60 + endM;
    const duration = Math.max(endMinutes - startMinutes, 30);

    const top = (startMinutes * 60) / 60;
    const height = (duration * 60) / 60;

    return {
      top: `${top}px`,
      height: `${height}px`,
    };
  };

  // Days for week view
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Days for month view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthGridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const monthGridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: monthGridStart, end: monthGridEnd });

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* Calendar Top Control Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Date Navigation & Today */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
            {viewMode === 'month'
              ? format(currentDate, 'MMMM yyyy')
              : viewMode === 'week'
              ? `${format(weekDays[0], 'MMM d')} – ${format(weekDays[6], 'MMM d, yyyy')}`
              : format(currentDate, 'EEEE, MMMM d, yyyy')}
          </h2>
        </div>

        {/* View Switcher and Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}
              </option>
            ))}
          </select>

          {/* View mode toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs font-medium rounded-lg capitalize transition cursor-pointer ${
                  viewMode === mode
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => exportScheduleToExcel(events, courses, tasks, studySessions, currentUser?.name || 'Student')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95"
            title="Download Excel Spreadsheet of Timetable, Exams & Tasks"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Export Schedule</span>
          </button>

          <button
            onClick={() => setQuickAddOpen(true)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Category Color Indicators & Toggles */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-400 uppercase text-[11px] tracking-wider">
          Calendar Categories:
        </span>

        <div className="flex flex-wrap items-center gap-3">
          {/* Blue: Classes */}
          <button
            onClick={() => setVisibility((v) => ({ ...v, classes: !v.classes }))}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
              visibility.classes ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold' : 'opacity-40 text-slate-400'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span>Classes & Labs</span>
            {visibility.classes ? <Eye className="w-3 h-3 ml-1" /> : <EyeOff className="w-3 h-3 ml-1" />}
          </button>

          {/* Green: Study Sessions */}
          <button
            onClick={() => setVisibility((v) => ({ ...v, study: !v.study }))}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
              visibility.study ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold' : 'opacity-40 text-slate-400'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Study Sessions</span>
            {visibility.study ? <Eye className="w-3 h-3 ml-1" /> : <EyeOff className="w-3 h-3 ml-1" />}
          </button>

          {/* Red: Exams */}
          <button
            onClick={() => setVisibility((v) => ({ ...v, exams: !v.exams }))}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
              visibility.exams ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-semibold' : 'opacity-40 text-slate-400'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Exams</span>
            {visibility.exams ? <Eye className="w-3 h-3 ml-1" /> : <EyeOff className="w-3 h-3 ml-1" />}
          </button>
        </div>
      </div>

      {/* WEEK VIEW GRID */}
      {viewMode === 'week' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Week days header */}
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
                        today
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Time grid body */}
            <div className="relative grid grid-cols-[64px_repeat(7,1fr)]">
              <div className="border-r border-slate-100 dark:border-slate-800">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-15 text-[11px] font-medium text-slate-400 flex items-start justify-center pt-1 border-b border-slate-100 dark:border-slate-800/80"
                  >
                    {String(hour).padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {/* 7 Days Columns */}
              {weekDays.map((day) => {
                const dayEvents = getEventsForDay(day);
                const today = isToday(day);
                return (
                  <div
                    key={day.toISOString()}
                    className={`relative border-r border-slate-100 dark:border-slate-800 last:border-r-0 ${
                      today ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                    }`}
                  >
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="h-15 border-b border-slate-100 dark:border-slate-800/80"
                      />
                    ))}

                    {dayEvents.map((ev) => {
                      const course = getCourse(ev.courseId);
                      const pos = getEventPositionStyles(ev.startTime, ev.endTime);
                      const categoryColor = getEventCategoryColor(ev.type);

                      return (
                        <div
                          key={ev.id}
                          onClick={() => setActiveEventModal(ev)}
                          style={{
                            ...pos,
                            backgroundColor: `${categoryColor}18`,
                            borderLeft: `4px solid ${categoryColor}`,
                          }}
                          className="absolute inset-x-1 p-1.5 rounded-r-xl overflow-hidden cursor-pointer hover:shadow-md transition-all z-5 border-t border-r border-b border-slate-200/50 dark:border-slate-700/50"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className="text-[10px] font-bold uppercase truncate"
                              style={{ color: categoryColor }}
                            >
                              {course ? course.code : ev.type}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium shrink-0">
                              {ev.startTime}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate mt-0.5">
                            {ev.title}
                          </h4>
                          {ev.location && (
                            <p className="text-[10px] text-slate-400 truncate flex items-center gap-0.5 mt-0.5">
                              <MapPin className="w-2.5 h-2.5" />
                              {ev.location}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DAY VIEW */}
      {viewMode === 'day' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {format(currentDate, 'EEEE, MMMM d')}
              </h3>
              <p className="text-xs text-slate-400">
                {getEventsForDay(currentDate).length} events scheduled
              </p>
            </div>
            <button
              onClick={() => setQuickAddOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
            >
              + Add Event
            </button>
          </div>

          <div className="space-y-3">
            {getEventsForDay(currentDate).length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No events or study blocks scheduled for this day.
              </div>
            ) : (
              getEventsForDay(currentDate)
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((ev) => {
                  const course = getCourse(ev.courseId);
                  const color = getEventCategoryColor(ev.type);
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setActiveEventModal(ev)}
                      className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 transition cursor-pointer flex items-center justify-between gap-4"
                      style={{ borderLeft: `5px solid ${color}` }}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: `${color}20`, color }}
                          >
                            {course ? course.code : ev.type.toUpperCase()}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {ev.startTime} - {ev.endTime}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-slate-800 dark:text-white mt-1">
                          {ev.title}
                        </h4>
                        {ev.location && (
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {ev.location}
                          </p>
                        )}
                      </div>
                      <span className="text-xs font-medium text-slate-400 capitalize">
                        {ev.type}
                      </span>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-4">
          <div className="grid grid-cols-7 gap-2 mb-2 text-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <span key={day} className="text-xs font-bold text-slate-400 uppercase py-1">
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((day) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const today = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => {
                    setCurrentDate(day);
                    setViewMode('day');
                  }}
                  className={`min-h-[90px] p-2 rounded-2xl border transition cursor-pointer ${
                    today
                      ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20'
                      : isCurrentMonth
                      ? 'border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-800/20 hover:border-slate-300'
                      : 'border-transparent text-slate-300 dark:text-slate-600 bg-slate-50/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold ${
                        today
                          ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center'
                          : isCurrentMonth
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => {
                      const catColor = getEventCategoryColor(ev.type);
                      return (
                        <div
                          key={ev.id}
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded truncate"
                          style={{
                            backgroundColor: `${catColor}25`,
                            color: catColor,
                          }}
                        >
                          {ev.startTime} {ev.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-medium block text-right">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal for viewing/managing an event */}
      {activeEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full">
            <div className="flex items-start justify-between">
              <div>
                <span
                  className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: `${getEventCategoryColor(activeEventModal.type)}25`,
                    color: getEventCategoryColor(activeEventModal.type),
                  }}
                >
                  {activeEventModal.type}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                  {activeEventModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveEventModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>
                  {activeEventModal.startTime} - {activeEventModal.endTime}
                </span>
              </div>
              {activeEventModal.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{activeEventModal.location}</span>
                </div>
              )}
              {activeEventModal.courseId && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Course:</span>
                  <span>{getCourse(activeEventModal.courseId)?.title}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  deleteEvent(activeEventModal.id);
                  setActiveEventModal(null);
                }}
                className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
              >
                Delete Event
              </button>
              
              <div className="flex items-center gap-2">
                {activeEventModal.type === 'study' && (
                  <button
                    onClick={() => {
                      startFocusSession(
                        activeEventModal.studySessionId,
                        activeEventModal.courseId,
                        activeEventModal.title
                      );
                      setActiveEventModal(null);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Start Focus Mode
                  </button>
                )}
                <button
                  onClick={() => setActiveEventModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
