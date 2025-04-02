import { ProcessHit } from '@/types/process';

declare module '@/lib/tjto' {
  export function checkProcessStatus(processNumber: string): Promise<ProcessHit | null>;
} 