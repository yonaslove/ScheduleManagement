import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Coffee, 
  BookOpen, 
  Clock, 
  FileText,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';

const FOCUS_PRESETS = [
  { label: '50 / 10 (Default)', focusMins: 50, breakMins: 10 },
  { label: '25 / 5 (Pomodoro)', focusMins: 25, breakMins: 5 },
  { label: '45 / 10', focusMins: 45, breakMins: 10 },
  { label: '60 / 10 (Deep Work)', focusMins: 60, breakMins: 10 },
];

export const FocusModeTab: React.FC = () => {
  const { 
    focusState, 
    setFocusState, 
    courses, 
    completeFocusSession,
    studySessions 
  } = useApp();

  const [sessionNotes, setSessionNotes] = useState(focusState.notes || '');

  const course = courses.find((c) => c.id === focusState.courseId) || courses[0];

  // Timer calculations
  const currentPresetTargetSeconds = focusState.isBreak 
    ? focusState.breakPreset 
    : focusState.durationPreset;

  const secondsLeft = Math.max(currentPresetTargetSeconds - focusState.elapsedFocusSeconds, 0);
  const minutesDisplay = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secondsDisplay = String(secondsLeft % 60).padStart(2, '0');

  const progressPercent = Math.min(
    Math.round((focusState.elapsedFocusSeconds / currentPresetTargetSeconds) * 100),
    100
  );

  const handleToggleTimer = () => {
    setFocusState((prev) => ({
      ...prev,
      isRunning: !prev.isRunning,
    }));
  };

  const handleResetTimer = () => {
    setFocusState((prev) => ({
      ...prev,
      isRunning: false,
      elapsedFocusSeconds: 0,
    }));
  };

  const handleSwitchToBreak = () => {
    setFocusState((prev) => ({
      ...prev,
      isBreak: true,
      isRunning: false,
      elapsedFocusSeconds: 0,
    }));
  };

  const handleSwitchToFocus = () => {
    setFocusState((prev) => ({
      ...prev,
      isBreak: false,
      isRunning: false,
      elapsedFocusSeconds: 0,
    }));
  };

  const handleApplyPreset = (focusMins: number, breakMins: number) => {
    setFocusState((prev) => ({
      ...prev,
      durationPreset: focusMins * 60,
      breakPreset: breakMins * 60,
      elapsedFocusSeconds: 0,
      isRunning: false,
    }));
  };

  const handleFinishSession = () => {
    // Only count actual focused minutes (excluding break or paused time)
    const actualMinutesStudied = Math.max(Math.round(focusState.elapsedFocusSeconds / 60), 1);
    
    completeFocusSession(actualMinutesStudied, sessionNotes);
    
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Session Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {course && (
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-lg"
                style={{ backgroundColor: `${course.color}20`, color: course.color }}
              >
                {course.code}
              </span>
            )}
            <span className="text-xs font-medium text-slate-400">Focus Mode Execution</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {focusState.topic || 'General Focused Study'}
          </h2>
          {focusState.goal && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Goal: {focusState.goal}
            </p>
          )}
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {FOCUS_PRESETS.map((preset) => {
            const isCurrent = focusState.durationPreset === preset.focusMins * 60;
            return (
              <button
                key={preset.label}
                onClick={() => handleApplyPreset(preset.focusMins, preset.breakMins)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {preset.focusMins}/{preset.breakMins}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Focus Timer Display Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm text-center relative overflow-hidden">
        {/* State Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {focusState.isBreak ? (
            <>
              <Coffee className="w-4 h-4 text-amber-500" />
              <span>Rest & Break Interval</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Deep Learning Session</span>
            </>
          )}
        </div>

        {/* Big Digital Countdown */}
        <div className="text-7xl sm:text-8xl font-black tracking-tight text-slate-900 dark:text-white font-mono my-4">
          {minutesDisplay}:{secondsDisplay}
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-6">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              focusState.isBreak ? 'bg-amber-400' : 'bg-indigo-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleToggleTimer}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md active:scale-95 transition cursor-pointer ${
              focusState.isRunning
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
            }`}
            title={focusState.isRunning ? 'Pause' : 'Start Focus'}
          >
            {focusState.isRunning ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>

          <button
            onClick={handleResetTimer}
            className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {focusState.isBreak ? (
            <button
              onClick={handleSwitchToFocus}
              className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
            >
              Back to Study
            </button>
          ) : (
            <button
              onClick={handleSwitchToBreak}
              className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 cursor-pointer"
            >
              Take Break
            </button>
          )}
        </div>

        {/* Live Active Duration Stat */}
        <p className="text-xs text-slate-400 mt-6">
          Logged focus time this session: <span className="font-bold text-slate-700 dark:text-slate-200">{Math.round(focusState.elapsedFocusSeconds / 60)} minutes</span> (Paused time excluded)
        </p>
      </div>

      {/* Session Notes & Complete Action Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Session Learning Notes & Reflections
          </h3>
        </div>

        <textarea
          rows={3}
          placeholder="Jot down formulas learned, confusing points, textbook pages, or topics to revisit..."
          value={sessionNotes}
          onChange={(e) => setSessionNotes(e.target.value)}
          className="w-full p-3.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">
            Clicking finish records actual study minutes into your course target & study history.
          </span>

          <button
            onClick={handleFinishSession}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finish & Record Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};

