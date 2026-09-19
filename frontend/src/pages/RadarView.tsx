import React from 'react';
import { RadarHero } from '../components/radar/RadarHero';
import { CapacityBalancePlate } from '../components/radar/CapacityBalancePlate';
import { ApproachingDeadlinesList } from '../components/radar/ApproachingDeadlinesList';
import { FeasibilityIntake } from '../components/radar/FeasibilityIntake';
import { MOCK_CAPACITY_METRIC } from '../mocks/mockData';
import { useAppStore } from '../store/useAppStore';

export const RadarView: React.FC = () => {
  const { startSession } = useAppStore();

  const handleStartFocus = (title: string, id: string) => {
    startSession(title, id);
  };

  return (
    <div className="w-full flex flex-col">
      {/* SECTION 1: EDITORIAL HERO & ASYMMETRIC VISUAL SPLIT */}
      <RadarHero metric={MOCK_CAPACITY_METRIC} />

      {/* SECTION 2: THE REALITY CHECK / HORIZON CAPACITY BALANCE */}
      <CapacityBalancePlate metric={MOCK_CAPACITY_METRIC} />

      {/* SECTION 3: EDITORIAL DEADLINE HORIZON (OPEN LIST) */}
      <ApproachingDeadlinesList onStartFocus={handleStartFocus} />

      {/* SECTION 4: FEASIBILITY EVALUATION INTAKE */}
      <FeasibilityIntake availableBufferHours={MOCK_CAPACITY_METRIC.netBufferHours} />
    </div>
  );
};
