export interface Process {
  id: string | number;
  number: string;
  title?: string;
  description?: string;
  status?: string;
  court?: string;
  plaintiff?: string;
  plaintiff_document?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  parent_id?: string | number | null;
  is_parent?: boolean;
  metadata?: any;
  hits?: ProcessHit[];
  movimentacoes?: ProcessMovement[];
}

export interface ProcessMovement {
  id: string;
  process_id?: string;
  hit_id?: string;
  codigo?: number;
  nome?: string;
  data_hora?: string;
  tipo?: string;
  complemento?: string;
  complementos_tabelados?: any[];
  orgao_julgador?: any;
  user_id?: string;
  created_at?: string;
}

export interface ProcessSubject {
  id: string;
  process_id?: string;
  hit_id?: string;
  codigo?: number;
  nome?: string;
  principal?: boolean;
  user_id?: string;
  created_at?: string;
}

export interface ProcessParty {
  id: string;
  process_id?: string;
  name: string;
  type: string;
  person_type?: string;
  document?: string;
  subtype?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProcessHit {
  id: string;
  process_id?: string;
  hit_id?: string;
  hit_score?: number;
  tribunal?: string;
  numero_processo?: string;
  data_ajuizamento?: string;
  grau?: string;
  nivel_sigilo?: number;
  formato?: any;
  sistema?: any;
  classe?: any;
  orgao_julgador?: any;
  data_hora_ultima_atualizacao?: string;
  valor_causa?: number;
  situacao?: any;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  movimentos?: any[];
}

export interface ProcessDetail {
  id: string;
  process_id?: string;
  tribunal?: string;
  data_ajuizamento?: string;
  grau?: string;
  nivel_sigilo?: number;
  formato?: any;
  sistema?: any;
  classe?: any;
  assuntos?: any[];
  movimentos?: any[];
  partes?: any[];
  data_hora_ultima_atualizacao?: string;
  json_completo?: any;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProcessDocument {
  id: string;
  process_id?: string;
  hit_id?: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  title: string;
  created_at?: string;
  updated_at?: string;
}

export interface Decision {
  id: string;
  process_id?: string;
  hit_id?: string;
  decision_type?: string;
  decision_date?: string;
  judge?: string;
  content?: string;
  attachments?: any[];
  title: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProcessNotification {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  read?: boolean;
  process_id?: string;
  user_id?: string;
}

export interface ProcessUpdateHistory {
  id: string;
  process_id: string | number;
  update_type: string;
  previous_status?: string;
  new_status?: string;
  details?: any;
  user_id?: string;
  created_at?: string;
  update_date?: string;
}

export type PartyPersonType = "physical" | "legal" | "other";
