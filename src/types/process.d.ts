
export interface Process {
  id: string;
  number: string;
  title: string;
  description?: string;
  status: string;
  court?: string;
  instance?: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
  hits?: any[];
  is_parent?: boolean;
  parent_id?: string;
  movimentacoes?: any[];
  lastUpdated?: string;
}

export interface PartyType {
  id: string;
  name: string;
  document?: string;
  type: string;
  subtype?: string;
  personType?: string;
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  decision_type: string;
  judge: string;
  decision_date: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
}

export interface SystemConfiguration {
  id: string;
  update_processes_day: number;
  email_monthly_limit: number;
  google_auth_client_id?: string;
  google_auth_client_secret?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailTracking {
  id: string;
  month: number;
  year: number;
  count: number;
  updated_at: string;
}

export interface ProcessUpdateHistory {
  id: string;
  process_id: string;
  update_date: string;
  update_type: string;
  previous_status?: string;
  new_status?: string;
  details?: any;
  user_id?: string;
  created_at: string;
}
