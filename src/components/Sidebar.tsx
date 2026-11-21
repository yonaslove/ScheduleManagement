import React from 'react';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  BookOpen, 
  Settings as SettingsIcon,
  Plus,
  GraduationCap,
  Sparkles,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveScreen } from '../types';

export const Sidebar: React.FC = () => {
  const { 
    currentScreen, 
    setCurrentScreen, 
    setQuickAddOpen, 
    courses,
    focusState,
    currentUser,
    logout 
  } = useApp();

  const navItems: { id: ActiveScreen; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planner', label: 'Study Planner', icon: Sparkles },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  // User initials
  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'ST';

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 shrink-0 select-none">
        {/* Brand Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 dark:text-white leading-tight">StudentTrack</h1>
              <p className="text-xs text-slate-400 font-medium">Academic Workspace</p>
            </div>
          </div>
        </div>

        {/* Quick Add Button */}
        <div className="px-5 pt-5 pb-3">
          <button
            onClick={() => setQuickAddOpen(true)}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all text-white font-medium text-sm rounded-xl shadow-sm hover:shadow-indigo-500/20 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span>Quick Add</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentScreen(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
                {item.id === 'planner' && focusState.isRunning && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
                {isActive && (
                  <span className="ml-auto w-1.5 h-4 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                )}
              </button>
            );
          })}

          {/* Quick Course Badges Section */}
          <div className="pt-6 pb-2 px-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">My Courses</span>
          </div>
          <div className="space-y-1">
            {courses.slice(0, 5).map((course) => (
              <button
                key={course.id}
                onClick={() => setCurrentScreen('courses')}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: course.color }}
                />
                <span className="truncate">{course.code} - {course.title}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* User Account Profile / Logout Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {currentUser?.name || 'Student'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {currentUser?.program || currentUser?.email || 'Logged In'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition-colors cursor-pointer relative ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5 truncate">{item.label}</span>
              {item.id === 'planner' && focusState.isRunning && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
        {/* Floating Mobile Quick Add Button */}
        <button
          onClick={() => setQuickAddOpen(true)}
          className="w-9 h-9 rounded-full bg-indigo-600 active:scale-95 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0 ml-1"
          title="Quick Add"
        >
          <Plus className="w-4 h-4" />
        </button>
        {/* Mobile Log Out */}
        <button
          onClick={logout}
          className="p-1 text-slate-400 hover:text-red-500"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </nav>
    </>
  );
};
