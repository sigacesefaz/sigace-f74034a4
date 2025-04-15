// Add PartyType to be exported here
export type PartyPersonType = "physical" | "legal";

export type PartyType = {
  id: string;
  document: string;
  name: string;
  type: "autor" | "réu" | "terceiro" | "terceiro-prejudicado" | "advogado" | "assistente" | "perito" | "testemunha" | "mpe-to" | "pge-to";
  subtype: string;
  personType: PartyPersonType;
  process_id?: string;
  created_at?: string;
  updated_at?: string;
};

// Adicionando a interface Document, renomeada para ProcessDocument para evitar conflito com o tipo DOM Document
export interface ProcessDocument {
  id: string;
  title: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at?: string;
  process_id: string;
  hit_id: string | null;
}

// Adicionando a interface Decision
export interface Decision {
  id: string;
  title: string;
  content: string; // Changed from description to content to match DB schema
  decision_type: string;
  judge?: string; // Campo judge sempre opcional
  decision_date: string;
  created_at: string;
  updated_at?: string;
  process_id: string;
  hit_id?: string;
}

// Add other types needed from the process
export interface Movement {
  id: string;
  data: string;
  descricao: string;
  tipo?: string;
  complemento?: string;
  codigo?: string; // Add this property that's being used in ProcessList.tsx
  process?: Process;
  index: string;
  score: number;
  rawData?: any;
  nome?: string; // Add the nome property that's being used
  data_hora?: string; // Add the data_hora property that's being used
}

export interface ProcessMovement {
  data: string;
  descricao: string;
}

export interface ProcessStatus {
  nome: string;
  data?: string;
}

export interface ProcessHit {
  hit_id: string;
  hit_score?: number;
  data?: any;
  situacao: { nome: string; codigo?: number };
  movimentos?: {
    id: string;
    process_id: number;
    nome: string;
    data_hora: string;
    codigo?: number;
    tipo?: string;
    complemento?: string;
  }[];
  [key: string]: any;
}

export interface ScheduleConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'custom';
  time?: string;
  dayOfWeek?: number;
  interval?: number;
  lastCheck?: string;
  nextCheck?: string;
  days?: number[];
}

export interface Process {
  id: string;
  number: string;
  title: string;
  description?: string;
  status: string;
  last_movement?: string;
  movements?: { data: string; descricao: string }[];
  created_at: string;
  updated_at: string;
  last_check?: string;
  user_id: string;
  schedule_config?: ScheduleConfig;
  [key: string]: any;
}

export interface ProcessNotification {
  id: string;
  title: string;
  message: string;
  type: "update" | "deadline" | "document" | "hearing";
  process_id?: string;
  user_id: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProcessMetadata {
  sistema?: {
    codigo: number;
    nome: string;
  };
  orgaoJulgador?: {
    codigo: number;
    nome: string;
    codigoMunicipioIBGE?: number;
  };
  assuntos?: Array<{
    codigo: number;
    nome: string;
    principal?: boolean;
  }>;
  classe?: {
    codigo: number;
    nome: string;
  };
  nivelSigilo?: number;
  grau?: string;
  dataAjuizamento?: string;
  formato?: 'Eletrônico' | 'Físico';
  partes?: Array<{
    papel: string;
    nome: string;
    tipoPessoa: string;
    documento?: string;
    advogados?: Array<{
      nome: string;
      inscricao: string;
    }>;
  }>;
  movimentos?: Array<{
    id: string;
    data: string;
    descricao: string;
  }>;
  intimacoes?: Array<{
    id: string;
    data: string;
    descricao: string;
  }>;
  documentos?: Array<{
    id: string;
    data: string;
    descricao: string;
    tipo: string;
  }>;
  decisoes?: Array<{
    id: string;
    data: string;
    descricao: string;
  }>;
}
