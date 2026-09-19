/**
 * Mock Data for Frontend Foundation & Development
 *
 * NOTE: This mock dataset directly reflects the finalized design screens
 * in Stitch project 17354903279475530867. It allows the UI foundation to render
 * with 100% design fidelity during development without fabricating production behavior.
 */

import { WorkItem, CapacityMetric, TodayOverview } from '../services/apiTypes';

export const MOCK_CAPACITY_METRIC: CapacityMetric = {
  availableFocusHours: 18.5,
  committedWorkHours: 14.5,
  netBufferHours: 4.0,
  riskAssessment: 'Moderate — Thursday afternoon is tight',
  weekNumber: 42,
};

export const MOCK_WORK_ITEMS: WorkItem[] = [
  {
    id: 'wi_ml_01',
    title: 'Machine Learning Assignment',
    description: 'ResNet Retraining, validation loss analysis, LaTeX write-up.',
    category: 'ACADEMIC',
    status: 'IN_PROGRESS',
    riskLevel: 'CRITICAL',
    deadlineUtc: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    isHardDeadline: true,
    estimatedEffortHours: 4.5,
    remainingEffortHours: 4.5,
    actualLoggedHours: 1.5,
    dynamicPriorityScore: 94,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    units: [
      {
        id: 'u_1',
        workItemId: 'wi_ml_01',
        title: 'Run baseline validation loss curves',
        estimatedMinutes: 60,
        completedMinutes: 60,
        isCompleted: true,
        orderIndex: 0,
      },
      {
        id: 'u_2',
        workItemId: 'wi_ml_01',
        title: 'Hyperparameter grid search & ablation table',
        estimatedMinutes: 120,
        completedMinutes: 30,
        isCompleted: false,
        orderIndex: 1,
      },
      {
        id: 'u_3',
        workItemId: 'wi_ml_01',
        title: 'Draft LaTeX report methodology & conclusion',
        estimatedMinutes: 90,
        completedMinutes: 0,
        isCompleted: false,
        orderIndex: 2,
      },
    ],
  },
  {
    id: 'wi_fastapi_02',
    title: 'FastAPI Architecture & Bus',
    description: 'Asynchronous consumer logic, Docker orchestration spec, integration endpoints.',
    category: 'PROJECT',
    status: 'IN_PROGRESS',
    riskLevel: 'SAFE',
    deadlineUtc: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    isHardDeadline: false,
    estimatedEffortHours: 7.0,
    remainingEffortHours: 7.0,
    actualLoggedHours: 0.0,
    dynamicPriorityScore: 78,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'wi_research_03',
    title: 'Design Research Report',
    description: 'Participant interview synthesis, taxonomy codification, and executive summary.',
    category: 'PROJECT',
    status: 'TODO',
    riskLevel: 'SAFE',
    deadlineUtc: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    isHardDeadline: false,
    estimatedEffortHours: 3.0,
    remainingEffortHours: 3.0,
    actualLoggedHours: 0.0,
    dynamicPriorityScore: 55,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'wi_linear_algebra_04',
    title: 'Review Linear Algebra Lecture Notes',
    description: 'Recap on eigenvalue decomposition and exercise 4 before evening cutoff.',
    category: 'ACADEMIC',
    status: 'TODO',
    riskLevel: 'WATCH',
    deadlineUtc: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    isHardDeadline: false,
    estimatedEffortHours: 0.75,
    remainingEffortHours: 0.75,
    actualLoggedHours: 0.0,
    dynamicPriorityScore: 82,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const MOCK_TODAY_OVERVIEW: TodayOverview = {
  dateDisplay: 'Wednesday, Oct 18',
  issueNumber: '042',
  availableFocusHours: 4.5,
  deadlinesCount: 3,
  maxFocusLimitHours: 5.0,
  planItems: [
    {
      id: 'plan_1',
      title: 'Morning Focus: Coursework & Core Problem Solving',
      startTime: '09:30',
      endTime: '11:30',
      durationHours: 2.0,
      status: 'ACTIVE',
      notes: 'Dedicated to high-priority coursework and ML assignment.',
    },
    {
      id: 'plan_2',
      title: 'Afternoon Focus: Architecture Spec & Code Review',
      startTime: '14:30',
      endTime: '17:00',
      durationHours: 2.5,
      status: 'PENDING',
      notes: 'Implementation work, code reviews, and test validations.',
    },
    {
      id: 'plan_3',
      title: 'Evening Protected: Off-hours & Personal Time',
      startTime: '18:30',
      endTime: 'Bedtime',
      durationHours: 4.0,
      status: 'PENDING',
      isProtected: true,
      notes: 'Dinner, gym, and complete screen-off rest.',
    },
  ],
  priorities: MOCK_WORK_ITEMS,
};
