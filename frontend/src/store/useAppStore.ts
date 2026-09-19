import { create } from 'zustand';

export interface ActiveSession {
  workItemId?: string;
  title: string;
  startedAt: string; // ISO string
  elapsedSeconds: number;
  isRunning: boolean;
}

interface AppState {
  activeSession: ActiveSession | null;
  startSession: (title: string, workItemId?: string) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  tickSession: () => void;

  todayAdjustmentNote: string | null;
  setTodayAdjustmentNote: (note: string | null) => void;

  weeklyCapacityHours: number;
  velocityMultiplier: number;
  selectedBoundaries: string[];
  updateCalibration: (capacity: number, multiplier: number, boundaries: string[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeSession: null,

  startSession: (title: string, workItemId?: string) =>
    set({
      activeSession: {
        workItemId,
        title,
        startedAt: new Date().toISOString(),
        elapsedSeconds: 0,
        isRunning: true,
      },
    }),

  pauseSession: () =>
    set((state) => ({
      activeSession: state.activeSession
        ? { ...state.activeSession, isRunning: false }
        : null,
    })),

  resumeSession: () =>
    set((state) => ({
      activeSession: state.activeSession
        ? { ...state.activeSession, isRunning: true }
        : null,
    })),

  stopSession: () => set({ activeSession: null }),

  tickSession: () =>
    set((state) => ({
      activeSession:
        state.activeSession && state.activeSession.isRunning
          ? {
              ...state.activeSession,
              elapsedSeconds: state.activeSession.elapsedSeconds + 1,
            }
          : state.activeSession,
    })),

  todayAdjustmentNote: null,
  setTodayAdjustmentNote: (note) => set({ todayAdjustmentNote: note }),

  weeklyCapacityHours: 18.5,
  velocityMultiplier: 1.2,
  selectedBoundaries: ['sleep', 'exercise', 'sanctuary'],
  updateCalibration: (capacity, multiplier, boundaries) =>
    set({
      weeklyCapacityHours: capacity,
      velocityMultiplier: multiplier,
      selectedBoundaries: boundaries,
    }),
}));

