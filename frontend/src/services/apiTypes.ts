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

export interface CriticalItemSummary {
  id: string;
  title: string;
  deadlineUtc?: string;
  remainingEstimatedHours: number;
  availableHoursBeforeDeadline: number;
  riskState: string;
  riskRatio: number;
}

export interface DashboardSummary {
  riskCounts: Record<string, number>;
  criticalItems: CriticalItemSummary[];
  weekWorkloadHours: number;
  weekCapacityHours: number;
  capacityStatus: 'safe' | 'balanced' | 'tight' | 'overloaded';
  capacityMetric?: CapacityMetric;
}

export interface TimelineSlot {
  date: string;
  hours: number;
}

export interface TimelineItemProjection {
  workItemId: string;
  title: string;
  category: string;
  riskState: string;
  deadlineUtc?: string;
  remainingEstimatedHours: number;
  projectedCompletionUtc?: string;
  isProjectedLate: boolean;
  allocatedSlots: TimelineSlot[];
}

export interface TimelineProjection {
  timelineWindow: {
    startDate: string;
    endDate: string;
  };
  items: TimelineItemProjection[];
}

export interface WorkloadPeriod {
  dateLabel: string;
  dayOfWeek: string;
  capacityHours: number;
  demandHours: number;
  utilizationPercentage: number;
  isOverloaded: boolean;
}

export interface WorkloadCapacity {
  periods: WorkloadPeriod[];
}

// AI Intelligence Schemas
export interface AIInterpretationResult {
  title: string;
  description?: string;
  category: string;
  deadline_utc?: string;
  is_hard_deadline: boolean;
  estimated_hours: number;
  deliverable?: string;
  constraints: string[];
  suggested_subtasks: Array<{ sequence_order: number; title: string; estimated_hours: number }>;
  missing_information: string[];
  confidence_score: number;
}

export interface AIDecompositionResult {
  suggested_category: string;
  suggested_units: Array<{
    sequence_order: number;
    title: string;
    description?: string;
    estimated_hours: number;
    dependencies: number[];
  }>;
  total_estimated_hours: number;
}

export interface AIEffortEstimateResult {
  estimated_hours: number;
  suggested_range_min_hours: number;
  suggested_range_max_hours: number;
  complexity: string;
  confidence_score: number;
  variance_risk: string;
  is_guarantee: boolean;
  reasoning: string;
}

export interface AIExplanationResult {
  summary: string;
  contributing_factors: string[];
  mitigations: string[];
  tone: string;
  grounded_metrics: Record<string, unknown>;
}

export interface AIPlanAssistResult {
  plan_date: string;
  recommendations: string[];
  pace_advisory: string;
  pressure_tier: 'relaxed' | 'balanced' | 'overloaded';
  warnings: string[];
}

export interface InsightsSummary {
  observed_blocks_count: number;
  estimation_variance_pct: number;
  pace_factors: Record<string, number>;
  is_early_data: boolean;
}

export interface UserPreferences {
  id?: string;
  user_id?: string;
  timezone: string;
  daily_focus_capacity_hours: number;
  buffer_percentage: number;
  preferred_work_chunk_minutes: number;
  min_break_minutes: number;
  remind_risk_escalation: boolean;
  remind_7_days: boolean;
  remind_3_days: boolean;
  remind_1_day: boolean;
  morning_plan_briefing: boolean;
  briefing_time: string;
  ai_assistance_enabled: boolean;
  theme: string;
}

export interface AvailabilityTemplate {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  capacity_hours: number;
}

export interface ScheduleBlock {
  id: string;
  title: string;
  block_type: string;
  interest_id?: string;
  start_time: string;
  end_time: string;
  is_blackout: boolean;
}

export interface PlanItem {
  id: string;
  work_item_id?: string;
  work_unit_id?: string;
  title: string;
  planned_start?: string;
  planned_end?: string;
  duration_minutes: number;
  sequence_order: number;
  status: string;
  is_protected?: boolean;
  notes?: string;
  startTime?: string;
  endTime?: string;
  durationHours?: number;
}

export interface DailyPlan {
  id: string;
  plan_date: string;
  total_planned_minutes: number;
  total_completed_minutes: number;
  is_finalized: boolean;
  items: PlanItem[];
}
