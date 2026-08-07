import { supabase } from '../supabase';

export async function runSimulationIteration(scenarioId: number) {
  try {
    const { data: scenario, error } = await supabase
      .from('simulation_scenarios')
      .select('*')
      .eq('id', scenarioId)
      .single();

    if (error || !scenario) return;

    // Simulate agent processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Gather context
    const [incidentsRes, sheltersRes, hospitalsRes, dronesRes] = await Promise.all([
      supabase.from('incidents').select('*'),
      supabase.from('shelters').select('*'),
      supabase.from('hospitals').select('*'),
      supabase.from('drones').select('*')
    ]);

    const incidents = incidentsRes.data || [];
    const activeIncidents = incidents.filter(i => i.status === 'active');
    
    if (activeIncidents.length === 0) return;
    
    const targetIncident = activeIncidents[0]; // Process the first active incident for simulation

    // Run Agents
    const recommendations = [];

    // 1. Evacuation Agent
    if (scenario.scenario_type === 'flood' || scenario.scenario_type === 'cyclone') {
      const shelters = sheltersRes.data || [];
      const totalCapacity = shelters.reduce((sum, s) => sum + (s.total_capacity - s.current_occupancy), 0);
      const affected = scenario.parameters?.affected_population || targetIncident.affected_population;
      
      let confidence = 0.85;
      let riskLevel = 'medium';
      if (affected > totalCapacity) {
        riskLevel = 'critical';
        confidence = 0.95;
      }
      
      recommendations.push({
        agent_name: 'Evacuation Agent',
        incident_id: targetIncident.id,
        recommendation: `Initiate mass evacuation for ${affected} people. Available shelter capacity is ${totalCapacity}. ${affected > totalCapacity ? 'WARNING: Capacity exceeded. Requesting neighboring district support.' : ''}`,
        reasoning: 'Calculated based on simulated sensor data and current shelter capacities.',
        confidence,
        risk_level: riskLevel,
        data_used: { affected_population: affected, available_capacity: totalCapacity },
        requires_human_approval: true
      });
    }

    // 2. Medical Triage Agent
    if (scenario.scenario_type === 'earthquake' || scenario.scenario_type === 'chemical_leak') {
      const hospitals = hospitalsRes.data || [];
      const totalIcu = hospitals.reduce((sum, h) => sum + h.available_icu, 0);
      const estimatedCasualties = scenario.parameters?.affected_population ? Math.floor(scenario.parameters.affected_population * 0.05) : 50;
      
      recommendations.push({
        agent_name: 'Medical Triage Agent',
        incident_id: targetIncident.id,
        recommendation: `Deploy 3 trauma teams to ${targetIncident.location_name}. Estimated ${estimatedCasualties} critical casualties. ${totalIcu} ICU beds available system-wide.`,
        reasoning: 'Trauma risk model indicates high casualty rate for this scenario severity.',
        confidence: 0.92,
        risk_level: 'high',
        data_used: { estimated_casualties: estimatedCasualties, available_icu: totalIcu },
        requires_human_approval: true
      });
    }

    // 3. Drone Routing Agent
    const drones = dronesRes.data || [];
    const availableDrones = drones.filter(d => d.status === 'standby');
    if (availableDrones.length > 0) {
      const drone = availableDrones[0];
      recommendations.push({
        agent_name: 'Drone Routing Agent',
        incident_id: targetIncident.id,
        recommendation: `Deploy Drone ${drone.drone_id} to coordinate coordinates ${targetIncident.latitude}, ${targetIncident.longitude} for aerial reconnaissance.`,
        reasoning: 'No aerial visual data available for this sector. Drone is fully charged and within 5km radius.',
        confidence: 0.99,
        risk_level: 'low',
        data_used: { drone_id: drone.drone_id, battery: drone.battery_level },
        requires_human_approval: false
      });
    }

    // Save recommendations to Supabase
    if (recommendations.length > 0) {
      await supabase.from('agent_recommendations').insert(recommendations);
    }

    // Complete simulation
    await supabase.from('simulation_scenarios').update({ status: 'completed', ended_at: new Date().toISOString() }).eq('id', scenarioId);
    
  } catch (error) {
    console.error("Simulation error:", error);
  }
}
