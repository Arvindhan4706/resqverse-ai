import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Users, Clock, Cpu, Activity, Building2,
  ShieldCheck, TrendingUp, RefreshCw, ChevronRight, Flame,
  Wind, Waves, Zap, Mountain, FlaskConical
} from 'lucide-react';
import { analyticsApi, incidentsApi, recommendationsApi } from '../lib/api';
import type { AnalyticsSummary, Incident, AgentRecommendation } from '../lib/api';

function DisasterIcon({ type, className }: { type: string; className?: string }) {
  const props = { size: 16, className };
  switch (type) {
    case 'flood': return <Waves {...props} />;
    case 'earthquake': return <Mountain {...props} />;
    case 'wildfire': return <Flame {...props} />;
    case 'cyclone': return <Wind {...props} />;
    case 'chemical_leak': return <FlaskConical {...props} />;
    default: return <AlertTriangle {...props} />;
  }
}

const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-800',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-red-50 border-red-200',
  monitoring: 'bg-amber-50 border-amber-200',
  resolved: 'bg-green-50 border-green-200',
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
  to?: string;
}

function StatCard({ label, value, icon, color, sub, to }: StatCardProps) {
  const inner = (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow ${to ? 'cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100').replace('-700', '-100').replace('-500', '-100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

const MOCK_SUMMARY: AnalyticsSummary = {
  total_incidents: 12, active_incidents: 5, critical_incidents: 2,
  people_affected: 24750, available_responders: 18, total_responders: 35,
  available_vehicles: 9, shelter_capacity: 3200, shelter_occupancy: 1850,
  shelter_occupancy_pct: 57.8, hospital_beds_total: 640, hospital_beds_available: 218,
  hospital_occupancy_pct: 65.9, pending_approvals: 3, sensor_critical_alerts: 4,
};

const MOCK_INCIDENTS: Incident[] = [
  { id: 1, title: 'Adyar River Flood', disaster_type: 'flood', severity: 'critical', status: 'active', location_name: 'Adyar, Chennai', affected_population: 8400, created_at: new Date(Date.now() - 3600000).toISOString(), updated_at: '', description: '', latitude: 13.0, longitude: 80.2, is_simulated: true },
  { id: 2, title: 'Tambaram Seismic Activity', disaster_type: 'earthquake', severity: 'high', status: 'active', location_name: 'Tambaram, Chennai', affected_population: 5200, created_at: new Date(Date.now() - 7200000).toISOString(), updated_at: '', description: '', latitude: 12.9, longitude: 80.1, is_simulated: true },
  { id: 3, title: 'Sholinganallur Chemical Spill', disaster_type: 'chemical_leak', severity: 'high', status: 'monitoring', location_name: 'Sholinganallur', affected_population: 3100, created_at: new Date(Date.now() - 10800000).toISOString(), updated_at: '', description: '', latitude: 12.9, longitude: 80.2, is_simulated: true },
];

export function OverviewPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [approvals, setApprovals] = useState<AgentRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadData = async () => {
    try {
      const [s, i, a] = await Promise.all([
        analyticsApi.summary(),
        incidentsApi.list(),
        recommendationsApi.list({ status: 'pending' }),
      ]);
      setSummary(s);
      setIncidents(i.slice(0, 5));
      setApprovals(a.slice(0, 3));
      setOffline(false);
      setLastRefresh(new Date());
    } catch {
      setSummary(MOCK_SUMMARY);
      setIncidents(MOCK_INCIDENTS);
      setApprovals([]);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  const s = summary!;
  const shelterPct = s.shelter_occupancy_pct;
  const hospPct = s.hospital_occupancy_pct;
  const responderPct = s.total_responders > 0 ? Math.round((s.available_responders / s.total_responders) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Operations Overview</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Chennai Disaster Response Command &mdash; updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {offline && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle size={16} /> Backend offline — showing simulated data
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Incidents"
          value={s.active_incidents}
          icon={<AlertTriangle size={20} className="text-red-600" />}
          color="text-red-600"
          sub={`${s.total_incidents} total · ${s.critical_incidents} critical`}
          to="/incidents"
        />
        <StatCard
          label="People Affected"
          value={s.people_affected.toLocaleString()}
          icon={<Users size={20} className="text-orange-600" />}
          color="text-orange-600"
          sub="across all active incidents"
        />
        <StatCard
          label="Pending Approvals"
          value={s.pending_approvals}
          icon={<Clock size={20} className="text-amber-600" />}
          color="text-amber-600"
          sub="AI recommendations awaiting review"
          to="/approvals"
        />
        <StatCard
          label="Sensor Alerts"
          value={s.sensor_critical_alerts}
          icon={<Cpu size={20} className="text-purple-600" />}
          color="text-purple-600"
          sub="critical threshold exceeded"
          to="/map"
        />
      </div>

      {/* Resource Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Shelter Capacity */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={18} className="text-blue-600" />
            <span className="font-semibold text-slate-700 text-sm">Shelter Capacity</span>
            <span className={`ml-auto text-sm font-bold ${shelterPct > 85 ? 'text-red-600' : shelterPct > 65 ? 'text-amber-600' : 'text-green-600'}`}>
              {shelterPct}%
            </span>
          </div>
          <ProgressBar
            value={s.shelter_occupancy}
            max={s.shelter_capacity}
            color={shelterPct > 85 ? 'bg-red-500' : shelterPct > 65 ? 'bg-amber-500' : 'bg-green-500'}
          />
          <p className="text-xs text-slate-400 mt-2">{s.shelter_occupancy.toLocaleString()} / {s.shelter_capacity.toLocaleString()} occupants</p>
        </div>

        {/* Hospital Beds */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={18} className="text-red-500" />
            <span className="font-semibold text-slate-700 text-sm">Hospital Occupancy</span>
            <span className={`ml-auto text-sm font-bold ${hospPct > 85 ? 'text-red-600' : hospPct > 65 ? 'text-amber-600' : 'text-green-600'}`}>
              {hospPct}%
            </span>
          </div>
          <ProgressBar
            value={s.hospital_beds_total - s.hospital_beds_available}
            max={s.hospital_beds_total}
            color={hospPct > 85 ? 'bg-red-500' : hospPct > 65 ? 'bg-amber-500' : 'bg-green-500'}
          />
          <p className="text-xs text-slate-400 mt-2">{s.hospital_beds_available.toLocaleString()} beds available of {s.hospital_beds_total.toLocaleString()}</p>
        </div>

        {/* Responders */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={18} className="text-green-600" />
            <span className="font-semibold text-slate-700 text-sm">Responder Availability</span>
            <span className={`ml-auto text-sm font-bold ${responderPct < 30 ? 'text-red-600' : responderPct < 50 ? 'text-amber-600' : 'text-green-600'}`}>
              {responderPct}%
            </span>
          </div>
          <ProgressBar
            value={s.available_responders}
            max={s.total_responders}
            color={responderPct < 30 ? 'bg-red-500' : responderPct < 50 ? 'bg-amber-500' : 'bg-green-500'}
          />
          <p className="text-xs text-slate-400 mt-2">{s.available_responders} available · {s.available_vehicles} vehicles ready</p>
        </div>
      </div>

      {/* Bottom grid: Recent Incidents + Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Incidents */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-slate-500" />
              <h3 className="font-semibold text-slate-800 text-sm">Recent Incidents</h3>
            </div>
            <Link to="/incidents" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {incidents.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-400 text-center">No incidents found</p>
            ) : (
              incidents.map(inc => (
                <div key={inc.id} className={`px-4 py-3 flex items-start gap-3 border-l-4 ${STATUS_COLORS[inc.status] || ''}`}>
                  <div className="mt-0.5 text-slate-400">
                    <DisasterIcon type={inc.disaster_type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-slate-800 truncate">{inc.title}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${SEVERITY_COLORS[inc.severity]}`}>
                        {inc.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {inc.location_name} · {inc.affected_population.toLocaleString()} affected
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {new Date(inc.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending AI Approvals */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              <h3 className="font-semibold text-slate-800 text-sm">Pending AI Approvals</h3>
              {s.pending_approvals > 0 && (
                <span className="bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {s.pending_approvals}
                </span>
              )}
            </div>
            <Link to="/approvals" className="text-xs text-primary hover:underline flex items-center gap-1">
              Review all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {approvals.length === 0 ? (
              <div className="px-4 py-8 text-center">
                {s.pending_approvals > 0 ? (
                  <Link to="/approvals" className="text-sm text-primary hover:underline">
                    {s.pending_approvals} recommendations need review →
                  </Link>
                ) : (
                  <p className="text-sm text-slate-400">No pending approvals — all clear ✓</p>
                )}
              </div>
            ) : (
              approvals.map(rec => (
                <div key={rec.id} className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">{rec.agent_name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${rec.risk_level === 'high' ? 'bg-red-100 text-red-700' : rec.risk_level === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {rec.risk_level} risk
                    </span>
                    <span className="ml-auto text-xs text-slate-400">{Math.round(rec.confidence * 100)}% confidence</span>
                  </div>
                  <p className="text-sm text-slate-700 line-clamp-2">{rec.recommendation}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
