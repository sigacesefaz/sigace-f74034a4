
import { DatajudProcess } from "@/types/datajud";

const API_KEY = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

export const courts = {
  SUPERIOR: [
    { id: "tst", name: "Tribunal Superior do Trabalho", type: "SUPERIOR", endpoint: "api_publica_tst" },
    { id: "tse", name: "Tribunal Superior Eleitoral", type: "SUPERIOR", endpoint: "api_publica_tse" },
    { id: "stj", name: "Superior Tribunal de Justiça", type: "SUPERIOR", endpoint: "api_publica_stj" },
    { id: "stm", name: "Superior Tribunal Militar", type: "SUPERIOR", endpoint: "api_publica_stm" }
  ],
  ESTADUAL: [
    { id: "tjto", name: "Tribunal de Justiça do Tocantins", type: "ESTADUAL", endpoint: "api_publica_tjto" },
    // ... outros tribunais estaduais podem ser adicionados conforme necessário
  ]
} as const;

export async function searchProcesses(endpoint: string, searchTerm: string): Promise<DatajudProcess[]> {
  const url = `https://api-publica.datajud.cnj.jus.br/${endpoint}/_search`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${API_KEY}`
      },
      body: JSON.stringify({
        query: {
          multi_match: {
            query: searchTerm,
            fields: ["numeroProcesso", "classe.nome", "assuntos.nome"]
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error('Falha na busca de processos');
    }

    const data = await response.json();
    return data.hits.hits.map((hit: any) => hit._source);
  } catch (error) {
    console.error('Erro ao buscar processos:', error);
    throw error;
  }
}

export async function getProcessById(endpoint: string, processNumber: string): Promise<DatajudProcess | null> {
  try {
    const response = await fetch(`https://api-publica.datajud.cnj.jus.br/${endpoint}/_search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${API_KEY}`
      },
      body: JSON.stringify({
        query: {
          term: {
            numeroProcesso: processNumber
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar processo');
    }

    const data = await response.json();
    return data.hits.hits[0]?._source || null;
  } catch (error) {
    console.error('Erro ao buscar processo:', error);
    throw error;
  }
}
