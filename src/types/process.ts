
export interface ProcessHit {
  id: string;
  process_id: string | number;
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
  _source?: any;
}

export interface ProcessUpdateHistory {
  id: string;
  process_id: string | number;
  update_type: string;
  update_date: string;
  details?: {
    new_hits?: number;
    previous_status?: string;
    new_status?: string;
  } | any;
  user_id?: string;
}

// Adding additional types needed for ProcessList and ProcessCard components
export interface Process {
  id: string;
  number: string;
  title?: string;
  description?: string;
  status?: string;
  court?: string;
  created_at: string;
  updated_at?: string;
  metadata?: any;
  hits?: ProcessHit[];
  movimentacoes?: any[];
  is_parent?: boolean;
  parent_id?: string | number | null;
  instance?: string;
}

export interface PartyType {
  id?: string;
  process_id: string | number;
  name?: string;
  document?: string;
  type?: string;
  subtype?: string;
  personType?: string;
}

export type Party = PartyType;

export type PartyPersonType = "physical" | "legal";
