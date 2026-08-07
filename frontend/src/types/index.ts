export type Role = 
  | 'administrator'
  | 'incident_commander'
  | 'medical_coordinator'
  | 'logistics_manager'
  | 'field_responder'
  | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
