
import { DatajudProcess } from "@/types/datajud";

const API_KEY = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

export const courts = {
  SUPERIOR: [
    { id: "tst", name: "Tribunal Superior do Trabalho", type: "SUPERIOR", endpoint: "api_publica_tst" },
    { id: "tse", name: "Tribunal Superior Eleitoral", type: "SUPERIOR", endpoint: "api_publica_tse" },
    { id: "stj", name: "Superior Tribunal de Justiça", type: "SUPERIOR", endpoint: "api_publica_stj" },
    { id: "stm", name: "Superior Tribunal Militar", type: "SUPERIOR", endpoint: "api_publica_stm" }
  ],
  FEDERAL: [
    { id: "trf1", name: "TRF 1ª Região", type: "FEDERAL", endpoint: "api_publica_trf1" },
    { id: "trf2", name: "TRF 2ª Região", type: "FEDERAL", endpoint: "api_publica_trf2" },
    { id: "trf3", name: "TRF 3ª Região", type: "FEDERAL", endpoint: "api_publica_trf3" },
    { id: "trf4", name: "TRF 4ª Região", type: "FEDERAL", endpoint: "api_publica_trf4" },
    { id: "trf5", name: "TRF 5ª Região", type: "FEDERAL", endpoint: "api_publica_trf5" },
    { id: "trf6", name: "TRF 6ª Região", type: "FEDERAL", endpoint: "api_publica_trf6" }
  ],
  ESTADUAL: [
    { id: "tjto", name: "Tribunal de Justiça do Tocantins", type: "ESTADUAL", endpoint: "api_publica_tjto" },
    { id: "tjsp", name: "Tribunal de Justiça de São Paulo", type: "ESTADUAL", endpoint: "api_publica_tjsp" },
    { id: "tjrj", name: "Tribunal de Justiça do Rio de Janeiro", type: "ESTADUAL", endpoint: "api_publica_tjrj" }
  ],
  TRABALHISTA: [
    { id: "trt1", name: "TRT 1ª Região", type: "TRABALHISTA", endpoint: "api_publica_trt1" },
    { id: "trt2", name: "TRT 2ª Região", type: "TRABALHISTA", endpoint: "api_publica_trt2" },
    { id: "trt3", name: "TRT 3ª Região", type: "TRABALHISTA", endpoint: "api_publica_trt3" }
  ],
  ELEITORAL: [
    { id: "tre_sp", name: "TRE São Paulo", type: "ELEITORAL", endpoint: "api_publica_tre_sp" },
    { id: "tre_rj", name: "TRE Rio de Janeiro", type: "ELEITORAL", endpoint: "api_publica_tre_rj" },
    { id: "tre_mg", name: "TRE Minas Gerais", type: "ELEITORAL", endpoint: "api_publica_tre_mg" }
  ],
  MILITAR: [
    { id: "stm", name: "Superior Tribunal Militar", type: "MILITAR", endpoint: "api_publica_stm" },
    { id: "tmsp", name: "Tribunal Militar de São Paulo", type: "MILITAR", endpoint: "api_publica_tmsp" }
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
