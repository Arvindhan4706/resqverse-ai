import { supabase } from './supabase';

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
  created_by: string;
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
  is_simulated: boolean;
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
  is_simulated: boolean;
}

export interface Responder {
  id: number;
  name: string;
  role: string;
  status: string;
  latitude: number;
  longitude: number;
  team: string;
  contact_number: string;
  specialization: string;
  is_simulated: boolean;
}

export interface Resource {
  id: number;
  name: string;
  resource_type: string;
  category: string;
  status: string;
  quantity: number;
  unit: string;
  latitude: number;
  longitude: number;
  assigned_to: string;
  is_simulated: boolean;
}

export interface ResourceDeployment {
  id: number;
  incident_id: number;
  resource_id: number;
  deployed_at: string;
  status: string;
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
  is_simulated: boolean;
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
  last_updated: string;
  is_simulated: boolean;
}

export interface AgentRecommendation {
  id: number;
  agent_name: string;
  incident_id: number;
  recommendation: string;
  reasoning: string;
  confidence: number;
  risk_level: string;
  data_used: Record<string, any>;
  requires_human_approval: boolean;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  performed_by: string;
  details: Record<string, any>;
  created_at: string;
}

export interface SimulationScenario {
  id: number;
  name: string;
  scenario_type: string;
  severity: number;
  status: 'idle' | 'running' | 'paused' | 'completed';
  parameters: Record<string, any>;
  created_at: string;
  started_at?: string;
  ended_at?: string;
}

export interface AnalyticsSummary {
  total_incidents: number;
  active_incidents: number;
  critical_incidents: number;
  people_affected: number;
  active_responders: number;
  total_responders: number;
  available_responders: number;
  available_vehicles: number;
  shelter_capacity: number;
  shelter_occupancy: number;
  shelter_occupancy_pct: number;
  available_shelter_capacity: number;
  hospital_beds_total: number;
  hospital_beds_available: number;
  hospital_occupancy_pct: number;
  available_icu_beds: number;
  active_drones: number;
  sensor_critical_alerts: number;
  critical_sensors: number;
  pending_approvals: number;
}

// API methods using Supabase

export const incidentsApi = {
  list: async (params?: Record<string, string>) => {
    let query = supabase.from('incidents').select('*').order('created_at', { ascending: false });
    if (params?.status) {
      query = query.eq('status', params.status);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as Incident[];
  },
  get: async (id: number) => {
    const { data, error } = await supabase.from('incidents').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Incident;
  },
  create: async (data: Partial<Incident>) => {
    const { data: created, error } = await supabase.from('incidents').insert([data]).select().single();
    if (error) throw error;
    return created as Incident;
  },
  update: async (id: number, data: Partial<Incident>) => {
    const { data: updated, error } = await supabase.from('incidents').update(data).eq('id', id).select().single();
    if (error) throw error;
    return updated as Incident;
  }
};

export const hospitalsApi = {
  list: async () => {
    const { data, error } = await supabase.from('hospitals').select('*');
    if (error) throw error;
    return data as Hospital[];
  }
};

export const sheltersApi = {
  list: async () => {
    const { data, error } = await supabase.from('shelters').select('*');
    if (error) throw error;
    return data as Shelter[];
  }
};

export const resourcesApi = {
  list: async (params?: Record<string, string>) => {
    let query = supabase.from('resources').select('*');
    if (params?.status) {
      query = query.eq('status', params.status);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as Resource[];
  }
};

export const respondersApi = {
  list: async (params?: Record<string, string>) => {
    let query = supabase.from('responders').select('*');
    if (params?.status) {
      query = query.eq('status', params.status);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as Responder[];
  }
};

export const sensorsApi = {
  list: async () => {
    const { data, error } = await supabase.from('iot_sensors').select('*');
    if (error) throw error;
    return data as IoTSensor[];
  }
};

export const dronesApi = {
  list: async () => {
    const { data, error } = await supabase.from('drones').select('*');
    if (error) throw error;
    return data as Drone[];
  }
};

export const recommendationsApi = {
  list: async (params?: Record<string, string>) => {
    let query = supabase.from('agent_recommendations').select('*').order('created_at', { ascending: false });
    if (params?.status) {
      query = query.eq('status', params.status);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as AgentRecommendation[];
  },
  get: async (id: number) => {
    const { data, error } = await supabase.from('agent_recommendations').select('*').eq('id', id).single();
    if (error) throw error;
    return data as AgentRecommendation;
  },
  approve: async (id: number, approvedBy: string) => {
    const { data, error } = await supabase.from('agent_recommendations')
      .update({ status: 'approved', approved_by: approvedBy, approved_at: new Date().toISOString() })
      .eq('id', id)
      .select().single();
    if (error) throw error;
    
    await supabase.from('audit_logs').insert([{
      action: 'recommendation_approved',
      entity_type: 'recommendation',
      entity_id: id,
      performed_by: approvedBy,
      details: { status: 'approved' }
    }]);
    
    return data as AgentRecommendation;
  },
  reject: async (id: number, rejectedBy: string, reason: string) => {
    const { data, error } = await supabase.from('agent_recommendations')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select().single();
    if (error) throw error;
    
    await supabase.from('audit_logs').insert([{
      action: 'recommendation_rejected',
      entity_type: 'recommendation',
      entity_id: id,
      performed_by: rejectedBy,
      details: { reason }
    }]);
    
    return data as AgentRecommendation;
  }
};

export const auditApi = {
  list: async () => {
    const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data as AuditLog[];
  }
};

// Start simulation now runs purely on the frontend by executing the TS AI agents
import { runSimulationIteration } from './agents/orchestrator';

export const simulationsApi = {
  list: async () => {
    const { data, error } = await supabase.from('simulation_scenarios').select('*');
    if (error) throw error;
    return data as SimulationScenario[];
  },
  create: async (data: Partial<SimulationScenario>) => {
    const { data: created, error } = await supabase.from('simulation_scenarios').insert([data]).select().single();
    if (error) throw error;
    return created as SimulationScenario;
  },
  start: async (id: number) => {
    const { data: updated, error } = await supabase.from('simulation_scenarios')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) throw error;
    
    // Fire and forget the simulation iteration
    runSimulationIteration(id).catch(console.error);
    
    return updated as SimulationScenario;
  },
  pause: async (id: number) => {
    const { data: updated, error } = await supabase.from('simulation_scenarios')
      .update({ status: 'paused' })
      .eq('id', id).select().single();
    if (error) throw error;
    return updated as SimulationScenario;
  },
  stop: async (id: number) => {
    const { data: updated, error } = await supabase.from('simulation_scenarios')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('id', id).select().single();
    if (error) throw error;
    return updated as SimulationScenario;
  }
};

// Derived from existing data since we no longer have a python backend to aggregate it
export const analyticsApi = {
  summary: async (): Promise<AnalyticsSummary> => {
    const [incidents, shelters, hospitals, responders, drones, sensors, approvals] = await Promise.all([
      supabase.from('incidents').select('*'),
      supabase.from('shelters').select('*'),
      supabase.from('hospitals').select('*'),
      supabase.from('responders').select('*'),
      supabase.from('drones').select('*'),
      supabase.from('iot_sensors').select('*'),
      supabase.from('agent_recommendations').select('*').eq('status', 'pending')
    ]);

    const activeIncidents = (incidents.data || []).filter(i => i.status === 'active');
    const totalAffected = activeIncidents.reduce((sum, inc) => sum + (inc.affected_population || 0), 0);
    const criticalIncidents = activeIncidents.filter(i => i.severity === 'critical').length;
    
    const shelterCapacity = (shelters.data || []).reduce((sum, s) => sum + (s.total_capacity || 0), 0);
    const shelterOccupancy = (shelters.data || []).reduce((sum, s) => sum + (s.current_occupancy || 0), 0);
    const availableShelter = shelterCapacity - shelterOccupancy;
    const shelterPct = shelterCapacity > 0 ? (shelterOccupancy / shelterCapacity) * 100 : 0;
    
    const hospTotal = (hospitals.data || []).reduce((sum, h) => sum + (h.total_beds || 0), 0);
    const hospAvailable = (hospitals.data || []).reduce((sum, h) => sum + (h.available_beds || 0), 0);
    const availableIcu = (hospitals.data || []).reduce((sum, h) => sum + (h.available_icu || 0), 0);
    const hospPct = hospTotal > 0 ? ((hospTotal - hospAvailable) / hospTotal) * 100 : 0;
    
    const totalResp = (responders.data || []).length;
    const activeResp = (responders.data || []).filter(r => r.status === 'deployed').length;
    const availResp = (responders.data || []).filter(r => r.status === 'available').length;
    
    const criticalSensors = (sensors.data || []).filter(s => s.last_reading >= s.threshold_critical).length;
    
    return {
      total_incidents: (incidents.data || []).length,
      active_incidents: activeIncidents.length,
      critical_incidents: criticalIncidents,
      people_affected: totalAffected,
      active_responders: activeResp,
      total_responders: totalResp,
      available_responders: availResp,
      available_vehicles: 12, // Mocked for now, based on resources
      shelter_capacity: shelterCapacity,
      shelter_occupancy: shelterOccupancy,
      shelter_occupancy_pct: shelterPct,
      available_shelter_capacity: availableShelter,
      hospital_beds_total: hospTotal,
      hospital_beds_available: hospAvailable,
      hospital_occupancy_pct: hospPct,
      available_icu_beds: availableIcu,
      active_drones: (drones.data || []).filter(d => d.status === 'airborne').length,
      sensor_critical_alerts: criticalSensors,
      critical_sensors: criticalSensors,
      pending_approvals: (approvals.data || []).length
    };
  }
};
