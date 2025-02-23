
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
  codigo: number;
  nome: string;
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
  complementosTabelados: DatajudMovementComplement[];
  orgaoJulgador: {
    codigoOrgao: number;
    nomeOrgao: string;
  };
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
