
import { DatajudMovimentoProcessual } from "@/types/datajud";
import { callDatajudApi } from "./datajudApi";
import { mapHitToDatajudMovimentoProcessual } from "./datajudTransformers";
import { courts } from "./courts";

export { courts } from "./courts";
export { getIntimationById } from "./intimationService";

export async function getProcessById(courtEndpoint: string, processNumber: string): Promise<DatajudMovimentoProcessual[] | null> {
  try {
    console.log(`Buscando processo ${processNumber} no tribunal ${courtEndpoint}`);
    
    const data = await callDatajudApi(courtEndpoint, processNumber);
    console.log("API Response:", data);
    
    if (!data.hits || !data.hits.hits || data.hits.hits.length === 0) {
      console.log("No process found with the given number");
      return null;
    }
    
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
    
    const data = await callDatajudApi(courtEndpoint, processNumber);
    console.log("Search API Response:", data);
    
    if (!data.hits || !data.hits.hits || data.hits.hits.length === 0) {
      console.log("No processes found with the given criteria");
      return [];
    }
    
    const movimentosProcessuais = data.hits.hits.map(hit => mapHitToDatajudMovimentoProcessual(hit));
    
    console.log("Search results:", movimentosProcessuais);
    return movimentosProcessuais;
    
  } catch (error) {
    console.error("Error searching processes:", error);
    return [];
  }
}
