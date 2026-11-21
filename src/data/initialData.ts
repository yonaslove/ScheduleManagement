import { UserSettings } from '../types';

export const DEFAULT_SETTINGS: UserSettings = {
  studyHoursStart: '08:00',
  studyHoursEnd: '22:00',
  availableDays: [1, 2, 3, 4, 5, 6],
  notificationsEnabled: true,
  theme: 'light',
  defaultFocusDuration: 50,
  defaultBreakDuration: 10,
};
