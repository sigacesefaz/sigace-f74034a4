
import { Court, CourtType, DatajudProcess, DatajudAPIResponse, DatajudProcessSource, DatajudIntimation, DatajudMovimentoProcessual } from "@/types/datajud";
import { supabase } from "@/lib/supabase";

export const courts: Record<CourtType, Court[]> = {
  SUPERIOR: [
    {
      id: "stf",
      name: "Supremo Tribunal Federal",
      type: "SUPERIOR",
      endpoint: "stf",
    },
    {
      id: "stj",
      name: "Superior Tribunal de Justiça",
      type: "SUPERIOR",
      endpoint: "stj",
    },
    {
      id: "tst",
      name: "Tribunal Superior do Trabalho",
      type: "SUPERIOR",
      endpoint: "tst",
    },
    {
      id: "tse",
      name: "Tribunal Superior Eleitoral",
      type: "SUPERIOR",
      endpoint: "tse",
    },
    {
      id: "stm",
      name: "Superior Tribunal Militar",
      type: "SUPERIOR",
      endpoint: "stm",
    },
  ],
  FEDERAL: [
    {
      id: "trf1",
      name: "Tribunal Regional Federal da 1ª Região",
      type: "FEDERAL",
      endpoint: "trf1",
    },
    {
      id: "trf2",
      name: "Tribunal Regional Federal da 2ª Região",
      type: "FEDERAL",
      endpoint: "trf2",
    },
    {
      id: "trf3",
      name: "Tribunal Regional Federal da 3ª Região",
      type: "FEDERAL",
      endpoint: "trf3",
    },
    {
      id: "trf4",
      name: "Tribunal Regional Federal da 4ª Região",
      type: "FEDERAL",
      endpoint: "trf4",
    },
    {
      id: "trf5",
      name: "Tribunal Regional Federal da 5ª Região",
      type: "FEDERAL",
      endpoint: "trf5",
    },
    {
      id: "trf6",
      name: "Tribunal Regional Federal da 6ª Região",
      type: "FEDERAL",
      endpoint: "trf6",
    },
  ],
  ESTADUAL: [
    {
      id: "tjto",
      name: "Tribunal de Justiça do Tocantins",
      type: "ESTADUAL",
      endpoint: "tjto",
    },
  ],
  TRABALHISTA: [],
  ELEITORAL: [],
  MILITAR: [],
};

// Convert API source to DatajudProcess model
const mapSourceToProcess = (source: DatajudProcessSource, id: string): DatajudProcess => {
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
const mapHitToDatajudMovimentoProcessual = (hit: any): DatajudMovimentoProcessual => {
  return {
    id: hit._id,
    index: hit._index,
    score: hit._score,
    process: mapSourceToProcess(hit._source, hit._id),
    rawData: hit
  };
};

// Helper para formatação do número do processo
const formatProcessNumberForQuery = (processNumber: string): string => {
  // Remove qualquer formatação existente (pontos, traços, espaços)
  const cleanNumber = processNumber.replace(/\D/g, '');
  return cleanNumber;
};

export async function getProcessById(courtEndpoint: string, processNumber: string): Promise<DatajudMovimentoProcessual[] | null> {
  try {
    console.log(`Buscando processo ${processNumber} no tribunal ${courtEndpoint}`);
    
    // Formatar o número do processo para a consulta
    const formattedNumber = formatProcessNumberForQuery(processNumber);
    
    // Construct a specific query for exact process number match using match
    const requestBody = {
      endpoint: courtEndpoint,
      query: {
        match: {
          "numeroProcesso": formattedNumber
        }
      },
      size: 10 // Aumentar tamanho para buscar mais movimentos processuais relacionados
    };
    
    console.log("Request body:", JSON.stringify(requestBody, null, 2));
    
    // Usar a URL completa da função edge
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/datajud-proxy`;
    console.log("Usando a URL da função edge:", functionUrl);
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching process: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data: DatajudAPIResponse = await response.json();
    console.log("API Response:", data);
    
    if (!data.hits || !data.hits.hits || data.hits.hits.length === 0) {
      console.log("No process found with the given number");
      return null;
    }
    
    // Mapear todos os movimentos processuais encontrados
    const movimentosProcessuais = data.hits.hits.map(hit => mapHitToDatajudMovimentoProcessual(hit));
    
    console.log("Processed data:", movimentosProcessuais);
    return movimentosProcessuais;
    
  } catch (error) {
    console.error("Error fetching process:", error);
    throw error;
  }
}

export async function searchProcesses(courtEndpoint: string, processNumber: string): Promise<DatajudMovimentoProcessual[]> {
  try {
    console.log(`Buscando processos com número ${processNumber} no tribunal ${courtEndpoint}`);
    
    // Remover qualquer formatação do número do processo (pontos, traços, espaços)
    const formattedNumber = formatProcessNumberForQuery(processNumber);
    
    // Construct a query for exact match on the process number
    const requestBody = {
      endpoint: courtEndpoint,
      query: {
        term: {
          "numeroProcesso.keyword": formattedNumber
        }
      },
      size: 10  // Aumentar tamanho para buscar mais movimentos processuais relacionados
    };
    
    console.log("Search request body:", JSON.stringify(requestBody, null, 2));
    
    // Usar a URL completa da função edge
    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/datajud-proxy`;
    console.log("Usando a URL da função edge:", functionUrl);
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error searching processes: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const data: DatajudAPIResponse = await response.json();
    console.log("Search API Response:", data);
    
    if (!data.hits || !data.hits.hits || data.hits.hits.length === 0) {
      console.log("No processes found with the given criteria");
      return [];
    }
    
    // Mapear todos os movimentos processuais encontrados
    const movimentosProcessuais = data.hits.hits.map(hit => mapHitToDatajudMovimentoProcessual(hit));
    
    console.log("Search results:", movimentosProcessuais);
    return movimentosProcessuais;
    
  } catch (error) {
    console.error("Error searching processes:", error);
    return [];
  }
}

// The getIntimationById function remains unchanged
export async function getIntimationById(courtEndpoint: string, intimationNumber: string): Promise<DatajudIntimation | null> {
  try {
    console.log(`Getting intimation with number ${intimationNumber} from court ${courtEndpoint}`);
    
    // Mock response for testing
    return {
      id: crypto.randomUUID(),
      tribunal: "TJTO",
      numeroIntimacao: intimationNumber,
      dataIntimacao: new Date().toISOString(),
      tipo: "CITAÇÃO",
      partes: [
        {
          papel: "AUTOR",
          nome: "Estado do Tocantins",
          tipoPessoa: "JURIDICA",
          documento: "01.786.029/0001-03"
        },
        {
          papel: "RÉU",
          nome: "Contribuinte XYZ",
          tipoPessoa: "FISICA",
          documento: "123.456.789-00"
        }
      ],
      observacoes: "Intimação para pagamento de débito fiscal",
      status: "PENDENTE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      recipient: "Procuradoria do Estado",
      location: "Palmas - TO"
    };
    
  } catch (error) {
    console.error("Error fetching intimation:", error);
    return null;
  }
}
