import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './apiClient';
import {
  WorkItem,
  WorkUnit,
  DashboardSummary,
  TimelineProjection,
  WorkloadCapacity,
  TodayOverview,
  InsightsSummary,
  AIInterpretationResult,
  AIDecompositionResult,
  AIEffortEstimateResult,
  AIExplanationResult,
  AIPlanAssistResult,
  UserPreferences,
  AvailabilityTemplate,
  ScheduleBlock,
  DailyPlan,
  PlanItem,
} from './apiTypes';

// Centralized Query Keys
export const QUERY_KEYS = {
  workItems: ['workItems'] as const,
  workItem: (id: string) => ['workItem', id] as const,
  workUnits: (workItemId: string) => ['workUnits', workItemId] as const,
  dashboardSummary: ['dashboardSummary'] as const,
  timelineProjection: (days: number) => ['timelineProjection', days] as const,
  workloadCapacity: (view: string) => ['workloadCapacity', view] as const,
  todayOverview: ['todayOverview'] as const,
  activeSession: ['activeSession'] as const,
  insightsSummary: ['insightsSummary'] as const,
  workExplanation: (id: string) => ['workExplanation', id] as const,
  dailyPlan: (date: string) => ['dailyPlan', date] as const,
  planAiAssist: (date: string) => ['planAiAssist', date] as const,
  userPreferences: ['userPreferences'] as const,
  availabilityTemplates: ['availabilityTemplates'] as const,
  scheduleBlocks: ['scheduleBlocks'] as const,
};

// ============================================================
// 1. Work Management (CRUD & Lifecycle)
// ============================================================

export function useWorkItems(params?: { category?: string; status?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEYS.workItems, params],
    queryFn: async () => {
      const query = new URLSearchParams();
      if (params?.category && params.category !== 'ALL') query.append('category', params.category.toLowerCase());
      if (params?.status) query.append('status', params.status.toLowerCase());
      const qs = query.toString() ? `?${query.toString()}` : '';
      const data = await apiRequest<{ items: WorkItem[]; total: number }>(`/work${qs}`);
      return data.items || [];
    },
  });
}

export function useCreateWorkItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<WorkItem> & { initial_units?: Array<{ title: string; estimated_hours: number }> }) => {
      return await apiRequest<WorkItem>('/work', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workItems });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardSummary });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todayOverview });
      queryClient.invalidateQueries({ queryKey: ['timelineProjection'] });
      queryClient.invalidateQueries({ queryKey: ['workloadCapacity'] });
    },
  });
}

export function useUpdateWorkItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Partial<WorkItem> }) => {
      return await apiRequest<WorkItem>(`/work/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workItem(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workItems });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardSummary });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todayOverview });
    },
  });
}

export function useDeleteWorkItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest<null>(`/work/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workItems });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardSummary });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todayOverview });
    },
  });
}

export function useWorkItem(id: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.workItem(id || ''),
    enabled: !!id,
    queryFn: async () => {
      return await apiRequest<WorkItem>(`/work/${id}`);
    },
  });
}

// Subtasks (Units)
export function useWorkUnits(workItemId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.workUnits(workItemId || ''),
    enabled: !!workItemId,
    queryFn: async () => {
      const res = await apiRequest<{ units: WorkUnit[] }>(`/work/${workItemId}/units`);
      return res.units || [];
    },
  });

  const createUnitMutation = useMutation({
    mutationFn: async (payload: { title: string; estimated_hours: number; description?: string }) => {
      return await apiRequest<WorkUnit>(`/work/${workItemId}/units`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workUnits(workItemId || '') });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workItem(workItemId || '') });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workItems });
    },
  });

  const updateUnitMutation = useMutation({
    mutationFn: async ({ unitId, payload }: { unitId: string; payload: Partial<WorkUnit> & { is_completed?: boolean; estimated_hours?: number } }) => {
      return await apiRequest<WorkUnit>(`/work/${workItemId}/units/${unitId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workUnits(workItemId || '') });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workItem(workItemId || '') });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workItems });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardSummary });
    },
  });

  const deleteUnitMutation = useMutation({
    mutationFn: async (unitId: string) => {
      return await apiRequest<null>(`/work/${workItemId}/units/${unitId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workUnits(workItemId || '') });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workItem(workItemId || '') });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workItems });
    },
  });

  return {
    ...query,
    createUnit: createUnitMutation.mutateAsync,
    updateUnit: updateUnitMutation.mutateAsync,
    deleteUnit: deleteUnitMutation.mutateAsync,
  };
}

// ============================================================
// 2. Dashboard & Radar Projections
// ============================================================

export function useDashboardSummary() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboardSummary,
    queryFn: async () => {
      return await apiRequest<DashboardSummary>('/dashboard/summary');
    },
  });
}

export function useTimelineProjection(days: number = 14) {
  return useQuery({
    queryKey: QUERY_KEYS.timelineProjection(days),
    queryFn: async () => {
      return await apiRequest<TimelineProjection>(`/timeline/projection?days=${days}`);
    },
  });
}

export function useWorkloadCapacity(view: 'day' | 'week' = 'day') {
  return useQuery({
    queryKey: QUERY_KEYS.workloadCapacity(view),
    queryFn: async () => {
      return await apiRequest<WorkloadCapacity>(`/workload/capacity?view=${view}`);
    },
  });
}

// ============================================================
// 3. Execution & Active Stopwatch Tracking
// ============================================================

export function useTodayOverview() {
  return useQuery({
    queryKey: QUERY_KEYS.todayOverview,
    queryFn: async () => {
      return await apiRequest<TodayOverview>('/today/overview');
    },
  });
}

export function useActiveSessionTracking() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.activeSession,
    queryFn: async () => {
      const res = await apiRequest<{
        id: string;
        work_item_id?: string;
        work_unit_id?: string;
        work_item_title?: string;
        work_unit_title?: string;
        started_at: string;
        elapsed_seconds: number;
        is_active: boolean;
        notes?: string;
      } | null>('/tracking/sessions/active');

      return {
        is_active: !!res?.is_active,
        session: res || null,
      };
    },
    refetchInterval: (query) => (query.state.data?.is_active ? 10000 : false),
  });

  const startSession = useMutation({
    mutationFn: async (payload: { work_item_id?: string; work_unit_id?: string; notes?: string }) => {
      return await apiRequest('/tracking/sessions/start', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeSession });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todayOverview });
    },
  });

  const stopSession = useMutation({
    mutationFn: async (payload?: { notes?: string }) => {
      return await apiRequest('/tracking/sessions/stop', {
        method: 'POST',
        body: JSON.stringify(payload || {}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeSession });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workItems });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardSummary });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todayOverview });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.insightsSummary });
    },
  });

  const logManualTime = useMutation({
    mutationFn: async (payload: {
      work_item_id?: string;
      work_unit_id?: string;
      start_time: string;
      end_time: string;
      duration_minutes?: number;
      notes?: string;
    }) => {
      return await apiRequest('/tracking/entries', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workItems });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardSummary });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todayOverview });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.insightsSummary });
    },
  });

  return {
    ...query,
    startSession: startSession.mutateAsync,
    stopSession: stopSession.mutateAsync,
    logManualTime: logManualTime.mutateAsync,
    isStarting: startSession.isPending,
    isStopping: stopSession.isPending,
  };
}

// ============================================================
// 4. Insights & Personalization
// ============================================================

export function useInsightsSummary() {
  return useQuery({
    queryKey: QUERY_KEYS.insightsSummary,
    queryFn: async () => {
      return await apiRequest<InsightsSummary>('/insights/summary');
    },
  });
}

export function useRecalibratePace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return await apiRequest('/insights/recalibrate-pace', {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.insightsSummary });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workItems });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardSummary });
    },
  });
}

// ============================================================
// 5. AI Intelligence Workflows
// ============================================================

export function useAIInterpretation() {
  return useMutation({
    mutationFn: async (text: string) => {
      return await apiRequest<AIInterpretationResult>('/ai/interpret', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
    },
  });
}

export function useAIDecomposition() {
  return useMutation({
    mutationFn: async (payload: { title: string; category?: string; description?: string }) => {
      return await apiRequest<AIDecompositionResult>('/ai/decompose', {
        method: 'POST',
        body: JSON.stringify({
          work_title: payload.title,
          category: payload.category || 'academic',
          description: payload.description,
        }),
      });
    },
  });
}

export function useApplyDecomposition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      workId,
      units,
    }: {
      workId: string;
      units: Array<{ title: string; estimated_hours: number; description?: string; sequence_order: number }>;
    }) => {
      return await apiRequest<WorkItem>(`/ai/work/${workId}/apply-decomposition`, {
        method: 'POST',
        body: JSON.stringify({ units }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workItem(variables.workId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workUnits(variables.workId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workItems });
    },
  });
}

export function useAIEffortEstimate() {
  return useMutation({
    mutationFn: async (payload: { title: string; category?: string; description?: string }) => {
      return await apiRequest<AIEffortEstimateResult>('/ai/estimate-effort', {
        method: 'POST',
        body: JSON.stringify({
          title: payload.title,
          work_title: payload.title,
          category: payload.category || 'academic',
          description: payload.description,
        }),
      });
    },
  });
}

export function useWorkExplanation(workItemId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.workExplanation(workItemId || ''),
    enabled: !!workItemId,
    queryFn: async () => {
      return await apiRequest<AIExplanationResult>(`/work/${workItemId}/explanation`);
    },
  });
}

// ============================================================
// 6. Planning & Schedules
// ============================================================

export function useDailyPlan(planDate?: string) {
  const dateStr = planDate || new Date().toISOString().split('T')[0];
  return useQuery({
    queryKey: QUERY_KEYS.dailyPlan(dateStr),
    queryFn: async () => {
      return await apiRequest<DailyPlan>(`/planning/${dateStr}`);
    },
  });
}

export function useGeneratePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { target_date: string; max_hours?: number }) => {
      return await apiRequest<{ plan: DailyPlan }>('/planning/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dailyPlan(data.plan.plan_date) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todayOverview });
    },
  });
}

export function useUpdatePlanItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemId,
      payload,
    }: {
      itemId: string;
      payload: { status?: string; notes?: string; sequence_order?: number };
    }) => {
      return await apiRequest<PlanItem>(`/planning/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyPlan'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todayOverview });
    },
  });
}

export function usePlanAIAssist(planDate?: string) {
  const dateStr = planDate || new Date().toISOString().split('T')[0];
  return useQuery({
    queryKey: QUERY_KEYS.planAiAssist(dateStr),
    queryFn: async () => {
      return await apiRequest<AIPlanAssistResult>(`/planning/${dateStr}/ai-assist`);
    },
  });
}

// ============================================================
// 7. Settings & User Preferences
// ============================================================

export function useUserPreferences() {
  return useQuery({
    queryKey: QUERY_KEYS.userPreferences,
    queryFn: async () => {
      return await apiRequest<UserPreferences>('/users/me/preferences');
    },
  });
}

export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<UserPreferences>) => {
      return await apiRequest<UserPreferences>('/users/me/preferences', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userPreferences });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todayOverview });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardSummary });
    },
  });
}

export function useAvailabilityTemplates() {
  return useQuery({
    queryKey: QUERY_KEYS.availabilityTemplates,
    queryFn: async () => {
      const res = await apiRequest<{ templates: AvailabilityTemplate[] }>('/availability/templates');
      return res.templates || [];
    },
  });
}

export function useUpdateAvailabilityTemplates() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (templates: AvailabilityTemplate[]) => {
      return await apiRequest<{ templates: AvailabilityTemplate[] }>('/availability/templates', {
        method: 'PUT',
        body: JSON.stringify({ templates }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.availabilityTemplates });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardSummary });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todayOverview });
      queryClient.invalidateQueries({ queryKey: ['timelineProjection'] });
      queryClient.invalidateQueries({ queryKey: ['workloadCapacity'] });
    },
  });
}

export function useScheduleBlocks(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.scheduleBlocks, startDate, endDate],
    queryFn: async () => {
      const query = new URLSearchParams();
      if (startDate) query.append('start_date', startDate);
      if (endDate) query.append('end_date', endDate);
      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await apiRequest<{ blocks: ScheduleBlock[] }>(`/availability/blocks${qs}`);
      return res.blocks || [];
    },
  });
}

export function useCreateScheduleBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      block_type?: string;
      start_time: string;
      end_time: string;
      is_blackout?: boolean;
    }) => {
      return await apiRequest<ScheduleBlock>('/availability/blocks', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.scheduleBlocks });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardSummary });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todayOverview });
    },
  });
}

export function useDeleteScheduleBlock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (blockId: string) => {
      return await apiRequest<null>(`/availability/blocks/${blockId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.scheduleBlocks });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardSummary });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.todayOverview });
    },
  });
}
