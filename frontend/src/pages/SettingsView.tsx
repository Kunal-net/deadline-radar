import React, { useState } from 'react';

type SettingsTab = 'capacity' | 'boundaries' | 'intelligence' | 'account' | 'notifications';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('capacity');
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleSave = () => {
    showToast('Settings saved successfully. Capacity baseline recalibrated.');
  };

  const toggleDay = (day: string) => {
    setActiveDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const activeDaysCount = Object.values(activeDays).filter(Boolean).length;

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
              className="bg-ink-primary hover:bg-accent-terracotta text-canvas-paper px-space-lg py-space-sm font-label-lg text-label-lg transition-colors duration-200 flex items-center gap-space-xs cursor-pointer rounded-none"
            >
              <span className="material-symbols-outlined text-[18px]">check</span>
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="w-full flex items-center gap-space-xs overflow-x-auto pb-space-xs mb-space-xl scrollbar-none bg-surface-container-low p-1.5 rounded-none border border-border-hairline">
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
            <span className="material-symbols-outlined text-[16px]">badge</span>
            <span>Account &amp; Profile</span>
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
            <span>Preferences</span>
          </button>
        </div>

          {/* Main Two-Column Asymmetric Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
            {/* Left Column: Core Functional Sections */}
            <div className="lg:col-span-8 flex flex-col gap-space-xl">
              {/* Section 1: Work Capacity & Diurnal Rhythm */}
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

              {/* Section 2: Protected Sanctuaries & Non-Negotiables */}
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

              {/* Section 3: Estimation Intelligence & Velocity Tuning */}
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

                  {/* Proactive Nudge Dropdown */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md bg-surface-container-low rounded-none border border-border-hairline gap-space-sm">
                    <div className="flex items-start gap-space-md">
                      <div className="w-10 h-10 rounded-none bg-surface flex items-center justify-center text-ink-primary shrink-0 mt-0.5 border border-border-hairline">
                        <span className="material-symbols-outlined text-[20px]">notification_important</span>
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
                </div>
              </section>
            </div>

            {/* Right Column: Profile & Telemetry Insights */}
            <div className="lg:col-span-4 flex flex-col gap-space-lg">
              {/* Account & Profile Editorial Card */}
              <section
                className="bg-surface-container-lowest p-space-lg rounded-none border border-border-hairline flex flex-col"
                id="section-account"
              >
                <div className="flex items-center justify-between mb-space-md">
                  <span className="font-label-md text-label-md text-ink-muted uppercase tracking-wider">
                    Account &amp; Tier
                  </span>
                  <span className="px-2.5 py-0.5 rounded-none bg-surface-cream text-ink-primary font-label-md text-[11px] font-semibold tracking-wide border border-border-hairline">
                    Personal Pro
                  </span>
                </div>

                {/* Profile Plate */}
                <div className="flex flex-col items-center text-center p-space-md bg-surface-container-low rounded-none border border-border-hairline mb-space-lg">
                  <div className="relative mb-space-sm">
                    <img
                      alt="Elena Vance profile photograph"
                      className="w-24 h-24 rounded-none object-cover border border-border-hairline"
                      src="/assets/user-avatar.jpg"
                    />
                    <span className="absolute bottom-0 right-0 w-4 h-4 rounded-none bg-accent-terracotta border border-surface flex items-center justify-center text-[10px] text-canvas-paper">
                      ✓
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-ink-primary">Elena Vance</h3>
                  <p className="font-body-md text-body-md text-ink-secondary mt-0.5">elena@deadlineradar.com</p>
                  <div className="mt-space-sm inline-flex items-center gap-space-xs text-ink-muted font-label-md text-label-md">
                    <span className="material-symbols-outlined text-[14px]">event_repeat</span>
                    <span>Renewal: Nov 28, 2025</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-space-xs">
                  <button
                    onClick={handleSave}
                    className="w-full bg-ink-primary hover:bg-accent-terracotta text-canvas-paper py-space-sm px-space-md font-label-lg text-label-lg transition-colors duration-200 flex items-center justify-center gap-space-xs cursor-pointer rounded-none"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={() => showToast('Calendar data export initiated (ICS format).')}
                    className="w-full bg-surface-cream hover:bg-surface-tint text-ink-primary py-space-sm px-space-md font-label-lg text-label-lg transition-colors duration-200 flex items-center justify-center gap-space-xs cursor-pointer rounded-none border border-border-hairline mt-space-xs"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px] text-ink-secondary">file_download</span>
                    <span>Export My Calendar Data</span>
                  </button>
                  <button
                    onClick={() => showToast('Session termination simulation.')}
                    className="w-full text-status-alert hover:bg-surface-cream py-space-sm px-space-md font-label-lg text-label-lg transition-colors duration-200 flex items-center justify-center gap-space-xs cursor-pointer rounded-none mt-space-xs"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Log Out</span>
                  </button>
                </div>
              </section>

              {/* Diurnal Capacity Balance Mini-Viz */}
              <div className="bg-surface-cream p-space-lg rounded-none border border-border-hairline flex flex-col">
                <div className="flex items-center justify-between mb-space-sm">
                  <span className="font-label-md text-label-md text-ink-primary uppercase tracking-wider font-semibold">
                    Weekly Equilibrium
                  </span>
                  <span className="material-symbols-outlined text-ink-secondary text-[18px]">donut_large</span>
                </div>
                <p className="font-body-md text-body-md text-ink-secondary mb-space-md">
                  Based on {weeklyHours.toFixed(1)}h weekly baseline and protected sanctuaries, your distribution factor is balanced at 82% efficiency.
                </p>

                {/* Inline SVG Allocation Graphic */}
                <div className="relative w-full h-36 flex items-center justify-center mb-space-sm">
                  <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="text-surface-dim"
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="12"
                    />
                    {/* Sleep Sanctuary: 56 hours (33%) */}
                    <circle
                      className="text-ink-secondary"
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="40"
                      stroke="currentColor"
                      strokeDasharray="251.2"
                      strokeDashoffset="168"
                      strokeWidth="12"
                    />
                    {/* Focus Capacity: 18.5 hours */}
                    <circle
                      className="text-accent-terracotta"
                      cx="50"
                      cy="50"
                      fill="transparent"
                      r="40"
                      stroke="currentColor"
                      strokeDasharray="251.2"
                      strokeDashoffset="223"
                      strokeLinecap="round"
                      strokeWidth="12"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-headline-md text-headline-md text-ink-primary leading-tight">
                      {weeklyHours.toFixed(1)}h
                    </span>
                    <span className="font-label-md text-[10px] uppercase text-ink-muted">Focus</span>
                  </div>
                </div>

                {/* Metric Breakdown List */}
                <div className="flex flex-col gap-2 pt-space-xs border-t border-border-hairline">
                  <div className="flex items-center justify-between text-body-md font-body-md">
                    <span className="flex items-center gap-2 text-ink-secondary">
                      <span className="w-2 h-2 rounded-none inline-block shrink-0 bg-accent-terracotta" />
                      Deep Focus
                    </span>
                    <span className="font-semibold text-ink-primary">{weeklyHours.toFixed(1)} hrs</span>
                  </div>
                  <div className="flex items-center justify-between text-body-md font-body-md">
                    <span className="flex items-center gap-2 text-ink-secondary">
                      <span className="w-2 h-2 rounded-none inline-block shrink-0 bg-ink-secondary" />
                      Sanctuary (Sleep/Life)
                    </span>
                    <span className="font-semibold text-ink-primary">66.5 hrs</span>
                  </div>
                  <div className="flex items-center justify-between text-body-md font-body-md">
                    <span className="flex items-center gap-2 text-ink-secondary">
                      <span className="w-2 h-2 rounded-none inline-block shrink-0 bg-surface-dim" />
                      Open Buffer
                    </span>
                    <span className="font-semibold text-ink-primary">
                      {Math.max(0, 168 - weeklyHours - 66.5).toFixed(1)} hrs
                    </span>
                  </div>
                </div>
              </div>

              {/* Calm Editorial Principle Quote */}
              <div className="p-space-md rounded-none bg-surface-cream border-l-2 border-accent-terracotta">
                <span className="material-symbols-outlined text-ink-muted text-[24px] mb-space-xs block">
                  format_quote
                </span>
                <p className="font-body-md text-body-md italic text-ink-secondary">
                  “Time is not something you fabricate through faster typing. It is the boundary within which your mind is granted peace to craft value.”
                </p>
                <span className="font-label-md text-label-md text-ink-muted block mt-space-xs">
                  — Deadline Radar Operating Charter
                </span>
              </div>
            </div>
          </div>
        </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 bg-ink-primary text-canvas-paper px-space-md py-space-sm rounded-none border border-border-hairline flex items-center gap-space-sm z-50 transition-all duration-300">
          <span className="material-symbols-outlined text-[18px] text-accent-terracotta">task_alt</span>
          <span className="font-label-lg text-label-lg">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
