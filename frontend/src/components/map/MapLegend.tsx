import React from 'react';

const LEGEND_ITEMS = [
  { color: '#DC2626', label: 'Critical Incident', pulse: true },
  { color: '#EA580C', label: 'High Severity' },
  { color: '#F59E0B', label: 'Medium Severity / Warning' },
  { color: '#3B82F6', label: 'Low Severity' },
  { color: '#2563EB', label: 'Hospital' },
  { color: '#16A34A', label: 'Shelter / Evacuation Site' },
  { color: '#0EA5E9', label: 'Emergency Vehicle' },
  { color: '#7C3AED', label: 'Field Responder' },
  { color: '#8B5CF6', label: 'IoT Sensor' },
  { color: '#06B6D4', label: 'Drone' },
  { color: '#374151', label: 'Blocked Road' },
];

export function MapLegend() {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="absolute bottom-8 left-4 z-[1000] bg-white rounded-lg shadow-lg border border-slate-200 w-52">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-t-lg"
      >
        <span>Map Legend</span>
        <span>{collapsed ? '▲' : '▼'}</span>
      </button>
      {!collapsed && (
        <div className="px-3 pb-3 space-y-1.5">
          {LEGEND_ITEMS.map(({ color, label, pulse }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-slate-600">
              <div className="relative w-3 h-3 flex-shrink-0">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: color }}
                />
                {pulse && (
                  <div
                    className="absolute inset-0 rounded-full animate-ping"
                    style={{ background: color, opacity: 0.4 }}
                  />
                )}
              </div>
              <span>{label}</span>
            </div>
          ))}
          <div className="pt-1 border-t border-slate-100 text-xs text-slate-400 italic">
            All data is SIMULATED
          </div>
        </div>
      )}
    </div>
  );
}
