import React from 'react';
import { Layers, Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

export type LayerKey =
  | 'incidents'
  | 'affected_zones'
  | 'hospitals'
  | 'shelters'
  | 'resources'
  | 'responders'
  | 'sensors'
  | 'drones'
  | 'blocked_roads';

export type LayerVisibility = Record<LayerKey, boolean>;

const LAYER_META: { key: LayerKey; label: string; color: string; icon: string }[] = [
  { key: 'incidents',      label: 'Incidents',        color: '#DC2626', icon: '⚠️' },
  { key: 'affected_zones', label: 'Affected Zones',   color: '#F59E0B', icon: '🗺️' },
  { key: 'hospitals',      label: 'Hospitals',        color: '#2563EB', icon: '🏥' },
  { key: 'shelters',       label: 'Shelters',         color: '#16A34A', icon: '🏠' },
  { key: 'resources',      label: 'Vehicles',         color: '#0EA5E9', icon: '🚑' },
  { key: 'responders',     label: 'Responders',       color: '#7C3AED', icon: '👤' },
  { key: 'sensors',        label: 'IoT Sensors',      color: '#8B5CF6', icon: '📡' },
  { key: 'drones',         label: 'Drones',           color: '#06B6D4', icon: '🚁' },
  { key: 'blocked_roads',  label: 'Blocked Roads',    color: '#374151', icon: '🚧' },
];

interface Props {
  layers: LayerVisibility;
  onToggle: (key: LayerKey) => void;
}

export function LayerControls({ layers, onToggle }: Props) {
  const [open, setOpen] = React.useState(true);

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg border border-slate-200 w-52">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-t-lg"
      >
        <span className="flex items-center gap-2"><Layers size={16} /> Layers</span>
        <span className="text-slate-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-2 pb-2 divide-y divide-slate-100">
          {LAYER_META.map(({ key, label, color, icon }) => (
            <button
              key={key}
              onClick={() => onToggle(key)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded transition-colors",
                layers[key] ? "text-slate-800" : "text-slate-400"
              )}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 transition-opacity"
                style={{ background: color, opacity: layers[key] ? 1 : 0.3 }}
              />
              <span className="flex-1 text-left">{label}</span>
              {layers[key]
                ? <Eye size={14} className="text-slate-500" />
                : <EyeOff size={14} className="text-slate-300" />
              }
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
