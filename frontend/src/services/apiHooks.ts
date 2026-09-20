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
} from './apiTypes';
import {
  MOCK_WORK_ITEMS,
  MOCK_CAPACITY_METRIC,
  MOCK_TODAY_OVERVIEW,
} from '../mocks/mockData';

// Query Keys
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
  planAiAssist: (date: string) => ['planAiAssist', date] as const,
};

// 1. Work Items Query & Create
export function useWorkItems(params?: { category?: string; status?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEYS.workItems, params],
    queryFn: async () => {
      try {
        const query = new URLSearchParams();
        if (params?.category && params.category !== 'ALL') query.append('category', params.category);
        if (params?.status) query.append('status', params.status);
        const qs = query.toString() ? `?${query.toString()}` : '';
        const data = await apiRequest<{ items: WorkItem[] }>(`/work${qs}`);
        return data.items || [];
      } catch {
        return MOCK_WORK_ITEMS;
      }
    },
  });
}

export function useCreateWorkItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<WorkItem>) => {
      try {
        return await apiRequest<WorkItem>('/work', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } catch {
        // Mock fallback creation
        const newItem: WorkItem = {
          id: `work-${Date.now()}`,
          title: payload.title || 'Untitled Work Item',
          category: payload.category || 'ACADEMIC',
          estimatedEffortHours: payload.estimatedEffortHours || 3.0,
          remainingEffortHours: payload.remainingEffortHours || 3.0,
          actualLoggedHours: 0,
          deadlineUtc: payload.deadlineUtc || new Date().toISOString(),
          isHardDeadline: payload.isHardDeadline ?? true,
          riskLevel: payload.riskLevel || 'SAFE',
          status: payload.status || 'TODO',
          dynamicPriorityScore: 50,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return newItem;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workItems });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardSummary });
    },
  });
}

// 2. Work Item Detail Query
export function useWorkItem(id: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.workItem(id || ''),
    enabled: !!id,
    queryFn: async () => {
      try {
        return await apiRequest<WorkItem>(`/work/${id}`);
      } catch {
        return MOCK_WORK_ITEMS.find((w) => w.id === id) || MOCK_WORK_ITEMS[0];
      }
    },
  });
}

// 3. Work Units Query & Mutations
export function useWorkUnits(workItemId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.workUnits(workItemId || ''),
    enabled: !!workItemId,
    queryFn: async () => {
      try {
        const res = await apiRequest<{ units: WorkUnit[] }>(`/work/${workItemId}/units`);
        return res.units || [];
      } catch {
        const found = MOCK_WORK_ITEMS.find((w) => w.id === workItemId);
        return found?.units || [];
      }
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
    mutationFn: async ({ unitId, payload }: { unitId: string; payload: Partial<WorkUnit> }) => {
      return await apiRequest<WorkUnit>(`/work/${workItemId}/units/${unitId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workUnits(workItemId || '') });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workItem(workItemId || '') });
    },
  });

  return { ...query, createUnit: createUnitMutation.mutateAsync, updateUnit: updateUnitMutation.mutateAsync };
}

// 4. Dashboard Summary Query
export function useDashboardSummary() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboardSummary,
    queryFn: async () => {
      try {
        return await apiRequest<DashboardSummary>('/dashboard/summary');
      } catch {
        return {
          riskCounts: { safe: 4, watch: 2, at_risk: 1, critical: 1, overdue: 0 },
          criticalItems: [
            {
              id: 'wi_ml_01',
              title: 'Machine Learning Assignment',
              deadlineUtc: '2026-10-19T17:00:00Z',
              remainingEstimatedHours: 4.5,
              availableHoursBeforeDeadline: 2.5,
              riskState: 'critical',
              riskRatio: 1.8,
            },
          ],
          weekWorkloadHours: MOCK_CAPACITY_METRIC.committedWorkHours,
          weekCapacityHours: MOCK_CAPACITY_METRIC.availableFocusHours,
          capacityStatus: 'balanced' as const,
          capacityMetric: MOCK_CAPACITY_METRIC,
        };
      }
    },
  });
}

// 5. Timeline Projection Query
export function useTimelineProjection(days: number = 14) {
  return useQuery({
    queryKey: QUERY_KEYS.timelineProjection(days),
    queryFn: async () => {
      try {
        return await apiRequest<TimelineProjection>(`/timeline/projection?days=${days}`);
      } catch {
        return {
          timelineWindow: {
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
          },
          items: [],
        };
      }
    },
  });
}

// 6. Workload Capacity Query
export function useWorkloadCapacity(view: 'day' | 'week' = 'day') {
  return useQuery({
    queryKey: QUERY_KEYS.workloadCapacity(view),
    queryFn: async () => {
      try {
        return await apiRequest<WorkloadCapacity>(`/workload/capacity?view=${view}`);
      } catch {
        return { periods: [] };
      }
    },
  });
}

// 7. Today Overview Query
export function useTodayOverview() {
  return useQuery({
    queryKey: QUERY_KEYS.todayOverview,
    queryFn: async () => {
      try {
        return await apiRequest<TodayOverview>('/today/overview');
      } catch {
        return MOCK_TODAY_OVERVIEW;
      }
    },
  });
}

// 8. Active Session Tracking Query & Mutations
export function useActiveSessionTracking() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.activeSession,
    queryFn: async () => {
      try {
        return await apiRequest<{ is_active: boolean; session?: unknown }>('/tracking/session/active');
      } catch {
        return { is_active: false };
      }
    },
  });

  const startSession = useMutation({
    mutationFn: async (payload: { title: string; work_item_id?: string }) => {
      return await apiRequest('/tracking/session/start', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeSession }),
  });

  const pauseSession = useMutation({
    mutationFn: async () => {
      return await apiRequest('/tracking/session/pause', { method: 'POST' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeSession }),
  });

  const resumeSession = useMutation({
    mutationFn: async () => {
      return await apiRequest('/tracking/session/resume', { method: 'POST' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeSession }),
  });

  const stopSession = useMutation({
    mutationFn: async () => {
      return await apiRequest('/tracking/session/stop', { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.activeSession });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workItems });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardSummary });
    },
  });

  return {
    ...query,
    startSession: startSession.mutateAsync,
    pauseSession: pauseSession.mutateAsync,
    resumeSession: resumeSession.mutateAsync,
    stopSession: stopSession.mutateAsync,
  };
}

// 9. Insights Summary Query
export function useInsightsSummary() {
  return useQuery({
    queryKey: QUERY_KEYS.insightsSummary,
    queryFn: async () => {
      try {
        return await apiRequest<InsightsSummary>('/insights/summary');
      } catch {
        return {
          observed_blocks_count: 34,
          estimation_variance_pct: 12.4,
          pace_factors: { academic: 1.15, project: 0.95, personal: 1.0 },
          is_early_data: false,
        };
      }
    },
  });
}

// 10. AI Mutations & Queries
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

export function useAIEffortEstimate() {
  return useMutation({
    mutationFn: async (payload: { title: string; category?: string; description?: string }) => {
      return await apiRequest<AIEffortEstimateResult>('/ai/estimate-effort', {
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

export function useWorkExplanation(workItemId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.workExplanation(workItemId || ''),
    enabled: !!workItemId,
    queryFn: async () => {
      try {
        return await apiRequest<AIExplanationResult>(`/work/${workItemId}/explanation`);
      } catch {
        return {
          summary: 'Nominal effort exceeds currently available calendar focus capacity before Friday evening.',
          contributing_factors: [
            'Remaining 4.5h requires more focus than the 2.5h available prior to the deadline.',
            'Thursday afternoon contains 2.0h blackout commitments.',
          ],
          mitigations: [
            'Reschedule 1.5h non-critical meetings on Thursday.',
            'Delegate or downscope secondary validation loss curves.',
          ],
          tone: 'supportive',
          grounded_metrics: { risk_ratio: 1.8, remaining_hours: 4.5, available_hours: 2.5 },
        };
      }
    },
  });
}

export function usePlanAIAssist(planDate: string = 'today') {
  return useQuery({
    queryKey: QUERY_KEYS.planAiAssist(planDate),
    queryFn: async () => {
      try {
        return await apiRequest<AIPlanAssistResult>(`/planning/${planDate}/ai-assist`);
      } catch {
        return {
          plan_date: planDate,
          recommendations: [
            'Shift 1.0h LaTeX report compilation to tomorrow morning to avoid evening fatigue.',
            'Protect 18:00–21:00 evening sanctuary boundary.',
          ],
          pace_advisory: 'Current workload matches your historical 4.5h daily cognitive focus budget comfortably.',
          pressure_tier: 'balanced' as const,
          warnings: [],
        };
      }
    },
  });
}
