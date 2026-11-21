import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Clock, 
  Calendar, 
  Bell, 
  Moon, 
  Sun, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertCircle,
  Globe
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { translations, Language } from '../locales/translations';

export const SettingsScreen: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    exportData, 
    importData, 
    resetToDefaults 
  } = useApp();

  const currentLang = (settings.language || 'en') as Language;
  const t = translations[currentLang] || translations.en;

  const [notificationStatus, setNotificationStatus] = useState<string>('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; msg: string } | null>(null);

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'am', name: 'Amharic', native: 'አማርኛ' },
    { code: 'om', name: 'Afaan Oromoo', native: 'Afaan Oromoo' },
  ];

  const daysOfWeek = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
  ];

  const handleDayToggle = (dayVal: number) => {
    const current = settings.availableDays;
    const next = current.includes(dayVal)
      ? current.filter((d) => d !== dayVal)
      : [...current, dayVal].sort();
    updateSettings({ availableDays: next });
  };

  const handleRequestNotification = async () => {
    if (!('Notification' in window)) {
      setNotificationStatus('Browser does not support notifications');
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      updateSettings({ notificationsEnabled: true });
      setNotificationStatus('Notifications enabled successfully!');
      new Notification('StudentTrack Alerts', {
        body: 'You will receive reminders for upcoming classes and high-priority deadlines.',
      });
    } else {
      updateSettings({ notificationsEnabled: false });
      setNotificationStatus('Notification permission was denied.');
    }
  };

  const handleExport = () => {
    const dataStr = exportData();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_track_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (success) {
        setImportStatus({ success: true, msg: 'Backup restored successfully!' });
      } else {
        setImportStatus({ success: false, msg: 'Invalid JSON backup format.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>{t.settingsTitle}</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {t.settingsSubtitle}
        </p>
      </div>

      {/* 1. Language Preference */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {t.languagePreference}
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t.languageSubtitle}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl pt-1">
          {languages.map((lang) => {
            const isSelected = (settings.language || 'en') === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => updateSettings({ language: lang.code as any })}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="text-sm font-bold block">{lang.native}</span>
                <span className="text-xs text-slate-400 mt-1">{lang.name}</span>
                {isSelected && (
                  <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 self-end mt-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Study Hours & Availability */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {t.studyWindow}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.studyStart}
            </label>
            <input
              type="time"
              value={settings.studyHoursStart}
              onChange={(e) => updateSettings({ studyHoursStart: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.studyEnd}
            </label>
            <input
              type="time"
              value={settings.studyHoursEnd}
              onChange={(e) => updateSettings({ studyHoursEnd: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold"
            />
          </div>
        </div>
      </div>

      {/* 3. Available Days */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {t.availableDays}
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {daysOfWeek.map((day) => {
            const isSelected = settings.availableDays.includes(day.value);
            return (
              <button
                key={day.value}
                onClick={() => handleDayToggle(day.value)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Theme & Appearance */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Sun className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {t.themeAppearance}
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3 max-w-md">
          {(['light', 'dark', 'system'] as const).map((thm) => (
            <button
              key={thm}
              onClick={() => updateSettings({ theme: thm })}
              className={`p-3 rounded-2xl border text-center capitalize text-xs font-bold transition cursor-pointer flex flex-col items-center justify-center gap-2 ${
                settings.theme === thm
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
              }`}
            >
              {thm === 'light' ? <Sun className="w-5 h-5" /> : thm === 'dark' ? <Moon className="w-5 h-5" /> : <SettingsIcon className="w-5 h-5" />}
              <span>{t[thm]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Notification Preferences */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {t.notifications}
          </h3>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-white">
              Browser Alerts
            </p>
            <p className="text-[11px] text-slate-400">
              {settings.notificationsEnabled ? 'Active' : 'Disabled'}
            </p>
          </div>

          <button
            onClick={handleRequestNotification}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              settings.notificationsEnabled
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {settings.notificationsEnabled ? 'Active' : t.enableNotifications}
          </button>
        </div>

        {notificationStatus && (
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            {notificationStatus}
          </p>
        )}
      </div>

      {/* 6. Data Backup & Restore */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {t.dataBackup}
          </h3>
        </div>

        {importStatus && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              importStatus.success
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
            }`}
          >
            {importStatus.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{importStatus.msg}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExport}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition"
          >
            <Download className="w-4 h-4" />
            <span>{t.exportJson}</span>
          </button>

          <label className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition">
            <Upload className="w-4 h-4" />
            <span>{t.importBackup}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (window.confirm('Reset all data to default?')) {
                resetToDefaults();
              }
            }}
            className="px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.resetDemo}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
