import React, { useState, useEffect, useRef } from 'react';
import { Search, RefreshCw, AlertTriangle, Users, Cpu, Plane } from 'lucide-react';
import {
  incidentsApi, hospitalsApi, sheltersApi, resourcesApi,
  respondersApi, sensorsApi, dronesApi
} from '../lib/api';
import type { Incident, Hospital, Shelter, Responder, Resource, IoTSensor, Drone } from '../lib/api';
import { GISMap } from '../components/map/GISMap';
import { LayerControls } from '../components/map/LayerControls';
import type { LayerVisibility, LayerKey } from '../components/map/LayerControls';
import { MapLegend } from '../components/map/MapLegend';
import { CHENNAI_CENTER, CHENNAI_ZOOM } from '../lib/mapData';

const DEFAULT_LAYERS: LayerVisibility = {
  incidents: true,
  affected_zones: true,
  hospitals: true,
  shelters: true,
  resources: true,
  responders: false,
  sensors: true,
  drones: true,
  blocked_roads: true,
};

interface MapData {
  incidents: Incident[];
  hospitals: Hospital[];
  shelters: Shelter[];
  responders: Responder[];
  resources: Resource[];
  sensors: IoTSensor[];
  drones: Drone[];
}

export function MapPage() {
  const [data, setData] = useState<MapData>({
    incidents: [], hospitals: [], shelters: [],
    responders: [], resources: [], sensors: [], drones: [],
  });
  const [layers, setLayers] = useState<LayerVisibility>(DEFAULT_LAYERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadData = async () => {
    try {
      setError(null);
      const [incidents, hospitals, shelters, responders, resources, sensors, drones] = await Promise.all([
        incidentsApi.list(),
        hospitalsApi.list(),
        sheltersApi.list(),
        respondersApi.list(),
        resourcesApi.list(),
        sensorsApi.list(),
        dronesApi.list(),
      ]);
      setData({ incidents, hospitals, shelters, responders, resources, sensors, drones });
      setLastRefresh(new Date());
    } catch (e) {
      setError('Unable to connect to backend. Displaying offline data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleToggleLayer = (key: LayerKey) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeIncidents = data.incidents.filter(i => i.status === 'active').length;
  const criticalSensors = data.sensors.filter(
    s => s.status === 'active' && s.last_reading >= s.threshold_critical
  ).length;
  const airborneDrones = data.drones.filter(d => d.status === 'airborne').length;
  const availableResponders = data.responders.filter(r => r.status === 'available').length;

  return (
    <div className="flex flex-col h-full gap-4" style={{ height: 'calc(100vh - 64px - 48px)' }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Live GIS Map</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Chennai, Tamil Nadu — All data is <span className="text-amber-600 font-medium">SIMULATED</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Stats pills */}
          <div className="hidden md:flex items-center gap-2">
            <StatPill icon={<AlertTriangle size={14} className="text-red-500" />} value={activeIncidents} label="Active" />
            <StatPill icon={<Cpu size={14} className="text-purple-500" />} value={criticalSensors} label="Critical Sensors" />
            <StatPill icon={<Plane size={14} className="text-blue-500" />} value={airborneDrones} label="Drones" />
            <StatPill icon={<Users size={14} className="text-green-500" />} value={availableResponders} label="Available" />
          </div>
          <span className="text-xs text-slate-400 hidden lg:block">
            Updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative flex-shrink-0">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search incidents, hospitals, shelters by name…"
          className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-amber-50 border border-warning text-amber-800 px-4 py-2 rounded-lg text-sm flex-shrink-0">
          ⚠ {error}
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 relative rounded-xl overflow-hidden border border-slate-200 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <div className="text-center text-slate-500">
              <RefreshCw size={32} className="animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm">Loading map data…</p>
            </div>
          </div>
        ) : (
          <>
            <GISMap
              layers={layers}
              incidents={filterIncidents(data.incidents, search)}
              hospitals={filterItems(data.hospitals, search)}
              shelters={filterItems(data.shelters, search)}
              responders={data.responders}
              resources={data.resources}
              sensors={data.sensors}
              drones={data.drones}
              center={CHENNAI_CENTER}
              zoom={CHENNAI_ZOOM}
            />
            <LayerControls layers={layers} onToggle={handleToggleLayer} />
            <MapLegend />
          </>
        )}
      </div>
    </div>
  );
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 text-sm">
      {icon}
      <span className="font-semibold text-slate-800">{value}</span>
      <span className="text-slate-500">{label}</span>
    </div>
  );
}

function filterIncidents(items: Incident[], q: string): Incident[] {
  if (!q) return items;
  const lq = q.toLowerCase();
  return items.filter(i =>
    i.title.toLowerCase().includes(lq) ||
    i.location_name?.toLowerCase().includes(lq) ||
    i.disaster_type.toLowerCase().includes(lq)
  );
}

function filterItems<T extends { name: string }>(items: T[], q: string): T[] {
  if (!q) return items;
  const lq = q.toLowerCase();
  return items.filter(i => i.name.toLowerCase().includes(lq));
}
