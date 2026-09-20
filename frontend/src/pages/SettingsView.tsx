import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import {
  useUserPreferences,
  useUpdateUserPreferences,
  useAvailabilityTemplates,
  useUpdateAvailabilityTemplates,
} from '../services/apiHooks';

type SettingsTab = 'all' | 'capacity' | 'boundaries' | 'intelligence' | 'account' | 'notifications';

export const SettingsView: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const { data: preferences } = useUserPreferences();
  const { data: templates } = useAvailabilityTemplates();
  const updatePrefMutation = useUpdateUserPreferences();
  const updateAvailMutation = useUpdateAvailabilityTemplates();

  const [activeTab, setActiveTab] = useState<SettingsTab>('all');
  const [weeklyHours, setWeeklyHours] = useState(18.5);
  const [dailyHours, setDailyHours] = useState(4.5);
  const [activeDays, setActiveDays] = useState<Record<string, boolean>>({
    Mon: true,
    Tue: true,
    Wed: true,
    Thu: true,
    Fri: true,
    Sat: false,
    Sun: false,
  });
  const [weekendPolicy, setWeekendPolicy] = useState(true);
  const [safetyBuffer, setSafetyBuffer] = useState(true);
  const [nudgeOption, setNudgeOption] = useState('Notify 24h before buffer begins compressing');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Sync preferences from backend when loaded
  useEffect(() => {
    if (preferences) {
      if (preferences.daily_focus_capacity_hours) {
        setDailyHours(preferences.daily_focus_capacity_hours);
        setWeeklyHours(Math.round(preferences.daily_focus_capacity_hours * 5 * 10) / 10);
      }
      if (preferences.buffer_percentage !== undefined) {
        setSafetyBuffer(preferences.buffer_percentage > 0);
      }
    }
  }, [preferences]);

  // Sync availability templates from backend when loaded
  useEffect(() => {
    if (templates && templates.length > 0) {
      const daysKey = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const newActiveDays: Record<string, boolean> = { ...activeDays };
      templates.forEach((t) => {
        if (t.day_of_week >= 0 && t.day_of_week < 7) {
          newActiveDays[daysKey[t.day_of_week]] = t.is_available;
        }
      });
      setActiveDays(newActiveDays);
    }
  }, [templates]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updatePrefMutation.mutateAsync({
        daily_focus_capacity_hours: dailyHours,
        buffer_percentage: safetyBuffer ? 15.0 : 0.0,
        remind_risk_escalation: nudgeOption.includes('24h') || nudgeOption.includes('48h'),
        ai_assistance_enabled: true,
      });

      const daysMap: Record<string, number> = {
        Mon: 0,
        Tue: 1,
        Wed: 2,
        Thu: 3,
        Fri: 4,
        Sat: 5,
        Sun: 6,
      };

      const newTemplates = Object.entries(activeDays).map(([day, active]) => ({
        day_of_week: daysMap[day],
        start_time: '09:00:00',
        end_time: '18:00:00',
        is_available: active,
        capacity_hours: active ? dailyHours : 0.0,
      }));

      await updateAvailMutation.mutateAsync(newTemplates);

      showToast('Settings saved successfully. Capacity baseline recalibrated and persisted.');
    } catch (err: any) {
      showToast(`Failed to save settings: ${err?.message || 'Server error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCalendar = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('deadline_radar_token');
      const res = await fetch('http://localhost:8000/api/v1/availability/export.ics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to export calendar');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'deadline_radar.ics';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Calendar export downloaded successfully (deadline_radar.ics).');
    } catch (err: any) {
      showToast(`Export failed: ${err?.message || 'Server error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDay = (day: string) => {
    setActiveDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const activeDaysCount = Object.values(activeDays).filter(Boolean).length;

  const showSection = (tab: SettingsTab) => {
    return activeTab === 'all' || activeTab === tab;
  };

  return (
    <div className="w-full bg-surface min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-margin-mobile md:px-margin-tablet lg:px-margin pt-space-lg pb-space-2xl">
        {/* Editorial Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
          <div className="flex flex-col max-w-2xl">
            <div className="flex items-center gap-space-xs mb-space-xs">
              <span className="w-1.5 h-1.5 bg-accent-terracotta inline-block shrink-0" />
              <span className="font-label-md text-label-md text-ink-muted">
                Environment &amp; Discipline
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-ink-primary tracking-tight">
              Settings
            </h1>
            <p className="font-body-lg text-body-lg text-ink-secondary mt-space-xs">
              Configure your personal capacity baseline, non-negotiable boundaries, and intelligent assistance.
            </p>
          </div>
          <div className="flex items-center gap-space-sm self-start md:self-auto">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-ink-primary hover:bg-accent-terracotta text-canvas-paper px-space-lg py-space-sm font-label-lg text-label-lg transition-colors duration-200 flex items-center gap-space-xs cursor-pointer rounded-none disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="mb-space-md p-space-sm bg-surface-cream border border-border-hairline text-ink-primary font-body-md text-sm animate-pulse"
          >
            {toastMessage}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="w-full flex items-center gap-space-xs overflow-x-auto pb-space-xs mb-space-xl scrollbar-none bg-surface-container-low p-1.5 rounded-none border border-border-hairline">
          <button
            onClick={() => setActiveTab('all')}
            className={`font-label-lg text-label-lg px-space-md py-space-xs rounded-none transition-all flex items-center gap-space-xs cursor-pointer ${
              activeTab === 'all'
                ? 'bg-surface text-ink-primary font-semibold'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <span>Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('capacity')}
            className={`font-label-lg text-label-lg px-space-md py-space-xs rounded-none transition-all flex items-center gap-space-xs cursor-pointer ${
              activeTab === 'capacity'
                ? 'bg-surface text-ink-primary font-semibold'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-accent-terracotta">schedule</span>
            <span>Capacity &amp; Hours</span>
          </button>
          <button
            onClick={() => setActiveTab('boundaries')}
            className={`font-label-lg text-label-lg px-space-md py-space-xs rounded-none transition-all flex items-center gap-space-xs cursor-pointer ${
              activeTab === 'boundaries'
                ? 'bg-surface text-ink-primary font-semibold'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">shield_lock</span>
            <span>Boundaries</span>
          </button>
          <button
            onClick={() => setActiveTab('intelligence')}
            className={`font-label-lg text-label-lg px-space-md py-space-xs rounded-none transition-all flex items-center gap-space-xs cursor-pointer ${
              activeTab === 'intelligence'
                ? 'bg-surface text-ink-primary font-semibold'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">psychology</span>
            <span>Intelligence</span>
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`font-label-lg text-label-lg px-space-md py-space-xs rounded-none transition-all flex items-center gap-space-xs cursor-pointer ${
              activeTab === 'account'
                ? 'bg-surface text-ink-primary font-semibold'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person</span>
            <span>Account</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`font-label-lg text-label-lg px-space-md py-space-xs rounded-none transition-all flex items-center gap-space-xs cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-surface text-ink-primary font-semibold'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Nudges</span>
          </button>
        </div>

        {/* Main Two-Column Asymmetric Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left Column: Functional Sections */}
          <div className="lg:col-span-8 flex flex-col gap-space-xl">
            {/* Section 1: Work Capacity & Diurnal Rhythm */}
            {showSection('capacity') && (
              <section
                className="bg-surface-container-lowest p-space-lg rounded-none border border-border-hairline relative overflow-hidden"
                id="section-capacity"
              >
                <div className="flex items-start justify-between mb-space-lg">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-md text-label-md text-ink-muted">01</span>
                      <h2 className="font-headline-lg text-headline-lg text-ink-primary">
                        Work Capacity &amp; Diurnal Rhythm
                      </h2>
                    </div>
                    <p className="font-body-md text-body-md text-ink-secondary mt-1">
                      Define the strict finite bounds of deep cognitive work per week and day.
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-none bg-surface-cream text-ink-primary font-label-md text-label-md border border-border-hairline">
                    Active Policy
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg mb-space-lg">
                  {/* Weekly Focus Hours Adjuster */}
                  <div className="bg-surface-container-low p-space-md rounded-none border border-border-hairline flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-space-sm">
                      <label className="font-label-lg text-label-lg text-ink-primary">Weekly Focus Baseline</label>
                      <span className="material-symbols-outlined text-ink-muted text-[20px]">timelapse</span>
                    </div>
                    <p className="font-body-md text-body-md text-ink-secondary mb-space-md">
                      Real cognitive work upper-bound across 7 rolling days.
                    </p>
                    <div className="flex items-center justify-between bg-surface p-space-xs rounded-none border border-border-hairline">
                      <button
                        onClick={() => setWeeklyHours((prev) => Math.max(2.0, Math.round((prev - 0.5) * 10) / 10))}
                        className="w-10 h-10 flex items-center justify-center text-ink-primary hover:bg-surface-cream rounded-none transition-colors text-headline-md leading-none font-headline-md cursor-pointer select-none"
                        type="button"
                      >
                        −
                      </button>
                      <div className="text-center px-space-sm">
                        <span className="font-numeric-hero text-[34px] leading-tight text-ink-primary">
                          {weeklyHours.toFixed(1)}
                        </span>
                        <span className="font-label-md text-label-md text-ink-muted block uppercase tracking-wider">
                          hrs / week
                        </span>
                      </div>
                      <button
                        onClick={() => setWeeklyHours((prev) => Math.min(60.0, Math.round((prev + 0.5) * 10) / 10))}
                        className="w-10 h-10 flex items-center justify-center text-ink-primary hover:bg-surface-cream rounded-none transition-colors text-headline-md leading-none font-headline-md cursor-pointer select-none"
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Daily Limit Adjuster */}
                  <div className="bg-surface-container-low p-space-md rounded-none border border-border-hairline flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-space-sm">
                      <label className="font-label-lg text-label-lg text-ink-primary">Maximum Daily Focus</label>
                      <span className="material-symbols-outlined text-accent-terracotta text-[20px]">bolt</span>
                    </div>
                    <p className="font-body-md text-body-md text-ink-secondary mb-space-md">
                      Hard ceiling per 24-hour block to prevent cognitive fatigue.
                    </p>
                    <div className="flex items-center justify-between bg-surface p-space-xs rounded-none border border-border-hairline">
                      <button
                        onClick={() => setDailyHours((prev) => Math.max(1.0, Math.round((prev - 0.5) * 10) / 10))}
                        className="w-10 h-10 flex items-center justify-center text-ink-primary hover:bg-surface-cream rounded-none transition-colors text-headline-md leading-none font-headline-md cursor-pointer select-none"
                        type="button"
                      >
                        −
                      </button>
                      <div className="text-center px-space-sm">
                        <span className="font-numeric-hero text-[34px] leading-tight text-ink-primary">
                          {dailyHours.toFixed(1)}
                        </span>
                        <span className="font-label-md text-label-md text-ink-muted block uppercase tracking-wider">
                          hrs / day
                        </span>
                      </div>
                      <button
                        onClick={() => setDailyHours((prev) => Math.min(14.0, Math.round((prev + 0.5) * 10) / 10))}
                        className="w-10 h-10 flex items-center justify-center text-ink-primary hover:bg-surface-cream rounded-none transition-colors text-headline-md leading-none font-headline-md cursor-pointer select-none"
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Active Working Days Selector */}
                <div className="bg-surface-container-low p-space-md rounded-none border border-border-hairline">
                  <div className="flex items-center justify-between mb-space-sm">
                    <div>
                      <span className="font-label-lg text-label-lg text-ink-primary">Active Working Days</span>
                      <p className="font-body-md text-body-md text-ink-secondary">
                        Radar completely excludes inactive days from commitment distribution.
                      </p>
                    </div>
                    <span className="font-label-md text-label-md text-ink-muted">
                      {activeDaysCount} Days Committed
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-space-xs pt-space-xs">
                    {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const).map((day) => {
                      const isActive = activeDays[day];
                      return (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`flex flex-col items-center justify-center py-space-sm rounded-none transition-all cursor-pointer border ${
                            isActive
                              ? 'bg-ink-primary text-canvas-paper border-ink-primary'
                              : 'bg-surface text-ink-muted hover:text-ink-primary opacity-70 border-border-hairline'
                          }`}
                          type="button"
                        >
                          <span className="font-label-md text-label-md uppercase">{day}</span>
                          <span className={`material-symbols-outlined text-[16px] mt-1 ${isActive ? '' : 'opacity-0'}`}>
                            check
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Section 2: Protected Sanctuaries & Non-Negotiables */}
            {showSection('boundaries') && (
              <section
                className="bg-surface-container-lowest p-space-lg rounded-none border border-border-hairline"
                id="section-boundaries"
              >
                <div className="flex items-start justify-between mb-space-lg">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-md text-label-md text-ink-muted">02</span>
                      <h2 className="font-headline-lg text-headline-lg text-ink-primary">
                        Protected Sanctuaries &amp; Non-Negotiables
                      </h2>
                    </div>
                    <p className="font-body-md text-body-md text-ink-secondary mt-1">
                      Time blocks permanently walled off from deadline consumption.
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-ink-muted">lock</span>
                </div>

                <div className="flex flex-col gap-space-md">
                  {/* Sleep Window */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md bg-surface-cream rounded-none border border-border-hairline gap-space-sm">
                    <div className="flex items-start gap-space-md">
                      <div className="w-10 h-10 rounded-none bg-surface-container flex items-center justify-center text-ink-primary shrink-0 mt-0.5 border border-border-hairline">
                        <span className="material-symbols-outlined text-[20px]">bedtime</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-space-xs">
                          <h3 className="font-headline-md text-headline-md text-ink-primary">Sleep Window</h3>
                          <span className="px-2 py-0.5 bg-ink-primary text-canvas-paper font-label-md text-[11px] rounded-none uppercase tracking-wider">
                            Locked
                          </span>
                        </div>
                        <p className="font-body-md text-body-md text-ink-secondary">
                          Radar automatically rejects commitments scheduled in this timeframe.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-xs pl-14 sm:pl-0">
                      <div className="bg-surface px-3 py-1.5 rounded-none border border-border-hairline font-label-lg text-label-lg text-ink-primary">
                        23:00
                      </div>
                      <span className="text-ink-muted font-body-md">→</span>
                      <div className="bg-surface px-3 py-1.5 rounded-none border border-border-hairline font-label-lg text-label-lg text-ink-primary">
                        07:00
                      </div>
                    </div>
                  </div>

                  {/* Physical Training */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md bg-surface-container-low rounded-none border border-border-hairline gap-space-sm">
                    <div className="flex items-start gap-space-md">
                      <div className="w-10 h-10 rounded-none bg-surface flex items-center justify-center text-accent-terracotta shrink-0 mt-0.5 border border-border-hairline">
                        <span className="material-symbols-outlined text-[20px]">directions_run</span>
                      </div>
                      <div>
                        <h3 className="font-headline-md text-headline-md text-ink-primary">Physical Training</h3>
                        <p className="font-body-md text-body-md text-ink-secondary">
                          Daily physiological reset. Reserved buffer before evening tasks.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-xs pl-14 sm:pl-0">
                      <div className="bg-surface px-3 py-1.5 rounded-none border border-border-hairline font-label-lg text-label-lg text-ink-primary">
                        17:30
                      </div>
                      <span className="text-ink-muted font-body-md">→</span>
                      <div className="bg-surface px-3 py-1.5 rounded-none border border-border-hairline font-label-lg text-label-lg text-ink-primary">
                        19:00
                      </div>
                    </div>
                  </div>

                  {/* Weekend Zero-Work Policy */}
                  <div className="flex items-center justify-between p-space-md bg-surface-container-low rounded-none border border-border-hairline">
                    <div className="flex items-start gap-space-md">
                      <div className="w-10 h-10 rounded-none bg-surface flex items-center justify-center text-ink-primary shrink-0 mt-0.5 border border-border-hairline">
                        <span className="material-symbols-outlined text-[20px]">weekend</span>
                      </div>
                      <div>
                        <h3 className="font-headline-md text-headline-md text-ink-primary">
                          Weekend Evening Zero-Work Policy
                        </h3>
                        <p className="font-body-md text-body-md text-ink-secondary">
                          Strictly suppresses urgency alerts and deadline warnings on Saturday/Sunday evenings.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setWeekendPolicy(!weekendPolicy)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-none border border-border-hairline transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-1 focus-visible:ring-ink-primary ${
                        weekendPolicy ? 'bg-ink-primary' : 'bg-surface-dim'
                      }`}
                      role="switch"
                      aria-checked={weekendPolicy}
                      type="button"
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-none bg-canvas-paper ring-0 transition duration-200 ease-in-out mt-[3px] ml-0.5 ${
                          weekendPolicy ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Section 3: Estimation Intelligence & Velocity Tuning */}
            {showSection('intelligence') && (
              <section
                className="bg-surface-container-lowest p-space-lg rounded-none border border-border-hairline"
                id="section-intelligence"
              >
                <div className="flex items-start justify-between mb-space-lg">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-md text-label-md text-ink-muted">03</span>
                      <h2 className="font-headline-lg text-headline-lg text-ink-primary">
                        Estimation Intelligence &amp; Velocity
                      </h2>
                    </div>
                    <p className="font-body-md text-body-md text-ink-secondary mt-1">
                      Autonomous models adjusting for optimism bias and cognitive friction.
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-accent-terracotta">auto_awesome</span>
                </div>

                <div className="flex flex-col gap-space-md">
                  {/* Safety Buffer Toggle */}
                  <div className="flex items-center justify-between p-space-md bg-surface-container-low rounded-none border border-border-hairline">
                    <div className="flex items-start gap-space-md max-w-xl">
                      <div className="w-10 h-10 rounded-none bg-surface flex items-center justify-center text-ink-primary shrink-0 mt-0.5 border border-border-hairline">
                        <span className="material-symbols-outlined text-[20px]">shield</span>
                      </div>
                      <div>
                        <h3 className="font-headline-md text-headline-md text-ink-primary">
                          Auto-Apply 15% Programming Safety Buffer
                        </h3>
                        <p className="font-body-md text-body-md text-ink-secondary">
                          Automatically pads technical assignments by 1.15x based on your historical velocity deficit.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSafetyBuffer(!safetyBuffer)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-none border border-border-hairline transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-1 focus-visible:ring-ink-primary ${
                        safetyBuffer ? 'bg-ink-primary' : 'bg-surface-dim'
                      }`}
                      role="switch"
                      aria-checked={safetyBuffer}
                      type="button"
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-none bg-canvas-paper ring-0 transition duration-200 ease-in-out mt-[3px] ml-0.5 ${
                          safetyBuffer ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Parsing Engine Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md bg-surface-container-low rounded-none border border-border-hairline gap-space-sm">
                    <div className="flex items-start gap-space-md">
                      <div className="w-10 h-10 rounded-none bg-surface flex items-center justify-center text-ink-primary shrink-0 mt-0.5 border border-border-hairline">
                        <span className="material-symbols-outlined text-[20px]">terminal</span>
                      </div>
                      <div>
                        <h3 className="font-headline-md text-headline-md text-ink-primary">
                          Natural Language Parsing Engine
                        </h3>
                        <p className="font-body-md text-body-md text-ink-secondary">
                          Interprets natural date syntax, relative deadlines, and effort heuristics.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-xs pl-14 sm:pl-0">
                      <span className="w-1.5 h-1.5 bg-accent-terracotta inline-block shrink-0 animate-pulse motion-reduce:animate-none" />
                      <span className="font-label-lg text-label-lg text-ink-primary">Deterministic v2.4</span>
                      <span className="px-2 py-0.5 bg-surface-cream text-ink-primary font-label-md text-[11px] rounded-none uppercase ml-1 border border-border-hairline">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Section 5: Nudges & Notifications */}
            {showSection('notifications') && (
              <section
                className="bg-surface-container-lowest p-space-lg rounded-none border border-border-hairline"
                id="section-notifications"
              >
                <div className="flex items-start justify-between mb-space-lg">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-md text-label-md text-ink-muted">04</span>
                      <h2 className="font-headline-lg text-headline-lg text-ink-primary">
                        Deadline Nudges &amp; Reminders
                      </h2>
                    </div>
                    <p className="font-body-md text-body-md text-ink-secondary mt-1">
                      Configure early warning alerts before buffer begins compressing.
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-ink-muted">notification_important</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md bg-surface-container-low rounded-none border border-border-hairline gap-space-sm">
                  <div className="flex items-start gap-space-md">
                    <div className="w-10 h-10 rounded-none bg-surface flex items-center justify-center text-ink-primary shrink-0 mt-0.5 border border-border-hairline">
                      <span className="material-symbols-outlined text-[20px]">notifications_active</span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-headline-md text-ink-primary">Proactive Deadline Nudge</h3>
                      <p className="font-body-md text-body-md text-ink-secondary">
                        Triggers alerts prior to critical path encroachment.
                      </p>
                    </div>
                  </div>
                  <div className="pl-14 sm:pl-0">
                    <select
                      value={nudgeOption}
                      onChange={(e) => setNudgeOption(e.target.value)}
                      className="bg-surface text-ink-primary font-label-lg text-label-lg px-3 py-2 rounded-none border border-border-hairline focus:outline-none focus:ring-1 focus:ring-ink-primary cursor-pointer"
                    >
                      <option>Notify 24h before buffer begins compressing</option>
                      <option>Notify 48h before buffer begins compressing</option>
                      <option>Notify immediately upon buffer exhaustion</option>
                      <option>Quiet mode (Weekly digest only)</option>
                    </select>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Account Card */}
          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            {/* Account & Profile Editorial Card */}
            {showSection('account') && (
              <section
                className="bg-surface-container-lowest p-space-lg rounded-none border border-border-hairline flex flex-col"
                id="section-account"
              >
                <div className="flex items-center justify-between mb-space-md">
                  <span className="font-label-md text-label-md text-ink-muted uppercase tracking-wider">
                    Account &amp; Tier
                  </span>
                  <span className="px-2.5 py-0.5 rounded-none bg-surface-cream text-ink-primary font-label-md text-[11px] font-semibold tracking-wide border border-border-hairline">
                    Verified User
                  </span>
                </div>

                {/* Profile Plate */}
                <div className="flex flex-col items-center text-center p-space-md bg-surface-container-low rounded-none border border-border-hairline mb-space-lg">
                  <div className="w-20 h-20 rounded-full bg-ink-primary text-canvas-paper flex items-center justify-center font-headline-xl text-headline-xl mb-space-sm">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <h3 className="font-headline-md text-headline-md text-ink-primary">
                    {user?.full_name || 'Active Workspace User'}
                  </h3>
                  <p className="font-body-md text-body-md text-ink-secondary mt-0.5">
                    {user?.email || 'authenticated@deadlineradar.com'}
                  </p>
                  <div className="mt-space-sm inline-flex items-center gap-space-xs text-ink-muted font-label-md text-label-md">
                    <span className="material-symbols-outlined text-[14px]">event_repeat</span>
                    <span>Timezone: {preferences?.timezone || 'UTC'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-space-xs">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-ink-primary hover:bg-accent-terracotta text-canvas-paper py-space-sm px-space-md font-label-lg text-label-lg transition-colors duration-200 flex items-center justify-center gap-space-xs cursor-pointer rounded-none disabled:opacity-50"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    <span>{isSaving ? 'Saving Changes...' : 'Save Changes'}</span>
                  </button>
                  <button
                    onClick={handleExportCalendar}
                    disabled={isExporting}
                    className="w-full bg-surface-cream hover:bg-surface-tint text-ink-primary py-space-sm px-space-md font-label-lg text-label-lg transition-colors duration-200 flex items-center justify-center gap-space-xs cursor-pointer rounded-none border border-border-hairline mt-space-xs"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px] text-ink-secondary">file_download</span>
                    <span>{isExporting ? 'Generating .ICS Export...' : 'Export My Calendar Data (.ics)'}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-status-alert hover:bg-surface-cream py-space-sm px-space-md font-label-lg text-label-lg transition-colors duration-200 flex items-center justify-center gap-space-xs cursor-pointer rounded-none mt-space-xs border border-transparent hover:border-border-hairline"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Log Out</span>
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
