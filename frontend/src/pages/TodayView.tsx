import React, { useState, useEffect } from 'react';
import { DailyBriefHero } from '../components/today/DailyBriefHero';
import { DayShapePlate } from '../components/today/DayShapePlate';
import { ActionablePrioritiesList } from '../components/today/ActionablePrioritiesList';
import { NaturalScheduleAdjustment } from '../components/today/NaturalScheduleAdjustment';
import { useTodayOverview, useActiveSessionTracking, useWorkItems } from '../services/apiHooks';

export const TodayView: React.FC = () => {
  const { data: todayOverview } = useTodayOverview();
  const { data: trackingData, startSession, stopSession } = useActiveSessionTracking();
  const { data: workItems } = useWorkItems();

  const [localElapsed, setLocalElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  // Sync with active session from backend
  const activeSessionFromBackend = trackingData?.session;
  const isSessionActive = trackingData?.is_active && !!activeSessionFromBackend;

  useEffect(() => {
    if (isSessionActive && activeSessionFromBackend?.started_at) {
      const startTime = new Date(activeSessionFromBackend.started_at).getTime();
      const elapsed = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
      setLocalElapsed(elapsed);
      setIsRunning(true);
    } else {
      setLocalElapsed(0);
      setIsRunning(false);
    }
  }, [isSessionActive, activeSessionFromBackend?.started_at]);

  // Local second-by-second ticker
  useEffect(() => {
    if (!isSessionActive || !isRunning) return;

    const interval = setInterval(() => {
      setLocalElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isSessionActive, isRunning]);

  const topPriorityItem = workItems?.find((w) => w.status?.toLowerCase() !== 'completed');

  const handleStartDefaultSession = async () => {
    try {
      await startSession({
        work_item_id: topPriorityItem?.id,
        notes: topPriorityItem ? `Focus: ${topPriorityItem.title}` : 'Morning Focus Block',
      });
      setIsRunning(true);
    } catch (err) {
      console.warn('Could not start focus session:', err);
    }
  };

  const handleStartItemFocus = async (title: string, workItemId?: string) => {
    try {
      await startSession({
        work_item_id: workItemId,
        notes: `Focus: ${title}`,
      });
      setIsRunning(true);
    } catch (err) {
      console.warn('Could not start focus session for item:', err);
    }
  };

  const handlePauseSession = () => {
    setIsRunning(false);
  };

  const handleResumeSession = () => {
    setIsRunning(true);
  };

  const handleStopSession = async () => {
    try {
      await stopSession({ notes: 'Concluded deep work session' });
      setIsRunning(false);
      setLocalElapsed(0);
    } catch (err) {
      console.warn('Could not stop session:', err);
    }
  };

  const activeSessionProp = isSessionActive && activeSessionFromBackend
    ? {
        workItemId: activeSessionFromBackend.work_item_id || undefined,
        title:
          activeSessionFromBackend.work_item_title ||
          activeSessionFromBackend.notes ||
          'Focus Sprint',
        startedAt: activeSessionFromBackend.started_at,
        elapsedSeconds: localElapsed,
        isRunning,
      }
    : null;

  const dateDisplay =
    todayOverview?.dateDisplay ||
    new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const availableHours = todayOverview?.availableFocusHours ?? 4.5;
  const deadlinesCount = todayOverview?.deadlinesCount ?? (workItems?.filter((w) => w.riskLevel === 'CRITICAL').length || 0);

  return (
    <div className="w-full flex flex-col">
      {/* 1. Top Daily Brief Hero Section */}
      <DailyBriefHero
        dateDisplay={dateDisplay}
        issueNumber={todayOverview?.issueNumber || 'N° 042'}
        availableFocusHours={availableHours}
        deadlinesCount={deadlinesCount}
        activeSession={activeSessionProp}
        onStartSession={handleStartDefaultSession}
        onPauseSession={handlePauseSession}
        onResumeSession={handleResumeSession}
        onStopSession={handleStopSession}
      />

      {/* 2. Canonical Asymmetric Plate: 55/45 Split Layout */}
      <DayShapePlate
        availableFocusHours={availableHours}
        maxFocusLimitHours={todayOverview?.maxFocusLimitHours ?? 6.0}
      />

      {/* 3. Actionable Priorities Editorial Open List */}
      <ActionablePrioritiesList
        items={workItems}
        onStartFocus={handleStartItemFocus}
      />

      {/* 4. Natural Language Dynamic Intake Section */}
      <NaturalScheduleAdjustment />
    </div>
  );
};
