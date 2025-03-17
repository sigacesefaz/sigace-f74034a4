
import { DatajudProcess, DatajudProcessSource, DatajudMovimentoProcessual } from "@/types/datajud";

// Convert API source to DatajudProcess model
export const mapSourceToProcess = (source: DatajudProcessSource, id: string): DatajudProcess => {
  return {
    id,
    tribunal: source.tribunal,
    numeroProcesso: source.numeroProcesso,
    dataAjuizamento: source.dataAjuizamento,
    grau: source.grau,
    nivelSigilo: source.nivelSigilo || 0,
    formato: source.formato,
    sistema: source.sistema,
    classe: source.classe,
    assuntos: source.assuntos || [],
    orgaoJulgador: source.orgaoJulgador || { codigo: 0, nome: "Não informado" },
    movimentos: source.movimentos || [],
    dataHoraUltimaAtualizacao: source.dataHoraUltimaAtualizacao,
    partes: source.partes || [],
    valorCausa: source.valorCausa,
    situacao: source.situacao
  };
};

// Convert complete hit to DatajudMovimentoProcessual model
export const mapHitToDatajudMovimentoProcessual = (hit: any): DatajudMovimentoProcessual => {
  return {
    id: hit._id,
    index: hit._index,
    score: hit._score,
    process: mapSourceToProcess(hit._source, hit._id),
    rawData: hit
  };
};

// Helper para formatação do número do processo
export const formatProcessNumberForQuery = (processNumber: string): string => {
  const cleanNumber = processNumber.replace(/\D/g, '');
  return cleanNumber;
};
