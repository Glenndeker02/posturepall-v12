/**
 * Break Scheduler Service
 * Intelligent break scheduling with adaptive timing
 */

export type BreakType = 'micro' | 'standard' | 'extended';

export interface BreakSchedule {
  type: BreakType;
  intervalMinutes: number;
  durationMinutes: number;
  description: string;
}

export interface BreakReminder {
  id: string;
  type: BreakType;
  scheduledTime: number;
  isDismissed: boolean;
  isSnoozed: boolean;
  snoozeCount: number;
  isSkipped: boolean;
}

export interface BreakSettings {
  microBreakInterval: number; // minutes
  standardBreakInterval: number;
  extendedBreakInterval: number;
  enableAdaptiveTiming: boolean;
  snoozeMinutes: number;
  maxSnoozes: number;
}

const DEFAULT_SETTINGS: BreakSettings = {
  microBreakInterval: 45, // Every 45 minutes
  standardBreakInterval: 90, // Every 90 minutes
  extendedBreakInterval: 180, // Every 3 hours
  enableAdaptiveTiming: true,
  snoozeMinutes: 5,
  maxSnoozes: 2,
};

/**
 * Break type definitions per PRD
 */
export const BREAK_TYPES: Record<BreakType, BreakSchedule> = {
  micro: {
    type: 'micro',
    intervalMinutes: 45,
    durationMinutes: 3,
    description: 'Quick relief, minimal workflow disruption',
  },
  standard: {
    type: 'standard',
    intervalMinutes: 90,
    durationMinutes: 6,
    description: 'Comprehensive relief, reset posture',
  },
  extended: {
    type: 'extended',
    intervalMinutes: 180,
    durationMinutes: 12,
    description: 'Physical and mental reset',
  },
};

class BreakScheduler {
  private settings: BreakSettings;
  private sessionStartTime: number = 0;
  private lastBreakTime: number = 0;
  private breakHistory: BreakReminder[] = [];
  private skipCount: number = 0;

  constructor(settings: Partial<BreakSettings> = {}) {
    this.settings = { ...DEFAULT_SETTINGS, ...settings };
  }

  /**
   * Start a new session
   */
  startSession() {
    this.sessionStartTime = Date.now();
    this.lastBreakTime = Date.now();
    this.breakHistory = [];
    this.skipCount = 0;
  }

  /**
   * Get next break reminder
   */
  getNextBreak(): { type: BreakType; minutesUntil: number } | null {
    if (this.sessionStartTime === 0) return null;

    const now = Date.now();
    const elapsedMinutes = (now - this.lastBreakTime) / 1000 / 60;
    const totalElapsedMinutes = (now - this.sessionStartTime) / 1000 / 60;

    // Determine break type based on total elapsed time
    let breakType: BreakType;
    let interval: number;

    if (totalElapsedMinutes >= this.settings.extendedBreakInterval) {
      breakType = 'extended';
      interval = this.settings.extendedBreakInterval;
    } else if (totalElapsedMinutes >= this.settings.standardBreakInterval) {
      breakType = 'standard';
      interval = this.settings.standardBreakInterval;
    } else {
      breakType = 'micro';
      interval = this.settings.microBreakInterval;
    }

    const minutesUntil = Math.max(0, interval - elapsedMinutes);

    return { type: breakType, minutesUntil };
  }

  /**
   * Check if break should be shown now
   */
  shouldShowBreak(): { show: boolean; type: BreakType } | null {
    const next = this.getNextBreak();
    if (!next) return null;

    if (next.minutesUntil <= 0) {
      return { show: true, type: next.type };
    }

    return null;
  }

  /**
   * Get warning time (2 minutes before break)
   */
  shouldShowWarning(): { show: boolean; type: BreakType; minutesUntil: number } | null {
    const next = this.getNextBreak();
    if (!next) return null;

    if (next.minutesUntil <= 2 && next.minutesUntil > 0) {
      return { show: true, type: next.type, minutesUntil: next.minutesUntil };
    }

    return null;
  }

  /**
   * Snooze current break
   */
  snoozeBreak(breakId: string): boolean {
    const reminder = this.breakHistory.find((b) => b.id === breakId);

    if (!reminder) return false;

    if (reminder.snoozeCount >= this.settings.maxSnoozes) {
      return false; // Max snoozes reached
    }

    reminder.isSnoozed = true;
    reminder.snoozeCount++;
    reminder.scheduledTime = Date.now() + this.settings.snoozeMinutes * 60 * 1000;

    return true;
  }

  /**
   * Skip break
   */
  skipBreak(breakId: string) {
    const reminder = this.breakHistory.find((b) => b.id === breakId);

    if (reminder) {
      reminder.isSkipped = true;
      this.skipCount++;
    }

    this.lastBreakTime = Date.now();
  }

  /**
   * Complete break
   */
  completeBreak(breakId: string) {
    const reminder = this.breakHistory.find((b) => b.id === breakId);

    if (reminder) {
      reminder.isDismissed = true;
    }

    this.lastBreakTime = Date.now();
    this.skipCount = 0; // Reset skip count on completion
  }

  /**
   * Check if user has skipped too many breaks
   */
  hasSkippedTooMany(): boolean {
    return this.skipCount >= 3;
  }

  /**
   * Get skip count
   */
  getSkipCount(): number {
    return this.skipCount;
  }

  /**
   * Reset skip count
   */
  resetSkipCount() {
    this.skipCount = 0;
  }

  /**
   * Adaptive timing: Adjust interval based on posture deterioration
   */
  adjustIntervalBasedOnPosture(postureQuality: 'excellent' | 'good' | 'fair' | 'poor') {
    if (!this.settings.enableAdaptiveTiming) return;

    // If posture is deteriorating, suggest earlier break
    if (postureQuality === 'poor' || postureQuality === 'fair') {
      const next = this.getNextBreak();
      if (next && next.minutesUntil > 10) {
        // Suggest break 10 minutes earlier
        this.lastBreakTime = Date.now() - (next.minutesUntil - 10) * 60 * 1000;
      }
    }
  }

  /**
   * Create a new break reminder
   */
  createReminder(type: BreakType): BreakReminder {
    const reminder: BreakReminder = {
      id: `break-${Date.now()}`,
      type,
      scheduledTime: Date.now(),
      isDismissed: false,
      isSnoozed: false,
      snoozeCount: 0,
      isSkipped: false,
    };

    this.breakHistory.push(reminder);
    return reminder;
  }

  /**
   * Get break duration for type
   */
  getBreakDuration(type: BreakType): number {
    return BREAK_TYPES[type].durationMinutes;
  }

  /**
   * Get settings
   */
  getSettings(): BreakSettings {
    return { ...this.settings };
  }

  /**
   * Update settings
   */
  updateSettings(newSettings: Partial<BreakSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }
}

// Singleton instance
let schedulerInstance: BreakScheduler | null = null;

export function getBreakScheduler(settings?: Partial<BreakSettings>): BreakScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new BreakScheduler(settings);
  }
  return schedulerInstance;
}

export function resetBreakScheduler() {
  schedulerInstance = null;
}
