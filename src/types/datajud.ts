export interface DatajudFormat {
  codigo: number;
  nome: string;
}

export interface DatajudSystem {
  codigo: number;
  nome: string;
}

export interface DatajudClass {
  codigo: number;
  nome: string;
}

export interface DatajudSubject {
  codigo: string;
  nome: string;
  principal?: boolean;
}

export interface DatajudCourt {
  codigo: number;
  nome: string;
  codigoMunicipioIBGE?: number;
}

export interface DatajudMovementComplement {
  codigo: number;
  descricao: string;
  valor: number;
  nome: string;
}

export interface DatajudMovement {
  codigo: number;
  nome: string;
  dataHora: string;
  complementosTabelados?: DatajudMovementComplement[]; 
  orgaoJulgador?: {
    codigoOrgao: number;
    nomeOrgao: string;
  };
  tipo?: string;
  complemento?: string | string[];
}

export interface DatajudParty {
  papel: string;
  nome: string;
  tipoPessoa: string;
  documento?: string;
  advogados?: {
    nome: string;
    inscricao: string;
  }[];
}

export interface DatajudProcess {
  id: string;
  tribunal: string;
  numeroProcesso: string;
  dataAjuizamento: string;
  grau: string;
  nivelSigilo: number;
  formato: DatajudFormat;
  sistema: DatajudSystem;
  classe: DatajudClass;
  assuntos: DatajudSubject[];
  orgaoJulgador: DatajudCourt;
  movimentos: DatajudMovement[];
  dataHoraUltimaAtualizacao: string;
  partes?: DatajudParty[];
  valorCausa?: number;
  situacao?: {
    codigo?: number;
    nome?: string;
  };
}

// Add DatajudHit interface to fix missing type errors
export interface DatajudHit {
  _id: string;
  _index: string;
  _score: number;
  _source: DatajudProcessSource;
  process: DatajudProcess;
}

export interface DatajudMovimentoProcessual {
  id: string;
  index: string;
  score: number;
  process: DatajudProcess;
  rawData: any; // Raw hit data for additional information if needed
}

export type CourtType = 
  | "SUPERIOR" 
  | "FEDERAL" 
  | "ESTADUAL" 
  | "TRABALHISTA" 
  | "ELEITORAL" 
  | "MILITAR";

export interface Court {
  id: string;
  name: string;
  type: CourtType;
  endpoint: string;
}

export interface DatajudIntimation {
  id: string;
  tribunal: string;
  numeroIntimacao: string;
  dataIntimacao: string;
  tipo: string;
  partes: DatajudParty[];
  observacoes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  recipient?: string;
  location?: string;
  titulo?: string;
  descricao?: string;
  prazo?: string | Date;
}

export interface DatajudAPIResponse {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {
      value: number;
      relation: string;
    };
    max_score: number;
    hits: Array<{
      _index: string;
      _id: string;
      _score: number;
      _source: DatajudProcessSource;
    }>;
  };
}

export interface DatajudProcessSource {
  classe: {
    codigo: number;
    nome: string;
  };
  numeroProcesso: string;
  sistema: {
    codigo: number;
    nome: string;
  };
  formato: {
    codigo: number;
    nome: string;
  };
  tribunal: string;
  dataHoraUltimaAtualizacao: string;
  grau: string;
  "@timestamp": string;
  dataAjuizamento: string;
  assuntos?: Array<{
    codigo: number;
    nome: string;
  }>;
  orgaoJulgador?: {
    codigo: number;
    nome: string;
    codigoMunicipioIBGE?: number;
  };
  movimentos: Array<{
    complementosTabelados?: Array<{
      codigo: number;
      valor: number;
      nome: string;
      descricao: string;
    }>;
    codigo: number;
    nome: string;
    dataHora: string;
  }>;
  partes?: DatajudParty[];
  valorCausa?: number;
  nivelSigilo?: number;
  situacao?: {
    codigo?: number;
    nome?: string;
  };
}

export interface SimpleProcess {
  id: string;
  number: string;
  title: string;
  description?: string;
  status: string;
  court?: string;
  type?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  plaintiff?: string;
  plaintiff_document?: string;
  tribunal?: string;
  formato?: {
    codigo: number;
    nome: string;
  };
  partes?: DatajudParty[];
  dataHoraUltimaAtualizacao?: string;
  instance?: string;
  is_parent: boolean;
  parent_id?: string | null;
  metadata?: {
    sistema?: {
      codigo: number;
      nome: string;
    };
    orgaoJulgador?: {
      codigo: number;
      nome: string;
      codigoMunicipioIBGE?: number;
    };
    nivelSigilo?: number;
    grau?: string;
    dataAjuizamento?: string;
  };
  hits?: DatajudHit[];
  movimentacoes?: DatajudMovimentoProcessual[];
}

export interface IntimationFormProps {
  onSubmit: (formData: any) => Promise<void>;
  onBack: () => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
