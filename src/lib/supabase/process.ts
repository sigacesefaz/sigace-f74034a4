import { ProcessHit } from '@/types/process';

export async function checkProcessStatus(processNumber: string): Promise<ProcessHit | null> {
  try {
    // Implementação existente...
    return {
      hit_index: "1",
      hit_id: "unique_hit_id",
      hit_score: 1,
      tribunal: "TJTO",
      numero_processo: processNumber,
      data_ajuizamento: new Date().toISOString(),
      grau: "1",
      nivel_sigilo: 0,
      formato: { nome: "Eletrônico", codigo: 1 },
      sistema: { nome: "PJe", codigo: 1 },
      classe: { nome: "Mandado de Segurança", codigo: 120 },
      orgao_julgador: { nome: "1ª Vara", codigo: 1 },
      data_hora_ultima_atualizacao: new Date().toISOString(),
      valor_causa: 1000.00,
      situacao: { nome: "Em andamento", codigo: 1 },
      movimentos: [],
      assuntos: []
    };
  } catch (error) {
    console.error('Erro ao verificar status do processo:', error);
    return null;
  }
} 