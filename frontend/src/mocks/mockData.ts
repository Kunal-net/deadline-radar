/**
 * Mock Data for Frontend Foundation & Development
 *
 * NOTE: This mock dataset directly reflects the finalized design screens
 * in Stitch project 17354903279475530867. It allows the UI to render
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
    deadlineUtc: '2026-10-19T17:00:00Z',
    isHardDeadline: true,
    estimatedEffortHours: 4.5,
    remainingEffortHours: 4.5,
    actualLoggedHours: 1.5,
    dynamicPriorityScore: 94,
    createdAt: '2026-10-14T09:00:00Z',
    updatedAt: '2026-10-18T11:00:00Z',
    units: [
      {
        id: 'u_1',
        workItemId: 'wi_ml_01',
        title: 'Run baseline validation loss curves and compute confusion matrix',
        estimatedMinutes: 60,
        completedMinutes: 60,
        isCompleted: true,
        orderIndex: 0,
      },
      {
        id: 'u_2',
        workItemId: 'wi_ml_01',
        title: 'Hyperparameter grid search & ablation study table',
        estimatedMinutes: 120,
        completedMinutes: 30,
        isCompleted: false,
        orderIndex: 1,
      },
      {
        id: 'u_3',
        workItemId: 'wi_ml_01',
        title: 'Draft LaTeX report methodology, plots & discussion',
        estimatedMinutes: 90,
        completedMinutes: 0,
        isCompleted: false,
        orderIndex: 2,
      },
    ],
  },
  {
    id: 'wi_fastapi_02',
    title: 'FastAPI Architecture & Core Bus',
    description: 'Asynchronous consumer logic, Docker orchestration spec, integration endpoints.',
    category: 'PROJECT',
    status: 'IN_PROGRESS',
    riskLevel: 'SAFE',
    deadlineUtc: '2026-10-22T18:00:00Z',
    isHardDeadline: false,
    estimatedEffortHours: 7.0,
    remainingEffortHours: 5.5,
    actualLoggedHours: 1.5,
    dynamicPriorityScore: 78,
    createdAt: '2026-10-12T10:00:00Z',
    updatedAt: '2026-10-18T10:30:00Z',
  },
  {
    id: 'wi_research_03',
    title: 'Design Research Report',
    description: 'Participant interview synthesis, taxonomy codification, and executive summary.',
    category: 'PROJECT',
    status: 'TODO',
    riskLevel: 'SAFE',
    deadlineUtc: '2026-10-25T17:00:00Z',
    isHardDeadline: false,
    estimatedEffortHours: 3.0,
    remainingEffortHours: 3.0,
    actualLoggedHours: 0.0,
    dynamicPriorityScore: 55,
    createdAt: '2026-10-15T14:00:00Z',
    updatedAt: '2026-10-15T14:00:00Z',
  },
  {
    id: 'wi_linear_algebra_04',
    title: 'Review Linear Algebra Lecture Notes',
    description: 'Recap on eigenvalue decomposition and exercise 4 before evening cutoff.',
    category: 'ACADEMIC',
    status: 'TODO',
    riskLevel: 'WATCH',
    deadlineUtc: '2026-10-18T18:00:00Z',
    isHardDeadline: false,
    estimatedEffortHours: 0.75,
    remainingEffortHours: 0.75,
    actualLoggedHours: 0.0,
    dynamicPriorityScore: 82,
    createdAt: '2026-10-17T08:00:00Z',
    updatedAt: '2026-10-18T08:00:00Z',
  },
  {
    id: 'wi_portfolio_05',
    title: 'Portfolio Case Study & Visual Polish',
    description: 'Export high-res diagram assets, verify typography hierarchy and link anchors.',
    category: 'PROJECT',
    status: 'TODO',
    riskLevel: 'SAFE',
    deadlineUtc: '2026-10-28T23:59:00Z',
    isHardDeadline: false,
    estimatedEffortHours: 4.0,
    remainingEffortHours: 4.0,
    actualLoggedHours: 0.0,
    dynamicPriorityScore: 42,
    createdAt: '2026-10-16T11:00:00Z',
    updatedAt: '2026-10-16T11:00:00Z',
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
      title: 'Morning Focus: ML Assignment Model Evaluation',
      startTime: '09:30',
      endTime: '11:30',
      durationHours: 2.0,
      status: 'ACTIVE',
      notes: 'Dedicated deep work: ablation table & validation loss curves.',
    },
    {
      id: 'plan_2',
      title: 'Afternoon Focus: Architecture Spec & Code Review',
      startTime: '14:30',
      endTime: '17:00',
      durationHours: 2.5,
      status: 'PENDING',
      notes: 'FastAPI async consumer endpoints and test suite validation.',
    },
    {
      id: 'plan_3',
      title: 'Evening Protected: Sanctuary & Off-hours Rest',
      startTime: '18:30',
      endTime: '22:30',
      durationHours: 4.0,
      status: 'PENDING',
      isProtected: true,
      notes: 'Non-negotiable screen-off rest, dinner, physical training.',
    },
  ],
  priorities: MOCK_WORK_ITEMS,
};

export interface WorkloadDay {
  dayName: string;
  dateStr: string;
  allocatedHours: number;
  maxCeilingHours: number;
  status: 'SAFE' | 'AT_LIMIT' | 'OVERLOAD' | 'OFF';
  items: { title: string; hours: number; category: string }[];
}

export const MOCK_WORKLOAD_DAYS: WorkloadDay[] = [
  {
    dayName: 'Monday',
    dateStr: 'Oct 16',
    allocatedHours: 3.5,
    maxCeilingHours: 4.0,
    status: 'SAFE',
    items: [
      { title: 'ML Data Pipeline Setup', hours: 2.0, category: 'Academic' },
      { title: 'Architecture Review', hours: 1.5, category: 'Project' },
    ],
  },
  {
    dayName: 'Tuesday',
    dateStr: 'Oct 17',
    allocatedHours: 4.0,
    maxCeilingHours: 4.0,
    status: 'AT_LIMIT',
    items: [
      { title: 'Model Checkpoint Training', hours: 2.5, category: 'Academic' },
      { title: 'Docker Compose Spec', hours: 1.5, category: 'Project' },
    ],
  },
  {
    dayName: 'Wednesday',
    dateStr: 'Oct 18',
    allocatedHours: 4.5,
    maxCeilingHours: 4.0,
    status: 'OVERLOAD',
    items: [
      { title: 'ML ResNet Retraining', hours: 2.0, category: 'Academic' },
      { title: 'FastAPI Core Bus', hours: 2.0, category: 'Project' },
      { title: 'Linear Algebra Recap', hours: 0.5, category: 'Academic' },
    ],
  },
  {
    dayName: 'Thursday',
    dateStr: 'Oct 19',
    allocatedHours: 3.0,
    maxCeilingHours: 4.0,
    status: 'SAFE',
    items: [
      { title: 'Final LaTeX Submission Check', hours: 1.5, category: 'Academic' },
      { title: 'API Integration Test Run', hours: 1.5, category: 'Project' },
    ],
  },
  {
    dayName: 'Friday',
    dateStr: 'Oct 20',
    allocatedHours: 2.0,
    maxCeilingHours: 4.0,
    status: 'SAFE',
    items: [
      { title: 'Design Research Synthesis', hours: 2.0, category: 'Project' },
    ],
  },
  {
    dayName: 'Saturday',
    dateStr: 'Oct 21',
    allocatedHours: 0.0,
    maxCeilingHours: 4.0,
    status: 'OFF',
    items: [],
  },
  {
    dayName: 'Sunday',
    dateStr: 'Oct 22',
    allocatedHours: 0.0,
    maxCeilingHours: 4.0,
    status: 'OFF',
    items: [],
  },
];

export interface CalendarSlot {
  id: string;
  day: number; // 0: Mon, 1: Tue, 2: Wed, 3: Thu, 4: Fri
  startTime: string;
  endTime: string;
  title: string;
  category: string;
  type: 'FOCUS' | 'BLACKOUT' | 'DEADLINE';
  isHardDeadline?: boolean;
}

export const MOCK_CALENDAR_SLOTS: CalendarSlot[] = [
  { id: 'cs_1', day: 0, startTime: '09:30', endTime: '11:30', title: 'ML Assignment Focus', category: 'Academic', type: 'FOCUS' },
  { id: 'cs_2', day: 0, startTime: '13:00', endTime: '14:00', title: 'Faculty Check-in', category: 'Meeting', type: 'BLACKOUT' },
  { id: 'cs_3', day: 1, startTime: '10:00', endTime: '12:30', title: 'Design Systems Review', category: 'Project', type: 'FOCUS' },
  { id: 'cs_4', day: 2, startTime: '09:30', endTime: '11:30', title: 'ML Evaluation Run', category: 'Academic', type: 'FOCUS' },
  { id: 'cs_5', day: 2, startTime: '14:30', endTime: '17:00', title: 'FastAPI Core Architecture', category: 'Project', type: 'FOCUS' },
  { id: 'cs_6', day: 3, startTime: '09:00', endTime: '10:30', title: 'Literature Citations', category: 'Research', type: 'FOCUS' },
  { id: 'cs_7', day: 3, startTime: '17:00', endTime: '17:00', title: 'ML Submission Deadline', category: 'Academic', type: 'DEADLINE', isHardDeadline: true },
  { id: 'cs_8', day: 4, startTime: '14:00', endTime: '16:00', title: 'Sprint Synthesis', category: 'Project', type: 'FOCUS' },
];

export interface TimelineWeek {
  weekNumber: number;
  dateRange: string;
  capacityHours: number;
  committedHours: number;
  status: 'SAFE' | 'TIGHT' | 'OVERLOAD';
  deliverables: { title: string; category: string; deadline: string; isHard: boolean; hours: number }[];
}

export const MOCK_TIMELINE_WEEKS: TimelineWeek[] = [
  {
    weekNumber: 42,
    dateRange: 'Oct 16 – 22',
    capacityHours: 18.5,
    committedHours: 14.5,
    status: 'SAFE',
    deliverables: [
      { title: 'Machine Learning Assignment', category: 'Academic', deadline: 'Thu, Oct 19', isHard: true, hours: 4.5 },
      { title: 'Review Linear Algebra Notes', category: 'Academic', deadline: 'Wed, Oct 18', isHard: false, hours: 0.75 },
    ],
  },
  {
    weekNumber: 43,
    dateRange: 'Oct 23 – 29',
    capacityHours: 18.5,
    committedHours: 19.0,
    status: 'OVERLOAD',
    deliverables: [
      { title: 'FastAPI Architecture & Bus', category: 'Project', deadline: 'Sun, Oct 29', isHard: false, hours: 7.0 },
      { title: 'Design Research Report', category: 'Project', deadline: 'Fri, Oct 27', isHard: false, hours: 3.0 },
    ],
  },
  {
    weekNumber: 44,
    dateRange: 'Oct 30 – Nov 5',
    capacityHours: 18.5,
    committedHours: 12.0,
    status: 'SAFE',
    deliverables: [
      { title: 'Midterm Evaluation Prep', category: 'Academic', deadline: 'Fri, Nov 3', isHard: true, hours: 8.0 },
    ],
  },
  {
    weekNumber: 45,
    dateRange: 'Nov 6 – 12',
    capacityHours: 18.5,
    committedHours: 8.5,
    status: 'SAFE',
    deliverables: [
      { title: 'Portfolio Case Study', category: 'Research', deadline: 'Sun, Nov 12', isHard: false, hours: 4.0 },
    ],
  },
];

export interface PriorityItemDetail {
  rank: number;
  workItemId: string;
  title: string;
  category: string;
  score: number;
  statusBadge: string;
  reasoning: string;
  remainingHours: number;
  deadlineRelative: string;
  gapText: string;
}

export const MOCK_PRIORITY_STACK: PriorityItemDetail[] = [
  {
    rank: 1,
    workItemId: 'wi_ml_01',
    title: 'Machine Learning Assignment',
    category: 'Academic',
    score: 94,
    statusBadge: 'Critical Urgency',
    reasoning: 'Hard deadline in 28 hours with 4.5h remaining effort. Available calendar slots before Thursday 17:00 exactly match required focus time. Zero margin for delay.',
    remainingHours: 4.5,
    deadlineRelative: 'In 28h (Thu 17:00)',
    gapText: '0.0h buffer gap',
  },
  {
    rank: 2,
    workItemId: 'wi_linear_algebra_04',
    title: 'Review Linear Algebra Lecture Notes',
    category: 'Academic',
    score: 82,
    statusBadge: 'Watch Horizon',
    reasoning: 'Pre-requisite conceptual review required before completing final equations in ML LaTeX write-up. Recommended to clear before 18:00.',
    remainingHours: 0.75,
    deadlineRelative: 'Today 18:00',
    gapText: '+1.5h net buffer',
  },
  {
    rank: 3,
    workItemId: 'wi_fastapi_02',
    title: 'FastAPI Architecture & Bus',
    category: 'Project',
    score: 78,
    statusBadge: 'Active Pipeline',
    reasoning: 'Elastic deadline with 4 days remaining. Can absorb up to 1.5 days delay without impacting week 43 commitments.',
    remainingHours: 5.5,
    deadlineRelative: 'In 4 days (Oct 22)',
    gapText: '+3.0h net buffer',
  },
  {
    rank: 4,
    workItemId: 'wi_research_03',
    title: 'Design Research Report',
    category: 'Project',
    score: 55,
    statusBadge: 'Protected Pacing',
    reasoning: 'Substantial time horizon available. High focus units should be scheduled after week 42 hard deadlines clear.',
    remainingHours: 3.0,
    deadlineRelative: 'In 7 days (Oct 25)',
    gapText: '+8.5h net buffer',
  },
];
