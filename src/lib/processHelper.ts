import { Process } from "@/types/process";

// Declare type for CourtInstance to fix the type issue
export type CourtInstance = string;

// Extend Process interface to include instance property
export interface ProcessWithInstance extends Process {
  instance: CourtInstance;
}

export function extractProcessNumber(text: string): string | null {
  const regex = /(\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4})/;
  const match = text.match(regex);
  return match ? match[1] : null;
}
export function getProcessInstance(process: Process): CourtInstance {
  // Safe type check for instance property 
  const instanceProperty = (process as any).instance;
  return instanceProperty || "PRIMEIRA_INSTANCIA";
}

export function getProcessParties(process: Process): string[] {
  // Safe type check for parties property
  const partiesProperty = (process as any).parties;

  if (!partiesProperty || !Array.isArray(partiesProperty)) {
    return [];
  }

  return partiesProperty.map((party: any) => party.name);
}
