import React from 'react';
import { Menu, Plus, GraduationCap, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MobileHeader: React.FC = () => {
  const { setMobileSidebarOpen, setQuickAddOpen, focusState, currentUser } = useApp();

  return (
    <header className="md:hidden sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 -ml-1 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
              StudentTrack
            </h1>
            <p className="text-[10px] text-slate-400">
              {currentUser?.name ? currentUser.name.split(' ')[0] : 'Workspace'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {focusState.isRunning && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 animate-pulse">
            <Sparkles className="w-3 h-3" />
            <span>Focus Active</span>
          </span>
        )}

        <button
          onClick={() => setQuickAddOpen(true)}
          className="p-1.5 rounded-xl bg-indigo-600 active:scale-95 text-white shadow-xs cursor-pointer"
          title="Quick Add"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
