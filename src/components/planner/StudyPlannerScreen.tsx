import React from 'react';
import { 
  Calendar, 
  BookOpen, 
  Clock, 
  History,
  Sparkles 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PlannerSubSection } from '../../types';
import { WeeklyPlanTab } from './WeeklyPlanTab';
import { SubjectsTab } from './SubjectsTab';
import { FocusModeTab } from './FocusModeTab';
import { StudyHistoryTab } from './StudyHistoryTab';

export const StudyPlannerScreen: React.FC = () => {
  const { plannerSubSection, setPlannerSubSection, focusState } = useApp();

  const subNavItems: { id: PlannerSubSection; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'weekly-plan', label: 'Weekly Plan', icon: Calendar },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'focus-mode', label: 'Focus Mode', icon: Clock },
    { id: 'study-history', label: 'Study History', icon: History },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner and Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Study Planner
            </h1>
            {focusState.isRunning && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 animate-pulse">
                FOCUS TIMER ACTIVE
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize weekly study routines, customize course targets, execute in Focus Mode, and recover missed sessions.
          </p>
        </div>

        {/* Sub-Section Switcher Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl overflow-x-auto self-start md:self-auto">
          {subNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = plannerSubSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPlannerSubSection(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Active Sub-Tab */}
      {plannerSubSection === 'weekly-plan' && <WeeklyPlanTab />}
      {plannerSubSection === 'subjects' && <SubjectsTab />}
      {plannerSubSection === 'focus-mode' && <FocusModeTab />}
      {plannerSubSection === 'study-history' && <StudyHistoryTab />}
    </div>
  );
};

