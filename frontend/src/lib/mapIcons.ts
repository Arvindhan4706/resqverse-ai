import L from 'leaflet';

// Fix leaflet default icon path issue with Vite/webpack bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// SVG icon factory
function svgIcon(color: string, symbol: string, size = 32) {
  return L.divIcon({
    className: '',
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
    ">
      <span style="transform:rotate(45deg);font-size:${size * 0.45}px;line-height:1">${symbol}</span>
    </div>`,
  });
}

function circleIcon(color: string, symbol: string, size = 28) {
  return L.divIcon({
    className: '',
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border-radius:50%;
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
      font-size:${size * 0.45}px;
    ">${symbol}</div>`,
  });
}

function pulsingIcon(color: string, symbol: string) {
  const size = 36;
  return L.divIcon({
    className: '',
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      <div style="
        position:absolute;inset:0;
        background:${color};
        border-radius:50%;
        opacity:0.3;
        animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
      "></div>
      <div style="
        position:absolute;inset:4px;
        background:${color};
        border-radius:50%;
        border:2px solid white;
        box-shadow:0 2px 6px rgba(0,0,0,0.4);
        display:flex;align-items:center;justify-content:center;
        font-size:14px;
      ">${symbol}</div>
    </div>
    <style>
      @keyframes ping {
        75%, 100% { transform: scale(2); opacity: 0; }
      }
    </style>`,
  });
}

export const icons = {
  // Incidents by severity
  incident_critical: pulsingIcon('#DC2626', '🔴'),
  incident_high: svgIcon('#EA580C', '⚠️', 32),
  incident_medium: svgIcon('#F59E0B', '⚠️', 28),
  incident_low: svgIcon('#3B82F6', 'ℹ️', 24),

  // Infrastructure
  hospital: circleIcon('#2563EB', '🏥', 30),
  shelter: circleIcon('#16A34A', '🏠', 28),
  fire_station: circleIcon('#DC2626', '🚒', 28),

  // Mobile units
  ambulance: circleIcon('#2563EB', '🚑', 26),
  rescue_boat: circleIcon('#0EA5E9', '⛵', 26),
  fire_truck: circleIcon('#DC2626', '🚒', 26),

  // Personnel
  responder_available: circleIcon('#16A34A', '👤', 24),
  responder_deployed: circleIcon('#F59E0B', '👤', 24),

  // IoT / Tech
  sensor_active: circleIcon('#8B5CF6', '📡', 22),
  sensor_warning: circleIcon('#F59E0B', '📡', 22),
  sensor_critical: pulsingIcon('#DC2626', '📡'),
  sensor_fault: circleIcon('#6B7280', '📡', 22),

  // Drones
  drone_airborne: pulsingIcon('#0EA5E9', '🚁'),
  drone_standby: circleIcon('#6B7280', '🚁', 24),
  drone_returning: circleIcon('#F59E0B', '🚁', 24),
};

export function getIncidentIcon(severity: string) {
  return icons[`incident_${severity}` as keyof typeof icons] ?? icons.incident_low;
}

export function getSensorIcon(sensor: { status: string; last_reading: number; threshold_critical: number; threshold_warning: number }) {
  if (sensor.status === 'fault') return icons.sensor_fault;
  if (sensor.last_reading >= sensor.threshold_critical) return icons.sensor_critical;
  if (sensor.last_reading >= sensor.threshold_warning) return icons.sensor_warning;
  return icons.sensor_active;
}

export function getDroneIcon(status: string) {
  if (status === 'airborne') return icons.drone_airborne;
  if (status === 'returning') return icons.drone_returning;
  return icons.drone_standby;
}

export function getSeverityZoneColor(severity: string) {
  const map: Record<string, string> = {
    critical: '#DC2626',
    high: '#EA580C',
    medium: '#F59E0B',
    low: '#3B82F6',
  };
  return map[severity] ?? '#6B7280';
}
