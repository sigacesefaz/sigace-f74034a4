export interface ProcessMovement {
  id: string;
  process_id: number;
  hit_id?: string;
  codigo?: number;
  nome: string;
  data_hora: string;
  tipo?: string;
  complemento?: string;
  complementos_tabelados?: any[];
  orgao_julgador?: Record<string, any>;
  json_completo?: Record<string, any>;
}

export interface ProcessMovementDocument {
  id: string;
  movement_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface ProcessMovementWithDocuments extends ProcessMovement {
  documents: ProcessMovementDocument[];
  documents_count: number;
}

export interface MovementFilter {
  startDate?: Date;
  endDate?: Date;
  text?: string;
  codes?: number[];
  ascending?: boolean;
} 