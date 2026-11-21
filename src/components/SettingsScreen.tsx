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
  User,
  Lock,
  Camera,
  Save
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsScreen: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    exportData, 
    importData, 
    resetToDefaults,
    currentUser,
    updateProfile 
  } = useApp();

  // Profile edit states
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileProgram, setProfileProgram] = useState(currentUser?.program || '');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [newPassword, setNewPassword] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  const [notificationStatus, setNotificationStatus] = useState<string>('');
  const [importStatus, setImportStatus] = useState<{ success: boolean; msg: string } | null>(null);

  const daysOfWeek = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: profileName.trim(),
      program: profileProgram.trim(),
      avatarUrl: profileAvatarUrl.trim() || undefined,
      password: newPassword.trim() ? newPassword.trim() : undefined,
    });
    setNewPassword('');
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileAvatarUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
          <span>Account & System Settings</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your personal profile, photo, password, study window, and application preferences.
        </p>
      </div>

      {/* 1. Profile Management (Name, Picture, Password) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            Personal Student Profile
          </h3>
        </div>

        {profileSaved && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs rounded-2xl flex items-center gap-2 border border-emerald-200 dark:border-emerald-900/50">
            <Check className="w-4 h-4 shrink-0" />
            <span>Profile and credentials updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-5">
          {/* Avatar Upload */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                {profileAvatarUrl ? (
                  <img src={profileAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profileName ? profileName.slice(0, 2).toUpperCase() : 'ST'
                )}
              </div>
              <label className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <Camera className="w-5 h-5" />
                <span className="text-[9px] font-semibold mt-0.5">Change</span>
                <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
              </label>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">Profile Photo</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click photo to upload or enter image URL below</p>
              <input
                type="text"
                placeholder="https://example.com/photo.jpg"
                value={profileAvatarUrl}
                onChange={(e) => setProfileAvatarUrl(e.target.value)}
                className="mt-2 w-full max-w-sm px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Department / Academic Program
              </label>
              <input
                type="text"
                value={profileProgram}
                onChange={(e) => setProfileProgram(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Change Password (Leave blank to keep current)
            </label>
            <div className="relative max-w-md">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white text-xs"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Study Hours & Availability */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            Daily Study Window
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Set your preferred daily focus hours. Timetable study blocks and task estimates will align within this window.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Study Start Time
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
              Study End Time
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
            Available Study Days
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
            Theme & Appearance
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
              <span>{thm}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Notification Preferences */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            Notification Preferences
          </h3>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-white">
              Browser Alerts
            </p>
            <p className="text-[11px] text-slate-400">
              {settings.notificationsEnabled ? 'Notifications are active' : 'Notifications are disabled'}
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
            {settings.notificationsEnabled ? 'Active (Test Alert)' : 'Enable Notifications'}
          </button>
        </div>

        {notificationStatus && (
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            {notificationStatus}
          </p>
        )}
      </div>

      {/* 6. Data Backup & Reset */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            Data Backup & Restore
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
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition"
          >
            <Download className="w-4 h-4" />
            <span>Export My Data (JSON)</span>
          </button>

          <label className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-white text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition">
            <Upload className="w-4 h-4" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (window.confirm('Clear all courses and schedule events for this account?')) {
                resetToDefaults();
              }
            }}
            className="px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold rounded-xl flex items-center gap-2 cursor-pointer transition ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear My Schedule Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
