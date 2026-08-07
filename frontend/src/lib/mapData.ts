// Mock GeoJSON for Chennai — all data is SIMULATED for educational purposes.
// Replace with real GIS data feeds when deploying in a live environment.

export const CHENNAI_CENTER: [number, number] = [13.0827, 80.2707];
export const CHENNAI_ZOOM = 12;

// Affected zone polygons (simplified bounding areas)
export const affectedZones = [
  {
    id: 'zone-flood-adyar',
    type: 'flood',
    severity: 'critical',
    name: 'Adyar Flood Zone',
    incident_id: 1,
    // rough polygon around Adyar
    coordinates: [
      [13.022, 80.210], [13.022, 80.235],
      [13.008, 80.235], [13.008, 80.210],
    ] as [number, number][],
  },
  {
    id: 'zone-collapse-tnagar',
    type: 'earthquake',
    severity: 'high',
    name: 'T. Nagar Collapse Zone',
    incident_id: 2,
    coordinates: [
      [13.049, 80.228], [13.049, 80.242],
      [13.036, 80.242], [13.036, 80.228],
    ] as [number, number][],
  },
  {
    id: 'zone-chemical-manali',
    type: 'chemical_leak',
    severity: 'high',
    name: 'Manali Chemical Zone',
    incident_id: 3,
    coordinates: [
      [13.174, 80.248], [13.174, 80.264],
      [13.160, 80.264], [13.160, 80.248],
    ] as [number, number][],
  },
  {
    id: 'zone-cyclone-coast',
    type: 'cyclone',
    severity: 'critical',
    name: 'Coastal Cyclone Warning Zone',
    incident_id: 4,
    coordinates: [
      [13.065, 80.278], [13.065, 80.295],
      [12.990, 80.295], [12.990, 80.278],
    ] as [number, number][],
  },
  {
    id: 'zone-fire-guindy',
    type: 'wildfire',
    severity: 'medium',
    name: 'Guindy Fire Zone',
    incident_id: 5,
    coordinates: [
      [13.016, 80.203], [13.016, 80.218],
      [13.001, 80.218], [13.001, 80.203],
    ] as [number, number][],
  },
];

// Blocked road segments
export const blockedRoads = [
  { id: 'road-1', name: 'Adyar Bridge Road', from: [13.012, 80.218] as [number, number], to: [13.005, 80.225] as [number, number], reason: 'Flood inundation' },
  { id: 'road-2', name: 'T. Nagar Main Road', from: [13.047, 80.233] as [number, number], to: [13.041, 80.238] as [number, number], reason: 'Structural collapse debris' },
  { id: 'road-3', name: 'Manali Industrial Road', from: [13.163, 80.252] as [number, number], to: [13.170, 80.258] as [number, number], reason: 'Chemical hazard exclusion zone' },
  { id: 'road-4', name: 'Marina Beach Road', from: [13.055, 80.281] as [number, number], to: [13.045, 80.284] as [number, number], reason: 'Cyclone evacuation route — one-way outbound' },
];
