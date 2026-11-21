import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { DashboardScreen } from './components/DashboardScreen';
import { CalendarScreen } from './components/CalendarScreen';
import { TasksScreen } from './components/TasksScreen';
import { CoursesScreen } from './components/CoursesScreen';
import { StudyPlannerScreen } from './components/planner/StudyPlannerScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { QuickAddModal } from './components/QuickAddModal';
import { AuthScreen } from './components/AuthScreen';

const AppContent: React.FC = () => {
  const { currentScreen, currentUser } = useApp();

  // If no user is logged in, show AuthScreen (Login & Register)
  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-800 dark:text-slate-100">
      {/* Sidebar for desktop & bottom navigation on mobile */}
      <Sidebar />

      {/* Main Screen Content Area */}
      <main className="flex-1 min-w-0 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        {currentScreen === 'dashboard' && <DashboardScreen />}
        {currentScreen === 'planner' && <StudyPlannerScreen />}
        {currentScreen === 'calendar' && <CalendarScreen />}
        {currentScreen === 'tasks' && <TasksScreen />}
        {currentScreen === 'courses' && <CoursesScreen />}
        {currentScreen === 'settings' && <SettingsScreen />}
      </main>

      {/* Global Quick Add Modal */}
      <QuickAddModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
