import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap } from 'react-leaflet';
import { Navigation, AlertTriangle, Clock } from 'lucide-react';
import type { Incident, Hospital, Shelter, Responder, Resource, IoTSensor, Drone } from '../../lib/api';
import { getIncidentIcon, getSensorIcon, getDroneIcon, getSeverityZoneColor, icons } from '../../lib/mapIcons';
import { affectedZones, blockedRoads } from '../../lib/mapData';
import type { LayerVisibility } from './LayerControls';

// ── Helpers ──────────────────────────────────────────────────────────────────

const SEVERITY_BADGE: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700',
};

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-red-100 text-red-700',
  monitoring: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
};

function formatDT(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });
}

// ── Centre button helper ──────────────────────────────────────────────────────
function CenterButton({ incidents }: { incidents: Incident[] }) {
  const map = useMap();
  const active = incidents.filter(i => i.status === 'active' && i.severity === 'critical');

  const handleCenter = useCallback(() => {
    if (active.length === 0) return;
    const first = active[0];
    map.flyTo([first.latitude, first.longitude], 14, { duration: 1.2 });
  }, [map, active]);

  return (
    <button
      onClick={handleCenter}
      disabled={active.length === 0}
      className="absolute top-4 left-4 z-[1000] bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Navigation size={16} className="text-red-500" />
      Centre on Critical Incident
    </button>
  );
}

// ── Sensor status label ───────────────────────────────────────────────────────
function sensorAlertLabel(s: IoTSensor) {
  if (s.status === 'fault') return { label: 'FAULT', cls: 'bg-gray-100 text-gray-600' };
  if (s.last_reading >= s.threshold_critical) return { label: 'CRITICAL', cls: 'bg-red-100 text-red-700' };
  if (s.last_reading >= s.threshold_warning) return { label: 'WARNING', cls: 'bg-amber-100 text-amber-700' };
  return { label: 'NORMAL', cls: 'bg-green-100 text-green-700' };
}

// ── Main GIS Map ──────────────────────────────────────────────────────────────
interface Props {
  layers: LayerVisibility;
  incidents: Incident[];
  hospitals: Hospital[];
  shelters: Shelter[];
  responders: Responder[];
  resources: Resource[];
  sensors: IoTSensor[];
  drones: Drone[];
  center: [number, number];
  zoom: number;
}

export function GISMap({ layers, incidents, hospitals, shelters, responders, resources, sensors, drones, center, zoom }: Props) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="w-full h-full rounded-lg"
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <CenterButton incidents={incidents} />

      {/* ── Affected zones ── */}
      {layers.affected_zones && affectedZones.map(zone => (
        <Polygon
          key={zone.id}
          positions={zone.coordinates}
          pathOptions={{
            color: getSeverityZoneColor(zone.severity),
            fillColor: getSeverityZoneColor(zone.severity),
            fillOpacity: 0.18,
            weight: 2,
            dashArray: '6 4',
          }}
        >
          <Popup>
            <div className="text-sm space-y-1 min-w-[160px]">
              <p className="font-semibold text-slate-800">{zone.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SEVERITY_BADGE[zone.severity]}`}>
                {zone.severity.toUpperCase()}
              </span>
              <p className="text-slate-500 text-xs capitalize">Type: {zone.type.replace('_', ' ')}</p>
              <p className="text-xs text-amber-600 italic">⚠ SIMULATED ZONE</p>
            </div>
          </Popup>
        </Polygon>
      ))}

      {/* ── Blocked roads ── */}
      {layers.blocked_roads && blockedRoads.map(road => (
        <Polyline
          key={road.id}
          positions={[road.from, road.to]}
          pathOptions={{ color: '#DC2626', weight: 5, dashArray: '8 5' }}
        >
          <Popup>
            <div className="text-sm space-y-1">
              <p className="font-semibold text-slate-800">🚧 {road.name}</p>
              <p className="text-slate-600 text-xs">{road.reason}</p>
              <p className="text-xs text-amber-600 italic">⚠ SIMULATED</p>
            </div>
          </Popup>
        </Polyline>
      ))}

      {/* ── Incident markers ── */}
      {layers.incidents && incidents.map(inc => (
        <Marker key={`inc-${inc.id}`} position={[inc.latitude, inc.longitude]} icon={getIncidentIcon(inc.severity)}>
          <Popup maxWidth={280}>
            <div className="space-y-2 min-w-[240px]">
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold text-slate-800 text-sm leading-tight">{inc.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${SEVERITY_BADGE[inc.severity]}`}>
                  {inc.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-600">{inc.description}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <AlertTriangle size={12} className="text-amber-500" />
                  {inc.affected_population.toLocaleString()} affected
                </span>
                <span className={`px-2 py-0.5 rounded-full ${STATUS_BADGE[inc.status]}`}>
                  {inc.status}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                <Clock size={10} />
                {formatDT(inc.created_at)}
              </div>
              <p className="text-xs text-slate-400 italic">{inc.location_name} • SIMULATED</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* ── Hospitals ── */}
      {layers.hospitals && hospitals.map(h => (
        <Marker key={`hosp-${h.id}`} position={[h.latitude, h.longitude]} icon={icons.hospital}>
          <Popup>
            <div className="text-sm space-y-1 min-w-[200px]">
              <p className="font-bold text-slate-800">🏥 {h.name}</p>
              <p className="text-xs text-slate-500">{h.address}</p>
              <div className="grid grid-cols-2 gap-1 text-xs mt-1">
                <div className="bg-blue-50 rounded p-1 text-center">
                  <div className="font-semibold text-blue-700">{h.available_beds}</div>
                  <div className="text-slate-500">Beds free</div>
                </div>
                <div className="bg-red-50 rounded p-1 text-center">
                  <div className="font-semibold text-red-700">{h.available_icu}</div>
                  <div className="text-slate-500">ICU free</div>
                </div>
              </div>
              <p className="text-xs text-slate-400">{h.contact_number}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* ── Shelters ── */}
      {layers.shelters && shelters.map(s => {
        const pct = Math.round((s.current_occupancy / s.total_capacity) * 100);
        return (
          <Marker key={`shel-${s.id}`} position={[s.latitude, s.longitude]} icon={icons.shelter}>
            <Popup>
              <div className="text-sm space-y-1 min-w-[200px]">
                <p className="font-bold text-slate-800">🏠 {s.name}</p>
                <p className="text-xs text-slate-500">{s.address}</p>
                <div className="mt-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Occupancy</span>
                    <span className={pct > 90 ? 'text-red-600 font-semibold' : 'text-slate-600'}>
                      {s.current_occupancy}/{s.total_capacity} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full"
                      style={{ width: `${pct}%`, background: pct > 90 ? '#DC2626' : pct > 70 ? '#F59E0B' : '#16A34A' }}
                    />
                  </div>
                </div>
                <div className="flex gap-2 text-xs mt-1">
                  {s.has_medical && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Medical ✓</span>}
                  {s.has_food && <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full">Food ✓</span>}
                </div>
                <p className="text-xs text-slate-400">Contact: {s.contact_person}</p>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* ── Resources (Vehicles) ── */}
      {layers.resources && resources
        .filter(r => r.resource_type === 'vehicle' && r.latitude && r.longitude)
        .map(r => {
          const icon = r.category === 'ambulance' ? icons.ambulance
            : r.category === 'fire_truck' ? icons.fire_truck
            : r.category === 'rescue_boat' ? icons.rescue_boat
            : icons.ambulance;
          return (
            <Marker key={`res-${r.id}`} position={[r.latitude, r.longitude]} icon={icon}>
              <Popup>
                <div className="text-sm space-y-1">
                  <p className="font-bold text-slate-800">{r.name}</p>
                  <p className="text-xs capitalize text-slate-500">{r.category?.replace('_', ' ')}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    r.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {r.status}
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}

      {/* ── Responders ── */}
      {layers.responders && responders.map(r => (
        <Marker
          key={`resp-${r.id}`}
          position={[r.latitude, r.longitude]}
          icon={r.status === 'available' ? icons.responder_available : icons.responder_deployed}
        >
          <Popup>
            <div className="text-sm space-y-1">
              <p className="font-bold text-slate-800">{r.name}</p>
              <p className="text-xs text-slate-500">{r.specialization}</p>
              <p className="text-xs text-slate-500">Team: {r.team}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                r.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {r.status}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* ── IoT Sensors ── */}
      {layers.sensors && sensors.map(s => {
        const alert = sensorAlertLabel(s);
        return (
          <Marker key={`sen-${s.id}`} position={[s.latitude, s.longitude]} icon={getSensorIcon(s)}>
            <Popup>
              <div className="text-sm space-y-1 min-w-[180px]">
                <p className="font-bold text-slate-800">📡 {s.sensor_id}</p>
                <p className="text-xs text-slate-500">{s.location_name}</p>
                <p className="text-xs text-slate-500 capitalize">{s.sensor_type.replace('_', ' ')} Sensor</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">
                    {s.last_reading} {s.unit}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${alert.cls}`}>
                    {alert.label}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  ⚠ Warn: {s.threshold_warning} • 🔴 Crit: {s.threshold_critical}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* ── Drones ── */}
      {layers.drones && drones.map(d => (
        <Marker key={`drn-${d.id}`} position={[d.latitude, d.longitude]} icon={getDroneIcon(d.status)}>
          <Popup>
            <div className="text-sm space-y-1 min-w-[180px]">
              <p className="font-bold text-slate-800">🚁 {d.drone_id}</p>
              <p className="text-xs text-slate-500">{d.model}</p>
              <p className="text-xs text-slate-600">{d.mission}</p>
              <div className="flex items-center gap-2 text-xs">
                <span>Alt: {d.altitude}m</span>
                <span>🔋 {d.battery_level}%</span>
                <span className={`px-2 py-0.5 rounded-full font-medium ${
                  d.status === 'airborne' ? 'bg-blue-100 text-blue-700' :
                  d.status === 'returning' ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{d.status}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
