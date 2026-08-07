import React, { useState, useEffect } from 'react';
import {
  Box, Users, Plane, RefreshCw, AlertTriangle,
  Search, Filter, Battery, Signal, Truck, Wrench,
  Shield, Activity, MapPin
} from 'lucide-react';
import { resourcesApi, respondersApi, dronesApi } from '../lib/api';
import type { Resource, Responder, Drone } from '../lib/api';

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  deployed: 'bg-amber-100 text-amber-700',
  maintenance: 'bg-red-100 text-red-700',
  standby: 'bg-blue-100 text-blue-700',
  airborne: 'bg-sky-100 text-sky-700',
  returning: 'bg-purple-100 text-purple-700',
  off_duty: 'bg-slate-100 text-slate-500',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function BatteryBar({ level }: { level: number }) {
  const color = level > 60 ? 'bg-green-500' : level > 30 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <Battery size={13} className={level > 60 ? 'text-green-500' : level > 30 ? 'text-amber-500' : 'text-red-500'} />
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${level}%` }} />
      </div>
      <span className="text-xs text-slate-500 w-8 text-right">{level}%</span>
    </div>
  );
}

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_RESOURCES: Resource[] = [
  { id: 1, name: 'Ambulance Unit 01', resource_type: 'vehicle', category: 'ambulance', status: 'deployed', quantity: 1, unit: 'unit', latitude: 13.0, longitude: 80.2, assigned_to: '', is_simulated: true },
  { id: 2, name: 'Water Pump Set A', resource_type: 'equipment', category: 'pump', status: 'available', quantity: 3, unit: 'units', latitude: 13.0, longitude: 80.2, assigned_to: '', is_simulated: true },
  { id: 3, name: 'Rescue Boat RB-7', resource_type: 'vehicle', category: 'rescue_boat', status: 'deployed', quantity: 1, unit: 'unit', latitude: 13.0, longitude: 80.2, assigned_to: '', is_simulated: true },
  { id: 4, name: 'Emergency Food Packs', resource_type: 'food', category: 'food_supply', status: 'available', quantity: 500, unit: 'packs', latitude: 13.0, longitude: 80.2, assigned_to: '', is_simulated: true },
  { id: 5, name: 'Medical Kit Alpha', resource_type: 'medical_supply', category: 'first_aid', status: 'available', quantity: 50, unit: 'kits', latitude: 13.0, longitude: 80.2, assigned_to: '', is_simulated: true },
  { id: 6, name: 'Fire Truck F-3', resource_type: 'vehicle', category: 'fire_truck', status: 'maintenance', quantity: 1, unit: 'unit', latitude: 13.0, longitude: 80.2, assigned_to: '', is_simulated: true },
];

const MOCK_RESPONDERS: Responder[] = [
  { id: 1, name: 'Arjun Sharma', role: 'paramedic', status: 'available', latitude: 13.0, longitude: 80.2, team: 'Alpha', specialization: 'Trauma Care', contact_number: '', is_simulated: true },
  { id: 2, name: 'Priya Nair', role: 'firefighter', status: 'deployed', latitude: 13.0, longitude: 80.2, team: 'Bravo', specialization: 'Structural Fires', contact_number: '', is_simulated: true },
  { id: 3, name: 'Rajan Kumar', role: 'rescue_diver', status: 'available', latitude: 13.0, longitude: 80.2, team: 'Alpha', specialization: 'Swift Water Rescue', contact_number: '', is_simulated: true },
  { id: 4, name: 'Meena Pillai', role: 'coordinator', status: 'deployed', latitude: 13.0, longitude: 80.2, team: 'Command', specialization: 'Logistics', contact_number: '', is_simulated: true },
  { id: 5, name: 'Vignesh Rajan', role: 'paramedic', status: 'off_duty', latitude: 13.0, longitude: 80.2, team: 'Charlie', specialization: 'Pediatric Care', contact_number: '', is_simulated: true },
  { id: 6, name: 'Divya Krishnan', role: 'firefighter', status: 'available', latitude: 13.0, longitude: 80.2, team: 'Bravo', specialization: 'Hazmat Response', contact_number: '', is_simulated: true },
];

const MOCK_DRONES: Drone[] = [
  { id: 1, drone_id: 'DRN-001', model: 'DJI Matrice 300', status: 'airborne', latitude: 13.01, longitude: 80.22, altitude: 120, battery_level: 72, mission: 'Flood area surveillance', assigned_incident_id: 1, last_updated: '', is_simulated: true },
  { id: 2, drone_id: 'DRN-002', model: 'Parrot Anafi', status: 'standby', latitude: 13.05, longitude: 80.25, altitude: 0, battery_level: 95, mission: 'Standby - HQ', assigned_incident_id: null, last_updated: '', is_simulated: true },
  { id: 3, drone_id: 'DRN-003', model: 'DJI Matrice 30T', status: 'returning', latitude: 12.93, longitude: 80.15, altitude: 45, battery_level: 28, mission: 'Earthquake zone thermal scan', assigned_incident_id: 2, last_updated: '', is_simulated: true },
  { id: 4, drone_id: 'DRN-004', model: 'Wingtra One', status: 'maintenance', latitude: 13.08, longitude: 80.21, altitude: 0, battery_level: 0, mission: 'Under maintenance', assigned_incident_id: null, last_updated: '', is_simulated: true },
];

// ── Resource Card ──────────────────────────────────────────────────────────

function ResourceCategoryIcon({ type }: { type: string }) {
  switch (type) {
    case 'vehicle': return <Truck size={18} />;
    case 'medical_supply': return <Activity size={18} />;
    case 'food': return <Box size={18} />;
    default: return <Wrench size={18} />;
  }
}

// ── Responder Card ─────────────────────────────────────────────────────────

function RoleIcon({ role }: { role: string }) {
  switch (role) {
    case 'firefighter': return <Shield size={16} className="text-orange-500" />;
    case 'paramedic': return <Activity size={16} className="text-red-500" />;
    case 'rescue_diver': return <Signal size={16} className="text-blue-500" />;
    default: return <Users size={16} className="text-slate-400" />;
  }
}

// ── Tabs ───────────────────────────────────────────────────────────────────

type Tab = 'resources' | 'responders' | 'drones';

export function ResourcesPage() {
  const [tab, setTab] = useState<Tab>('resources');
  const [resources, setResources] = useState<Resource[]>([]);
  const [responders, setResponders] = useState<Responder[]>([]);
  const [drones, setDrones] = useState<Drone[]>([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const [r, resp, d] = await Promise.all([
        resourcesApi.list(),
        respondersApi.list(),
        dronesApi.list(),
      ]);
      setResources(r);
      setResponders(resp);
      setDrones(d);
      setOffline(false);
    } catch {
      setResources(MOCK_RESOURCES);
      setResponders(MOCK_RESPONDERS);
      setDrones(MOCK_DRONES);
      setOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const TABS: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'resources', label: 'Resources', icon: <Box size={16} />, count: resources.length },
    { key: 'responders', label: 'Responders', icon: <Users size={16} />, count: responders.length },
    { key: 'drones', label: 'Drones', icon: <Plane size={16} />, count: drones.length },
  ];

  const filteredResources = resources.filter(r => {
    const q = search.toLowerCase();
    return (!q || r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q))
      && (statusFilter === 'all' || r.status === statusFilter);
  });

  const filteredResponders = responders.filter(r => {
    const q = search.toLowerCase();
    return (!q || r.name.toLowerCase().includes(q) || r.role.toLowerCase().includes(q) || r.team.toLowerCase().includes(q))
      && (statusFilter === 'all' || r.status === statusFilter);
  });

  const filteredDrones = drones.filter(d => {
    const q = search.toLowerCase();
    return (!q || d.drone_id.toLowerCase().includes(q) || d.model.toLowerCase().includes(q) || d.mission.toLowerCase().includes(q))
      && (statusFilter === 'all' || d.status === statusFilter);
  });

  const statusOptions =
    tab === 'resources' ? ['all', 'available', 'deployed', 'maintenance'] :
    tab === 'responders' ? ['all', 'available', 'deployed', 'off_duty'] :
    ['all', 'standby', 'airborne', 'returning', 'maintenance'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Resource Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">Equipment, personnel, and drone assets</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {offline && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle size={14} /> Backend offline — showing simulated data
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setStatusFilter('all'); }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            {t.icon}
            {t.label}
            <span className={`text-xs rounded-full px-1.5 py-0.5 font-semibold ${tab === t.key ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${tab}…`}
            className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-1">
          <Filter size={14} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-sm px-2 py-2 bg-white focus:outline-none"
          >
            {statusOptions.map(o => (
              <option key={o} value={o}>{o === 'all' ? 'All Statuses' : o.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><RefreshCw size={24} className="animate-spin text-primary" /></div>
      ) : (
        <>
          {/* Resources Tab */}
          {tab === 'resources' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredResources.map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`p-2 rounded-lg ${r.resource_type === 'vehicle' ? 'bg-blue-50 text-blue-600' : r.resource_type === 'medical_supply' ? 'bg-red-50 text-red-600' : r.resource_type === 'food' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-600'}`}>
                      <ResourceCategoryIcon type={r.resource_type} />
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <h4 className="font-semibold text-slate-900 mt-2 text-sm">{r.name}</h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="capitalize">{r.resource_type.replace('_', ' ')}</span>
                    <span>·</span>
                    <span className="capitalize">{r.category.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Box size={11} />
                      <span>{r.quantity} {r.unit}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin size={11} />
                      <span>On file</span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredResources.length === 0 && <p className="col-span-3 text-sm text-slate-400 py-8 text-center">No resources match your filters</p>}
            </div>
          )}

          {/* Responders Tab */}
          {tab === 'responders' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredResponders.map(r => (
                <div key={r.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                        {r.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{r.name}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <RoleIcon role={r.role} />
                          <span className="capitalize">{r.role.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-3 text-xs text-slate-500">
                    <span className="bg-slate-100 rounded px-2 py-0.5 font-medium">Team {r.team}</span>
                    <span className="truncate">{r.specialization}</span>
                  </div>
                </div>
              ))}
              {filteredResponders.length === 0 && <p className="col-span-3 text-sm text-slate-400 py-8 text-center">No responders match your filters</p>}
            </div>
          )}

          {/* Drones Tab */}
          {tab === 'drones' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredDrones.map(d => (
                <div key={d.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Plane size={16} className={d.status === 'airborne' ? 'text-sky-500 animate-bounce' : 'text-slate-400'} />
                        <span className="font-bold text-slate-900 text-sm">{d.drone_id}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{d.model}</p>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="mt-3">
                    <BatteryBar level={d.battery_level} />
                  </div>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-1">
                    📋 {d.mission}
                  </p>
                  {d.status === 'airborne' && (
                    <p className="text-xs text-sky-600 mt-1">
                      ✈ {d.altitude}m altitude
                    </p>
                  )}
                </div>
              ))}
              {filteredDrones.length === 0 && <p className="col-span-3 text-sm text-slate-400 py-8 text-center">No drones match your filters</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
