export type RiskLevel = 'SAFE' | 'WATCH' | 'AT_RISK' | 'CRITICAL' | 'OVERDUE';
export type WorkStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED';
export type WorkCategory = 'ACADEMIC' | 'PROJECT' | 'EXAM_PREP' | 'CAREER' | 'PERSONAL';

export interface WorkUnit {
  id: string;
  workItemId: string;
  title: string;
  estimatedMinutes: number;
  completedMinutes: number;
  isCompleted: boolean;
  orderIndex: number;
}

export interface WorkItem {
  id: string;
  title: string;
  description?: string;
  category: WorkCategory;
  status: WorkStatus;
  riskLevel: RiskLevel;
  deadlineUtc: string; // ISO UTC
  isHardDeadline: boolean;
  estimatedEffortHours: number;
  remainingEffortHours: number;
  actualLoggedHours: number;
  dynamicPriorityScore: number;
  createdAt: string;
  updatedAt: string;
  units?: WorkUnit[];
}

export interface CapacityMetric {
  availableFocusHours: number;
  committedWorkHours: number;
  netBufferHours: number;
  riskAssessment: string;
  weekNumber: number;
}

export interface TodayPlanItem {
  id: string;
  workItemId?: string;
  title: string;
  startTime: string; // "09:30"
  endTime: string;   // "11:30"
  durationHours: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
  isProtected?: boolean;
  notes?: string;
}

export interface TodayOverview {
  dateDisplay: string;
  issueNumber: string;
  availableFocusHours: number;
  deadlinesCount: number;
  maxFocusLimitHours: number;
  planItems: TodayPlanItem[];
  priorities: WorkItem[];
}
