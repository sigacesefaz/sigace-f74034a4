import { ProcessHit } from '@/types/process';

export async function checkProcessStatus(processNumber: string): Promise<ProcessHit | null> {
  try {
    const response = await fetch(`${process.env.VITE_API_URL}/api/process/${processNumber}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data as ProcessHit;
  } catch (error) {
    console.error('Erro ao verificar status do processo:', error);
    return null;
  }
} 