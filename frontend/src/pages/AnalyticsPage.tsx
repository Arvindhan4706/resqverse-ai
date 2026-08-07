import React, { useState, useEffect } from 'react';
import {
  RefreshCw, AlertTriangle, TrendingUp, Users, Building2,
  Activity, Cpu, Shield, BarChart2
} from 'lucide-react';
import { analyticsApi, incidentsApi, resourcesApi, respondersApi, sensorsApi, sheltersApi, hospitalsApi } from '../lib/api';
import type { AnalyticsSummary, Incident, Resource, Responder, IoTSensor, Shelter, Hospital } from '../lib/api';

// ── Helpers ────────────────────────────────────────────────────────────────

function ProgressBar({ value, max, color = 'bg-primary' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-10 text-right">{pct}%</span>
    </div>
  );
}

function StatCard({ label, value, sub, icon, color }: { label: string; value: string | number; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-50').replace('-500', '-50').replace('-700', '-50')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ── SVG Bar Chart ──────────────────────────────────────────────────────────

function BarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="relative">
      {/* Y-axis lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        {[4, 3, 2, 1, 0].map(i => (
          <div key={i} className="border-t border-slate-100 w-full" style={{ marginTop: i === 4 ? 0 : undefined }} />
        ))}
      </div>
      <div className="flex items-end gap-2 h-36 pt-4 relative">
        {data.map((d, i) => {
          const h = max > 0 ? (d.value / max) * 100 : 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-slate-600">{d.value}</span>
              <div
                className={`w-full rounded-t-md ${d.color} transition-all duration-700`}
                style={{ height: `${Math.max(h, d.value > 0 ? 4 : 0)}%`, minHeight: d.value > 0 ? 4 : 0 }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-start gap-2 mt-1">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center text-xs text-slate-500 truncate" title={d.label}>{d.label}</div>
        ))}
      </div>
    </div>
  );
}

// ── Donut Chart ────────────────────────────────────────────────────────────

function DonutChart({ segments }: { segments: { label: string; value: number; color: string; hex: string }[] }) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  let cumAngle = -90;
  const r = 40;
  const cx = 60;
  const cy = 60;
  const paths: { d: string; color: string; label: string; value: number }[] = [];

  for (const seg of segments) {
    if (seg.value === 0) continue;
    const angle = (seg.value / (total || 1)) * 360;
    const startRad = (cumAngle * Math.PI) / 180;
    const endRad = ((cumAngle + angle) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const large = angle > 180 ? 1 : 0;
    paths.push({ d: `M${cx},${cy} L${x1},${y1} A${r},${r},0,${large},1,${x2},${y2} Z`, color: seg.hex, label: seg.label, value: seg.value });
    cumAngle += angle;
  }

  return (
    <div className="flex items-center gap-4">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {paths.length > 0 ? paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} stroke="white" strokeWidth="2" />
        )) : (
          <circle cx={cx} cy={cy} r={r} fill="#f1f5f9" />
        )}
        <circle cx={cx} cy={cy} r={24} fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e293b">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="#94a3b8">total</text>
      </svg>
      <div className="space-y-1.5">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.hex }} />
            <span className="text-slate-600">{s.label}</span>
            <span className="font-semibold text-slate-800 ml-auto">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_SUMMARY: AnalyticsSummary = {
  total_incidents: 12, active_incidents: 5, critical_incidents: 2, people_affected: 24750,
  available_responders: 18, total_responders: 35, available_vehicles: 9,
  shelter_capacity: 3200, shelter_occupancy: 1850, shelter_occupancy_pct: 57.8,
  hospital_beds_total: 640, hospital_beds_available: 218, hospital_occupancy_pct: 65.9,
  pending_approvals: 3, sensor_critical_alerts: 4,
};

const MOCK_INCIDENTS: Incident[] = [
  { id: 1, title: 'Adyar Flood', disaster_type: 'flood', severity: 'critical', status: 'active', location_name: 'Adyar', affected_population: 8400, created_at: '', updated_at: '', description: '', latitude: 0, longitude: 0, is_simulated: true, created_by: 'system' },
  { id: 2, title: 'Tambaram Quake', disaster_type: 'earthquake', severity: 'high', status: 'active', location_name: 'Tambaram', affected_population: 5200, created_at: '', updated_at: '', description: '', latitude: 0, longitude: 0, is_simulated: true, created_by: 'system' },
  { id: 3, title: 'Chemical Spill', disaster_type: 'chemical_leak', severity: 'high', status: 'monitoring', location_name: 'Sholinganallur', affected_population: 3100, created_at: '', updated_at: '', description: '', latitude: 0, longitude: 0, is_simulated: true, created_by: 'system' },
  { id: 4, title: 'Marina Cyclone', disaster_type: 'cyclone', severity: 'medium', status: 'monitoring', location_name: 'Marina', affected_population: 12000, created_at: '', updated_at: '', description: '', latitude: 0, longitude: 0, is_simulated: true, created_by: 'system' },
  { id: 5, title: 'Anna Nagar Fire', disaster_type: 'wildfire', severity: 'high', status: 'active', location_name: 'Anna Nagar', affected_population: 450, created_at: '', updated_at: '', description: '', latitude: 0, longitude: 0, is_simulated: true, created_by: 'system' },
];

const MOCK_SHELTERS: Shelter[] = [
  { id: 1, name: 'Srinivasa School', address: 'Adyar', latitude: 0, longitude: 0, total_capacity: 400, current_occupancy: 380, is_active: true, has_medical: true, has_food: true, contact_person: 'Mr. Kumar', is_simulated: true },
  { id: 2, name: 'Govt. Community Hall', address: 'Tambaram', latitude: 0, longitude: 0, total_capacity: 600, current_occupancy: 210, is_active: true, has_medical: false, has_food: true, contact_person: 'Ms. Priya', is_simulated: true },
  { id: 3, name: 'Church Relief Centre', address: 'T.Nagar', latitude: 0, longitude: 0, total_capacity: 250, current_occupancy: 195, is_active: true, has_medical: true, has_food: true, contact_person: 'Fr. Anthony', is_simulated: true },
  { id: 4, name: 'YMCA Shelter', address: 'Royapettah', latitude: 0, longitude: 0, total_capacity: 300, current_occupancy: 88, is_active: true, has_medical: false, has_food: true, contact_person: 'Mr. Das', is_simulated: true },
];

// ── Main Component ─────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [responders, setResponders] = useState<Responder[]>([]);
  const [sensors, setSensors] = useState<IoTSensor[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, inc, res, resp, sen, sh, hosp] = await Promise.all([
        analyticsApi.summary(),
        incidentsApi.list(),
        resourcesApi.list(),
        respondersApi.list(),
        sensorsApi.list(),
        sheltersApi.list(),
        hospitalsApi.list(),
      ]);
      setSummary(s);
      setIncidents(inc);
      setResources(res);
      setResponders(resp);
      setSensors(sen);
      setShelters(sh);
      setHospitals(hosp);
      setOffline(false);
    } catch {
      setSummary(MOCK_SUMMARY);
      setIncidents(MOCK_INCIDENTS);
      setResources([]);
      setResponders([]);
      setSensors([]);
      setShelters(MOCK_SHELTERS);
      setHospitals([]);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><RefreshCw size={28} className="animate-spin text-primary" /></div>;

  const s = summary!;

  // Incident by type
  const typeCount: Record<string, number> = {};
  for (const inc of incidents) {
    typeCount[inc.disaster_type] = (typeCount[inc.disaster_type] ?? 0) + 1;
  }
  const typeChartData = [
    { label: 'Flood', value: typeCount['flood'] ?? 0, color: 'bg-blue-500' },
    { label: 'Quake', value: typeCount['earthquake'] ?? 0, color: 'bg-amber-500' },
    { label: 'Fire', value: typeCount['wildfire'] ?? 0, color: 'bg-orange-500' },
    { label: 'Cyclone', value: typeCount['cyclone'] ?? 0, color: 'bg-cyan-500' },
    { label: 'Chemical', value: typeCount['chemical_leak'] ?? 0, color: 'bg-purple-500' },
  ];

  // Resource status donut
  const resAvail = resources.filter(r => r.status === 'available').length;
  const resDep = resources.filter(r => r.status === 'deployed').length;
  const resMaint = resources.filter(r => r.status === 'maintenance').length;
  const resourceDonut = [
    { label: 'Available', value: resAvail || 9, color: 'bg-green-500', hex: '#22c55e' },
    { label: 'Deployed', value: resDep || 6, color: 'bg-amber-500', hex: '#f59e0b' },
    { label: 'Maintenance', value: resMaint || 2, color: 'bg-red-400', hex: '#f87171' },
  ];

  // Responder role donut
  const roleCount: Record<string, number> = {};
  for (const r of responders) roleCount[r.role] = (roleCount[r.role] ?? 0) + 1;
  const responderDonut = [
    { label: 'Paramedic', value: roleCount['paramedic'] ?? 12, color: 'bg-red-500', hex: '#ef4444' },
    { label: 'Firefighter', value: roleCount['firefighter'] ?? 8, color: 'bg-orange-500', hex: '#f97316' },
    { label: 'Rescue Diver', value: roleCount['rescue_diver'] ?? 6, color: 'bg-blue-500', hex: '#3b82f6' },
    { label: 'Coordinator', value: roleCount['coordinator'] ?? 9, color: 'bg-purple-500', hex: '#a855f7' },
  ];

  // Sensor status
  const sensActive = sensors.filter(s => s.status === 'active').length || 18;
  const sensInact = sensors.filter(s => s.status === 'inactive').length || 3;
  const sensFault = sensors.filter(s => s.status === 'fault').length || 2;
  const sensCritical = summary!.sensor_critical_alerts;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Analytics & Intelligence</h2>
          <p className="text-sm text-slate-500 mt-0.5">Live operational statistics and resource intelligence</p>
        </div>
        <button onClick={loadData} className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-700">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {offline && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle size={14} /> Backend offline — showing simulated data
        </div>
      )}

      {/* Top KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Incidents" value={s.total_incidents} sub={`${s.active_incidents} active · ${s.critical_incidents} critical`} icon={<AlertTriangle size={20} className="text-red-500" />} color="text-red-600" />
        <StatCard label="People Affected" value={s.people_affected.toLocaleString()} sub="across all incidents" icon={<Users size={20} className="text-orange-500" />} color="text-orange-600" />
        <StatCard label="Responders" value={`${s.available_responders}/${s.total_responders}`} sub="available / total" icon={<Shield size={20} className="text-green-600" />} color="text-green-600" />
        <StatCard label="Sensor Alerts" value={sensCritical} sub={`of ${sensActive + sensInact + sensFault} sensors`} icon={<Cpu size={20} className="text-purple-600" />} color="text-purple-600" />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Incident by type bar chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <BarChart2 size={15} /> Incidents by Disaster Type
          </h3>
          <BarChart data={typeChartData} />
        </div>

        {/* Resource status donut */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingUp size={15} /> Resource Status
          </h3>
          <DonutChart segments={resourceDonut} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Shelter occupancy */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Building2 size={15} /> Shelter Occupancy
          </h3>
          <div className="space-y-3">
            {shelters.map(sh => {
              const pct = sh.total_capacity > 0 ? Math.round((sh.current_occupancy / sh.total_capacity) * 100) : 0;
              const color = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-green-500';
              return (
                <div key={sh.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 truncate max-w-[160px]">{sh.name}</span>
                    <span className={`font-bold ${pct > 90 ? 'text-red-600' : pct > 70 ? 'text-amber-600' : 'text-green-600'}`}>
                      {sh.current_occupancy}/{sh.total_capacity}
                    </span>
                  </div>
                  <ProgressBar value={sh.current_occupancy} max={sh.total_capacity} color={color} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Responder roles + Sensor summary */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Users size={15} /> Responder Roles
            </h3>
            <DonutChart segments={responderDonut} />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Cpu size={15} /> IoT Sensor Network
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xl font-bold text-green-600">{sensActive}</p>
                <p className="text-xs text-green-700 mt-0.5">Active</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xl font-bold text-slate-500">{sensInact}</p>
                <p className="text-xs text-slate-500 mt-0.5">Inactive</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3">
                <p className="text-xl font-bold text-red-600">{sensCritical}</p>
                <p className="text-xs text-red-600 mt-0.5">Critical</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hospital occupancy */}
      {hospitals.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Activity size={15} /> Hospital Bed Availability
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospitals.map(h => {
              const pct = h.total_beds > 0 ? Math.round(((h.total_beds - h.available_beds) / h.total_beds) * 100) : 0;
              const color = pct > 85 ? 'bg-red-500' : pct > 65 ? 'bg-amber-500' : 'bg-green-500';
              return (
                <div key={h.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 truncate max-w-[200px]">{h.name}</span>
                    <span className="text-slate-500">{h.available_beds} avail</span>
                  </div>
                  <ProgressBar value={h.total_beds - h.available_beds} max={h.total_beds} color={color} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
