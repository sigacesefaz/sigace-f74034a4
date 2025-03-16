
export interface ProcessHit {
  id: string;
  process_id: string;
  hit_id: string;
  hit_score: number;
  tribunal: string;
  numero_processo: string;
  data_ajuizamento: string;
  grau: string;
  nivel_sigilo: number;
  formato: any;
  sistema: any;
  classe: any;
  orgao_julgador: any;
  data_hora_ultima_atualizacao: string;
  valor_causa: number;
  situacao: any;
  metadata?: any;
  hit_index?: string;
  _source?: any; // Add support for _source field used in components
}

export interface ProcessUpdateHistory {
  id: string;
  process_id: string | number; // Support both string and number types
  update_type: string;
  update_date: string;
  details?: {
    new_hits?: number;
    previous_status?: string;
    new_status?: string;
  };
  user_id?: string;
}

// Basic Process interface
export interface Process {
  id: string | number;
  number: string;
  title?: string;
  description?: string;
  status?: string;
  court?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  metadata?: any;
  
  // Additional fields used in components
  parent_id?: string | number;
  is_parent?: boolean;
  plaintiff?: string;
  plaintiff_document?: string;
  movimentacoes?: any[];
  hits?: ProcessHit[];
  instance?: string; // Added this field
  lastUpdated?: string; // Added this field
}

// Process Document interface
export interface ProcessDocument {
  id: string;
  process_id: string | number;
  title: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size?: number;
  created_at?: string;
  updated_at?: string;
}

// Party Person Type enum
export enum PartyPersonType {
  PHYSICAL = 'physical',
  LEGAL = 'legal'
}

// Party interface - combining both PartyType and Party to resolve conflicts
export interface Party {
  id: string;
  name: string;
  document?: string;
  type: string;
  subtype?: string;
  personType?: PartyPersonType | string;
  process_id?: string | number;
}

// For backwards compatibility with existing code
export type PartyType = Party;

// Decision interface
export interface Decision {
  id: string;
  process_id: string | number;
  title: string;
  content?: string;
  decision_type?: string;
  judge?: string;
  decision_date?: string;
  attachments?: any[];
  created_at?: string;
  updated_at?: string;
}

// Process Notification interface
export interface ProcessNotification {
  id: string;
  process_id: string | number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}
