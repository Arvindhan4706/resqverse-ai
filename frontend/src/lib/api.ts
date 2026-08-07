const BASE_URL = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:8000/api');

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API error: ${response.status}`);
  }
  return response.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// Typed API helpers
export const incidentsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<Incident[]>(`/incidents${qs}`);
  },
  get: (id: number) => api.get<Incident>(`/incidents/${id}`),
  create: (data: Partial<Incident>) => api.post<Incident>('/incidents/', data),
  update: (id: number, data: Partial<Incident>) => api.patch<Incident>(`/incidents/${id}`, data),
};

export const analyticsApi = {
  summary: () => api.get<AnalyticsSummary>('/analytics/summary'),
};

export const recommendationsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<AgentRecommendation[]>(`/recommendations${qs}`);
  },
  get: (id: number) => api.get<AgentRecommendation>(`/recommendations/${id}`),
  approve: (id: number, approvedBy: string) =>
    api.post<AgentRecommendation>(`/recommendations/${id}/approve`, { approved_by: approvedBy }),
  reject: (id: number, rejectedBy: string, reason: string) =>
    api.post<AgentRecommendation>(`/recommendations/${id}/reject`, { rejected_by: rejectedBy, reason }),
};

export const hospitalsApi = {
  list: () => api.get<Hospital[]>('/hospitals/'),
};

export const sheltersApi = {
  list: () => api.get<Shelter[]>('/shelters/'),
};

export const resourcesApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<Resource[]>(`/resources${qs}`);
  },
};

export const respondersApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<Responder[]>(`/responders${qs}`);
  },
};

export const sensorsApi = {
  list: () => api.get<IoTSensor[]>('/sensors/'),
};

export const dronesApi = {
  list: () => api.get<Drone[]>('/drones/'),
};

export const auditApi = {
  list: () => api.get<AuditLog[]>('/audit/'),
};

export const simulationsApi = {
  list: () => api.get<SimulationScenario[]>('/simulations/'),
  create: (data: Partial<SimulationScenario>) => api.post<SimulationScenario>('/simulations/', data),
  start: (id: number) => api.post<SimulationScenario>(`/simulations/${id}/start`, {}),
  pause: (id: number) => api.post<SimulationScenario>(`/simulations/${id}/pause`, {}),
  stop: (id: number) => api.post<SimulationScenario>(`/simulations/${id}/stop`, {}),
};

// Types matching the backend models
export interface Incident {
  id: number;
  title: string;
  description: string;
  disaster_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'monitoring';
  latitude: number;
  longitude: number;
  location_name: string;
  affected_population: number;
  created_at: string;
  updated_at: string;
  is_simulated: boolean;
}

export interface Hospital {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  total_beds: number;
  available_beds: number;
  icu_beds: number;
  available_icu: number;
  contact_number: string;
  is_operational: boolean;
}

export interface Shelter {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  total_capacity: number;
  current_occupancy: number;
  is_active: boolean;
  has_medical: boolean;
  has_food: boolean;
  contact_person: string;
}

export interface Resource {
  id: number;
  name: string;
  resource_type: string;
  category: string;
  status: 'available' | 'deployed' | 'maintenance';
  quantity: number;
  unit: string;
  latitude: number;
  longitude: number;
}

export interface Responder {
  id: number;
  name: string;
  role: string;
  status: 'available' | 'deployed' | 'off_duty';
  latitude: number;
  longitude: number;
  team: string;
  specialization: string;
}

export interface IoTSensor {
  id: number;
  sensor_id: string;
  sensor_type: string;
  location_name: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'inactive' | 'fault';
  last_reading: number;
  unit: string;
  threshold_warning: number;
  threshold_critical: number;
  last_updated: string;
}

export interface Drone {
  id: number;
  drone_id: string;
  model: string;
  status: 'standby' | 'airborne' | 'returning' | 'maintenance';
  latitude: number;
  longitude: number;
  altitude: number;
  battery_level: number;
  mission: string;
  assigned_incident_id: number | null;
}

export interface AgentRecommendation {
  id: number;
  agent_name: string;
  incident_id: number;
  recommendation: string;
  reasoning: string;
  confidence: number;
  risk_level: string;
  data_used: Record<string, unknown>;
  requires_human_approval: boolean;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  performed_by: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface SimulationScenario {
  id: number;
  name: string;
  scenario_type: string;
  severity: number;
  status: 'idle' | 'running' | 'paused' | 'completed';
  parameters: Record<string, unknown>;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

export interface AnalyticsSummary {
  total_incidents: number;
  active_incidents: number;
  critical_incidents: number;
  people_affected: number;
  available_responders: number;
  total_responders: number;
  available_vehicles: number;
  shelter_capacity: number;
  shelter_occupancy: number;
  shelter_occupancy_pct: number;
  hospital_beds_total: number;
  hospital_beds_available: number;
  hospital_occupancy_pct: number;
  pending_approvals: number;
  sensor_critical_alerts: number;
}
