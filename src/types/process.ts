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
}

export interface ProcessUpdateHistory {
  id: string;
  process_id: string;
  update_type: string;
  update_date: string;
  details?: {
    new_hits?: number;
    previous_status?: string;
    new_status?: string;
  };
  user_id?: string;
}
