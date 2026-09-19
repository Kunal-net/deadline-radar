import React, { useEffect } from 'react';
import { DailyBriefHero } from '../components/today/DailyBriefHero';
import { DayShapePlate } from '../components/today/DayShapePlate';
import { ActionablePrioritiesList } from '../components/today/ActionablePrioritiesList';
import { NaturalScheduleAdjustment } from '../components/today/NaturalScheduleAdjustment';
import { MOCK_TODAY_OVERVIEW } from '../mocks/mockData';
import { useAppStore } from '../store/useAppStore';

export const TodayView: React.FC = () => {
  const {
    activeSession,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    tickSession,
  } = useAppStore();

  // Active Session 1-second timer tick
  useEffect(() => {
    if (!activeSession || !activeSession.isRunning) return;

    const interval = setInterval(() => {
      tickSession();
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession, tickSession]);

  const handleStartDefaultSession = () => {
    startSession('Morning Focus Block', 'wi_ml_01');
  };

  const handleStartItemFocus = (title: string, workItemId?: string) => {
    startSession(title, workItemId);
  };

  return (
    <div className="w-full flex flex-col">
      {/* 1. Top Daily Brief Hero Section */}
      <DailyBriefHero
        dateDisplay={MOCK_TODAY_OVERVIEW.dateDisplay}
        issueNumber={MOCK_TODAY_OVERVIEW.issueNumber}
        availableFocusHours={MOCK_TODAY_OVERVIEW.availableFocusHours}
        deadlinesCount={MOCK_TODAY_OVERVIEW.deadlinesCount}
        activeSession={activeSession}
        onStartSession={handleStartDefaultSession}
        onPauseSession={pauseSession}
        onResumeSession={resumeSession}
        onStopSession={stopSession}
      />

      {/* 2. Canonical Asymmetric Plate: 55/45 Split Layout */}
      <DayShapePlate
        availableFocusHours={MOCK_TODAY_OVERVIEW.availableFocusHours}
        maxFocusLimitHours={MOCK_TODAY_OVERVIEW.maxFocusLimitHours}
      />

      {/* 3. Actionable Priorities Editorial Open List */}
      <ActionablePrioritiesList onStartFocus={handleStartItemFocus} />

      {/* 4. Natural Language Dynamic Intake Section */}
      <NaturalScheduleAdjustment />
    </div>
  );
};
