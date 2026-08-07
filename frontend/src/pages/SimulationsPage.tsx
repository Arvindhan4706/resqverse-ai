import React, { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, Square, Zap, Waves, Mountain,
  Flame, Wind, FlaskConical, Settings, Terminal, Clock,
  ChevronRight, BarChart2
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

type DisasterType = 'flood' | 'earthquake' | 'wildfire' | 'cyclone' | 'chemical_leak';
type SimStatus = 'idle' | 'running' | 'paused' | 'completed';

interface Scenario {
  id: string;
  name: string;
  type: DisasterType;
  description: string;
  location: string;
  estimatedDuration: string;
  defaultSeverity: number;
  icon: React.ReactNode;
  color: string;
  logMessages: string[];
}

// ── Scenario Data ──────────────────────────────────────────────────────────

const SCENARIOS: Scenario[] = [
  {
    id: 'flood-chennai',
    name: 'Chennai Flood — Cyclone Surge',
    type: 'flood',
    description: 'Simulate a catastrophic flood event triggered by a Bay of Bengal cyclone. Water levels breach Adyar and Cooum rivers, inundating low-lying zones.',
    location: 'Adyar & Cooum River Basins',
    estimatedDuration: '~8 min',
    defaultSeverity: 8,
    icon: <Waves size={22} />,
    color: 'blue',
    logMessages: [
      '[INIT] Flood simulation initializing — Chennai Metropolitan Region',
      '[SENSOR] Water level sensors activated at Adyar bridge, Saidapet, Adambakkam',
      '[SENSOR] Water level: 3.4m and rising at Adyar checkpost (warning threshold: 3.0m)',
      '[ALERT] ⚠ Flood warning issued for zones: T.Nagar, Adyar, Velachery',
      '[AGENT:EvacuationAgent] Analyzing population density in Zone 2-B...',
      '[AGENT:EvacuationAgent] Recommends: Deploy 4 NDRF teams to T.Nagar immediately',
      '[AGENT:ResourceAgent] Pre-positioning 3 rescue boats at Saidapet depot',
      '[SENSOR] Water level: 4.1m — CRITICAL threshold breached',
      '[ALERT] 🚨 CRITICAL: Immediate evacuation order for low-lying areas',
      '[AGENT:RouteAgent] Analyzing road closures... NH-32 bridge load: 91kN',
      '[AGENT:RouteAgent] RECOMMENDATION: Close Adyar bridge. Reroute via Velachery bypass',
      '[RESPONDER] NDRF Team Alpha deployed to T.Nagar (ETA: 12 min)',
      '[RESPONDER] NDRF Team Bravo deployed to Adyar Zone 2 (ETA: 18 min)',
      '[SHELTER] Srinivasa School shelter activated — capacity: 400 persons',
      '[DRONE] DRN-001 airborne — flood zone surveillance initiated',
      '[SENSOR] Water level: 4.8m — peak projected at 5.2m within 2h',
      '[AGENT:MedicalAgent] Requesting forward medical post at Velachery junction',
      '[SYSTEM] Simulation running — 2,450 evacuees processed',
      '[SYSTEM] Simulation complete — peak water level reached. Recovery phase initiated.',
    ],
  },
  {
    id: 'earthquake-tambaram',
    name: 'Tambaram Earthquake — M5.8',
    type: 'earthquake',
    description: 'A magnitude 5.8 seismic event beneath Tambaram causes structural damage. Urban search & rescue, triage, and aftershock management are tested.',
    location: 'Tambaram Taluk, Chennai South',
    estimatedDuration: '~6 min',
    defaultSeverity: 7,
    icon: <Mountain size={22} />,
    color: 'amber',
    logMessages: [
      '[INIT] Seismic event simulation — Tambaram epicenter (12.93°N, 80.13°E)',
      '[SEISMIC] P-wave detected — Magnitude 5.8 at depth 12km',
      '[ALERT] ⚠ Earthquake alert issued for Chennai South districts',
      '[SENSOR] Structural sensors: 3 buildings in Selaiyur reporting damage',
      '[AGENT:StructuralAgent] Analyzing building collapse risk...',
      '[AGENT:StructuralAgent] HIGH RISK: Vintage apartments (1980s construction) in West Tambaram',
      '[RESPONDER] USAR Team deployed — Urban Search and Rescue activated',
      '[DRONE] DRN-002 airborne — thermal imaging for trapped survivors',
      '[MEDICAL] Casualty estimate: 25-40 injured, 3-5 critical',
      '[AGENT:MedicalAgent] Forward triage post established at Tambaram bus stand',
      '[SHELTER] Government school activated as emergency shelter',
      '[SEISMIC] Aftershock M3.2 detected — ongoing monitoring',
      '[SYSTEM] Rescue operations in progress — 6 survivors located',
      '[SYSTEM] Simulation complete.',
    ],
  },
  {
    id: 'wildfire-vandalur',
    name: 'Vandalur Forest Fire',
    type: 'wildfire',
    description: 'Dry conditions and high winds ignite a forest fire near Vandalur zoo, threatening urban fringe residential areas and wildlife.',
    location: 'Vandalur Forest Reserve',
    estimatedDuration: '~5 min',
    defaultSeverity: 6,
    icon: <Flame size={22} />,
    color: 'orange',
    logMessages: [
      '[INIT] Wildfire simulation — Vandalur Forest Reserve, Chennai',
      '[SENSOR] Smoke detected by air quality sensor AQ-07',
      '[ALERT] ⚠ Fire alert issued — Vandalur zone',
      '[DRONE] DRN-003 airborne — fire perimeter mapping',
      '[DRONE] Fire perimeter: ~2.3 sq km, spreading northeast at 3km/h',
      '[AGENT:EvacuationAgent] Zoo visitor evacuation protocol initiated',
      '[RESOURCE] Fire engine F-1 and F-2 dispatched',
      '[AGENT:ResourceAgent] Requesting aerial water tanker support',
      '[SENSOR] Wind speed: 45km/h NE — fire risk elevated',
      '[ALERT] 🚨 Evacuation order for Perungalathur residential zone',
      '[SYSTEM] Firebreak established on south perimeter',
      '[SYSTEM] Simulation complete — containment achieved.',
    ],
  },
  {
    id: 'cyclone-bay',
    name: 'Bay of Bengal Cyclone Landfall',
    type: 'cyclone',
    description: 'Category 3 cyclone "Neela" makes landfall at Chennai coast with 150 km/h sustained winds. Tests city-wide pre-positioning and mass evacuation.',
    location: 'Chennai Coastline — Marina to Besant Nagar',
    estimatedDuration: '~10 min',
    defaultSeverity: 9,
    icon: <Wind size={22} />,
    color: 'cyan',
    logMessages: [
      '[INIT] Cyclone Neela simulation — landfall T-12h warning',
      '[WEATHER] IMD alert: Cat-3 cyclone, 150km/h, landfall 36h',
      '[ALERT] ⚠ Cyclone warning: Red alert for coastal Chennai',
      '[AGENT:EvacuationAgent] Mass coastal evacuation planning initiated',
      '[SYSTEM] Pre-positioning resources in inland depots',
      '[SHELTER] 22 cyclone shelters activated — capacity: 45,000 persons',
      '[RESPONDER] NDRF pre-positioned: 8 teams, 4 boats, 2 helicopter standby',
      '[DRONE] All drones grounded — wind speed too high for flight',
      '[ALERT] 🚨 CRITICAL: Landfall imminent. Storm surge 2.5m expected',
      '[SENSOR] Wind speed at Marina: 148km/h and rising',
      '[SYSTEM] Simulation at peak intensity...',
      '[SYSTEM] Cyclone passed. Damage assessment phase initiated.',
    ],
  },
  {
    id: 'chemical-sholinganallur',
    name: 'Sholinganallur Chemical Spill',
    type: 'chemical_leak',
    description: 'An industrial chemical tank rupture releases toxic fumes. Hazmat response, shelter-in-place, and decontamination protocols are tested.',
    location: 'SIPCOT Industrial Area, Sholinganallur',
    estimatedDuration: '~4 min',
    defaultSeverity: 7,
    icon: <FlaskConical size={22} />,
    color: 'purple',
    logMessages: [
      '[INIT] Chemical spill simulation — SIPCOT, Sholinganallur',
      '[SENSOR] Air quality sensors AQ-12 and AQ-13: SO₂ spike detected',
      '[ALERT] ⚠ Chemical hazard: Shelter-in-place advisory within 1km',
      '[AGENT:HazmatAgent] Identifying substance: Sulphur dioxide (SO₂)',
      '[AGENT:HazmatAgent] Wind trajectory: Plume moving NNE toward IT corridor',
      '[RESPONDER] Hazmat Team Alpha deployed — full protective gear',
      '[MEDICAL] Casualty triage: 12 affected, 3 requiring decontamination',
      '[DRONE] DRN-001 with gas sensor array — plume tracking airborne',
      '[SYSTEM] Exclusion zone established: 500m radius',
      '[SYSTEM] Decontamination complete. All clear issued.',
    ],
  },
];

// ── Icons & Colors ─────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-500' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', badge: 'bg-cyan-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-600' },
};

// ── Main Component ─────────────────────────────────────────────────────────

export function SimulationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [severity, setSeverity] = useState(7);
  const [status, setStatus] = useState<SimStatus>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logIndexRef = useRef(0);

  const selected = SCENARIOS.find(s => s.id === selectedId);
  const colors = selected ? COLOR_MAP[selected.color] : null;

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  // Elapsed timer
  useEffect(() => {
    if (status === 'running') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  // Log streamer
  useEffect(() => {
    if (status === 'running' && selected) {
      logTimerRef.current = setInterval(() => {
        const next = logIndexRef.current + 1;
        if (next >= selected.logMessages.length) {
          clearInterval(logTimerRef.current!);
          setStatus('completed');
          return;
        }
        logIndexRef.current = next;
        setLogs(l => [...l, selected.logMessages[next]]);
      }, 800);
    } else {
      if (logTimerRef.current) clearInterval(logTimerRef.current);
    }
    return () => { if (logTimerRef.current) clearInterval(logTimerRef.current); };
  }, [status, selected]);

  const handleLaunch = () => {
    if (!selected) return;
    setLogs([selected.logMessages[0]]);
    logIndexRef.current = 0;
    setElapsed(0);
    setStatus('running');
  };

  const handlePause = () => setStatus(s => s === 'running' ? 'paused' : 'running');
  const handleStop = () => {
    setStatus('idle');
    setLogs([]);
    logIndexRef.current = 0;
    setElapsed(0);
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const getLogLineColor = (line: string) => {
    if (line.includes('🚨') || line.includes('CRITICAL')) return 'text-red-400';
    if (line.includes('⚠') || line.includes('ALERT')) return 'text-amber-400';
    if (line.includes('[AGENT')) return 'text-purple-400';
    if (line.includes('[DRONE') || line.includes('[SENSOR')) return 'text-cyan-400';
    if (line.includes('[RESPONDER') || line.includes('[MEDICAL')) return 'text-green-400';
    if (line.includes('[SYSTEM]') && line.includes('complete')) return 'text-green-300 font-semibold';
    return 'text-slate-300';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Simulation Center</h2>
        <p className="text-sm text-slate-500 mt-0.5">Run disaster scenarios to test AI agent response and coordination protocols</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ minHeight: 500 }}>
        {/* Scenario Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Settings size={15} /> Choose a Scenario
          </h3>
          {SCENARIOS.map(scenario => {
            const c = COLOR_MAP[scenario.color];
            const isSelected = selectedId === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => { if (status === 'idle') { setSelectedId(scenario.id); setSeverity(scenario.defaultSeverity); } }}
                disabled={status !== 'idle'}
                className={`w-full text-left rounded-xl border-2 p-4 transition-all ${isSelected ? `${c.border} ${c.bg}` : 'border-slate-200 bg-white hover:border-slate-300'} ${status !== 'idle' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isSelected ? `${c.badge} text-white` : 'bg-slate-100 text-slate-500'}`}>
                    {scenario.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-sm ${isSelected ? c.text : 'text-slate-800'}`}>{scenario.name}</span>
                      {isSelected && <span className="text-xs bg-white/70 px-1.5 py-0.5 rounded border border-current">Selected</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{scenario.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span>📍 {scenario.location}</span>
                      <span>⏱ {scenario.estimatedDuration}</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 flex-shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Control Panel + Log */}
        <div className="flex flex-col gap-4">
          {/* Controls */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <BarChart2 size={15} /> Simulation Controls
            </h3>

            {selected ? (
              <div className="space-y-4">
                {/* Selected scenario preview */}
                <div className={`rounded-lg p-3 ${colors!.bg} border ${colors!.border}`}>
                  <div className="flex items-center gap-2">
                    <span className={`${colors!.text}`}>{selected.icon}</span>
                    <span className={`font-semibold text-sm ${colors!.text}`}>{selected.name}</span>
                  </div>
                </div>

                {/* Severity slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-600">Severity Level</label>
                    <span className={`text-sm font-bold ${severity >= 8 ? 'text-red-600' : severity >= 6 ? 'text-amber-600' : 'text-green-600'}`}>
                      {severity}/10 — {severity >= 8 ? 'Extreme' : severity >= 6 ? 'High' : severity >= 4 ? 'Moderate' : 'Low'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={severity}
                    onChange={e => setSeverity(Number(e.target.value))}
                    disabled={status !== 'idle'}
                    className="w-full accent-primary"
                  />
                </div>

                {/* Status + timer */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${status === 'running' ? 'bg-green-500 animate-pulse' : status === 'paused' ? 'bg-amber-500' : status === 'completed' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                    <span className="text-sm font-medium text-slate-700 capitalize">{status}</span>
                  </div>
                  {status !== 'idle' && (
                    <span className="font-mono text-sm text-slate-500 flex items-center gap-1">
                      <Clock size={13} /> {formatTime(elapsed)}
                    </span>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2">
                  {status === 'idle' || status === 'completed' ? (
                    <button
                      onClick={handleLaunch}
                      id="sim-launch-btn"
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-lg transition-colors"
                    >
                      <Play size={16} /> {status === 'completed' ? 'Run Again' : 'Launch Simulation'}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handlePause}
                        id="sim-pause-btn"
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-lg transition-colors"
                      >
                        {status === 'paused' ? <><Play size={16} /> Resume</> : <><Pause size={16} /> Pause</>}
                      </button>
                      <button
                        onClick={handleStop}
                        id="sim-stop-btn"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-red-200 hover:text-red-600 text-slate-600 font-semibold text-sm rounded-lg transition-colors"
                      >
                        <Square size={16} /> Stop
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Zap size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Select a scenario to begin</p>
              </div>
            )}
          </div>

          {/* Simulation Log */}
          <div className="flex-1 bg-slate-900 rounded-xl border border-slate-700 shadow-sm overflow-hidden flex flex-col" style={{ minHeight: 240 }}>
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-700 bg-slate-800">
              <Terminal size={14} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Simulation Log</span>
              {status === 'running' && (
                <span className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
            <div ref={logRef} className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1" style={{ maxHeight: 280 }}>
              {logs.length === 0 ? (
                <p className="text-slate-600 italic">// Waiting for simulation to start…</p>
              ) : (
                logs.map((line, i) => (
                  <p key={i} className={getLogLineColor(line)}>
                    <span className="text-slate-600 mr-2">{String(i + 1).padStart(2, '0')}</span>
                    {line}
                  </p>
                ))
              )}
              {status === 'running' && (
                <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-1" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
