import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle, Search, Filter, X, ChevronRight, RefreshCw,
  MapPin, Users, Clock, Flame, Wind, Waves, Mountain, FlaskConical,
  Zap
} from 'lucide-react';
import { incidentsApi, recommendationsApi } from '../lib/api';
import type { Incident, AgentRecommendation } from '../lib/api';

// ── helpers ────────────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<string, string> = {
  low: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-red-100 text-red-700',
  monitoring: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
};

const SEVERITY_BORDER: Record<string, string> = {
  low: 'border-l-green-400',
  medium: 'border-l-amber-400',
  high: 'border-l-orange-500',
  critical: 'border-l-red-600',
};

function DisasterIcon({ type }: { type: string }) {
  const cls = 'w-4 h-4';
  switch (type) {
    case 'flood': return <Waves className={cls} />;
    case 'earthquake': return <Mountain className={cls} />;
    case 'wildfire': return <Flame className={cls} />;
    case 'cyclone': return <Wind className={cls} />;
    case 'chemical_leak': return <FlaskConical className={cls} />;
    default: return <AlertTriangle className={cls} />;
  }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'just now';
}

// ── mock data ──────────────────────────────────────────────────────────────

const MOCK_INCIDENTS: Incident[] = [
  { id: 1, title: 'Adyar River Flood', disaster_type: 'flood', severity: 'critical', status: 'active', location_name: 'Adyar, Chennai', affected_population: 8400, created_at: new Date(Date.now() - 3_600_000).toISOString(), updated_at: '', description: 'Severe flooding in low-lying areas due to heavy rainfall and dam releases.', latitude: 13.0, longitude: 80.2, is_simulated: true },
  { id: 2, title: 'Tambaram Seismic Activity', disaster_type: 'earthquake', severity: 'high', status: 'active', location_name: 'Tambaram, Chennai', affected_population: 5200, created_at: new Date(Date.now() - 7_200_000).toISOString(), updated_at: '', description: 'Magnitude 5.2 earthquake causing structural damage to residential buildings.', latitude: 12.9, longitude: 80.1, is_simulated: true },
  { id: 3, title: 'Sholinganallur Chemical Spill', disaster_type: 'chemical_leak', severity: 'high', status: 'monitoring', location_name: 'Sholinganallur', affected_population: 3100, created_at: new Date(Date.now() - 10_800_000).toISOString(), updated_at: '', description: 'Industrial chemical spill affecting air quality in the surrounding 2km radius.', latitude: 12.9, longitude: 80.2, is_simulated: true },
  { id: 4, title: 'Marina Beach Cyclone Alert', disaster_type: 'cyclone', severity: 'medium', status: 'monitoring', location_name: 'Marina Beach', affected_population: 12000, created_at: new Date(Date.now() - 18_000_000).toISOString(), updated_at: '', description: 'Cyclone depression forming in Bay of Bengal, expected landfall in 36 hours.', latitude: 13.05, longitude: 80.28, is_simulated: true },
  { id: 5, title: 'Anna Nagar Building Fire', disaster_type: 'wildfire', severity: 'high', status: 'active', location_name: 'Anna Nagar, Chennai', affected_population: 450, created_at: new Date(Date.now() - 900_000).toISOString(), updated_at: '', description: 'Multi-story commercial building fire with smoke spread to adjacent blocks.', latitude: 13.08, longitude: 80.21, is_simulated: true },
  { id: 6, title: 'Poonamallee Road Flooding', disaster_type: 'flood', severity: 'medium', status: 'resolved', location_name: 'Poonamallee', affected_population: 2100, created_at: new Date(Date.now() - 86_400_000).toISOString(), updated_at: '', description: 'Waterlogging on arterial road cleared by NDRF. Road restored to service.', latitude: 13.04, longitude: 80.12, is_simulated: true },
];

const MOCK_RECS: AgentRecommendation[] = [
  { id: 1, agent_name: 'EvacuationAgent', incident_id: 1, recommendation: 'Deploy 3 additional NDRF teams to Adyar zone 2 for immediate evacuation.', reasoning: 'Water levels at 4.2m exceed safe threshold by 0.8m. 2,400 residents in low-lying areas.', confidence: 0.91, risk_level: 'high', data_used: {}, requires_human_approval: true, status: 'pending', approved_by: null, approved_at: null, created_at: new Date().toISOString() },
  { id: 2, agent_name: 'ResourceAgent', incident_id: 1, recommendation: 'Pre-position 500 water purification tablets and 200 food packets at Adyar Community Center.', reasoning: 'Shelter occupancy expected to rise 40% in 6 hours based on water rise projection.', confidence: 0.87, risk_level: 'medium', data_used: {}, requires_human_approval: true, status: 'pending', approved_by: null, approved_at: null, created_at: new Date().toISOString() },
];

// ── IncidentDetailPanel ────────────────────────────────────────────────────

function IncidentDetailPanel({
  incident,
  onClose,
}: {
  incident: Incident;
  onClose: () => void;
}) {
  const [recs, setRecs] = useState<AgentRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    recommendationsApi.list({ incident_id: String(incident.id) })
      .then(setRecs)
      .catch(() => setRecs(MOCK_RECS.filter(r => r.incident_id === incident.id)))
      .finally(() => setLoadingRecs(false));
  }, [incident.id]);

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 w-96 flex-shrink-0 overflow-hidden">
      {/* Header */}
      <div className={`px-4 py-3 border-b border-slate-100 flex items-start justify-between border-l-4 ${SEVERITY_BORDER[incident.severity]}`}>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${SEVERITY_STYLES[incident.severity]}`}>
              {incident.severity.toUpperCase()}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[incident.status]}`}>
              {incident.status}
            </span>
          </div>
          <h3 className="font-bold text-slate-900 mt-1.5 leading-tight">{incident.title}</h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Meta */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <DisasterIcon type={incident.disaster_type} />
            <span className="capitalize">{incident.disaster_type.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={14} />
            <span>{incident.location_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users size={14} />
            <span>{incident.affected_population.toLocaleString()} people affected</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock size={14} />
            <span>Reported {timeAgo(incident.created_at)}</span>
          </div>
        </div>

        {/* Description */}
        {incident.description && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Description</h4>
            <p className="text-sm text-slate-700 leading-relaxed">{incident.description}</p>
          </div>
        )}

        {/* AI Recommendations */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2 flex items-center gap-1.5">
            <Zap size={12} /> AI Recommendations
          </h4>
          {loadingRecs ? (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <RefreshCw size={12} className="animate-spin" /> Loading…
            </div>
          ) : recs.length === 0 ? (
            <p className="text-sm text-slate-400">No recommendations yet.</p>
          ) : (
            <div className="space-y-2">
              {recs.map(rec => (
                <div key={rec.id} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">{rec.agent_name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${rec.status === 'pending' ? 'bg-amber-50 text-amber-700' : rec.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {rec.status}
                    </span>
                    <span className="ml-auto text-xs text-slate-500">{Math.round(rec.confidence * 100)}%</span>
                  </div>
                  <p className="text-xs text-slate-700">{rec.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

const SEVERITY_OPTIONS = ['all', 'critical', 'high', 'medium', 'low'];
const STATUS_OPTIONS = ['all', 'active', 'monitoring', 'resolved'];
const TYPE_OPTIONS = ['all', 'flood', 'earthquake', 'wildfire', 'cyclone', 'chemical_leak'];

export function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selected, setSelected] = useState<Incident | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await incidentsApi.list();
      setIncidents(data);
      setOffline(false);
    } catch {
      setIncidents(MOCK_INCIDENTS);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = incidents.filter(inc => {
    const q = search.toLowerCase();
    const matchSearch = !q || inc.title.toLowerCase().includes(q) || inc.location_name?.toLowerCase().includes(q);
    const matchSev = severityFilter === 'all' || inc.severity === severityFilter;
    const matchStatus = statusFilter === 'all' || inc.status === statusFilter;
    const matchType = typeFilter === 'all' || inc.disaster_type === typeFilter;
    return matchSearch && matchSev && matchStatus && matchType;
  });

  const clearFilters = () => {
    setSearch(''); setSeverityFilter('all'); setStatusFilter('all'); setTypeFilter('all');
  };
  const hasFilters = search || severityFilter !== 'all' || statusFilter !== 'all' || typeFilter !== 'all';

  return (
    <div className="flex h-full gap-4" style={{ height: 'calc(100vh - 64px - 48px)' }}>
      {/* Left panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Incident Management</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {filtered.length} of {incidents.length} incidents shown
            </p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {offline && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm mb-3 flex items-center gap-2 flex-shrink-0">
            <AlertTriangle size={14} /> Backend offline — showing simulated data
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-3 flex-shrink-0">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or location…"
              className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-1">
            <Filter size={14} className="text-slate-400" />
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="border border-slate-200 rounded-lg text-sm px-2 py-2 bg-white focus:outline-none"
            >
              {SEVERITY_OPTIONS.map(o => <option key={o} value={o}>{o === 'all' ? 'All Severities' : o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-lg text-sm px-2 py-2 bg-white focus:outline-none"
            >
              {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o === 'all' ? 'All Statuses' : o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
            </select>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="border border-slate-200 rounded-lg text-sm px-2 py-2 bg-white focus:outline-none"
            >
              {TYPE_OPTIONS.map(o => <option key={o} value={o}>{o === 'all' ? 'All Types' : o.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 px-2 py-1.5">
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Incident list */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <RefreshCw size={24} className="animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <AlertTriangle size={32} className="mb-2" />
              <p className="text-sm">No incidents match your filters</p>
            </div>
          ) : (
            filtered.map(inc => (
              <button
                key={inc.id}
                onClick={() => setSelected(inc.id === selected?.id ? null : inc)}
                className={`w-full text-left bg-white rounded-xl border border-l-4 ${SEVERITY_BORDER[inc.severity]} p-4 shadow-sm hover:shadow-md transition-all ${selected?.id === inc.id ? 'ring-2 ring-primary' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 p-1.5 rounded-lg ${inc.severity === 'critical' ? 'bg-red-50 text-red-600' : inc.severity === 'high' ? 'bg-orange-50 text-orange-600' : inc.severity === 'medium' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                    <DisasterIcon type={inc.disaster_type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 text-sm">{inc.title}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium border ${SEVERITY_STYLES[inc.severity]}`}>
                        {inc.severity}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${STATUS_STYLES[inc.status]}`}>
                        {inc.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={11} /> {inc.location_name}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Users size={11} /> {inc.affected_population.toLocaleString()} affected
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock size={11} /> {timeAgo(inc.created_at)}
                      </span>
                    </div>
                    {inc.description && (
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-1">{inc.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 flex-shrink-0">
                    {selected?.id === inc.id ? <X size={16} /> : <ChevronRight size={16} />}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Detail Panel */}
      {selected && (
        <IncidentDetailPanel
          incident={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
