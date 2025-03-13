// Add PartyType to be exported here
export type PartyPersonType = "physical" | "legal";

export type PartyType = {
  id: string;
  document: string;
  name: string;
  type: "AUTHOR" | "DEFENDANT" | "MP";
  subtype: string;
  personType: PartyPersonType;
};

// Add other types needed from the process
export interface Movement {
  id: string;
  data: string;
  descricao: string;
  tipo?: string;
  complemento?: string;
  process?: Process;
  index: string;
  score: number;
  rawData?: any;
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
  }>;
  classe?: {
    codigo: number;
    nome: string;
  };
  nivelSigilo?: number;
  grau?: string;
  dataAjuizamento?: string;
  formato?: 'Eletrônico' | 'Físico';
}
