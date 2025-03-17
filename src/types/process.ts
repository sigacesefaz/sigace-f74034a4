// Add PartyType to be exported here
export type PartyPersonType = "physical" | "legal";

export type PartyType = {
  id: string;
  document: string;
  name: string;
  type: "autor" | "réu" | "terceiro" | "advogado" | "assistente" | "perito" | "AUTHOR" | "DEFENDANT" | "MP";
  subtype: string;
  personType: PartyPersonType;
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
  hit_id?: string;
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

export interface ProcessHit {
  id: string;
  hit_index?: string;
  hit_id?: string;
  hit_score?: number;
  tribunal?: string;
  numero_processo?: string;
  data_ajuizamento?: string;
  grau?: string;
  nivel_sigilo?: number;
  formato?: any;
  sistema?: any;
  classe?: {
    nome?: string;
    codigo?: string;
  };
  orgao_julgador?: {
    nome?: string;
    codigo?: string;
  };
  data_hora_ultima_atualizacao?: string;
  valor_causa?: number;
  situacao?: any;
  created_at?: string;
  updated_at?: string;
  status?: string;
  assuntos?: Array<{
    codigo?: string | number;
    nome: string;
  }>;
  movimentos?: Array<{
    codigo: number;
    nome: string;
    data_hora?: string;
    tipo?: string;
    complemento?: string;
  }>;
}

export interface Process {
  id: string;
  number: string;
  court: string;
  title?: string;
  status?: string;
  description?: string;
  is_parent?: boolean;
  parent_id?: string;
  metadata: ProcessMetadata;
  movimentacoes?: Movement[];
  created_at: string;
  updated_at: string;
  dataHoraUltimaAtualizacao?: string;
  plaintiff?: string; // Add the plaintiff property that's being used
  hits?: ProcessHit[]; // Atualizado para usar o tipo ProcessHit
}

// Add ProcessNotification type to fix notification error
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
