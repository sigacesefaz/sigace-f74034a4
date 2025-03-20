declare module '@/types/process' {
  export interface ProcessMovement {
    data: string;
    descricao: string;
  }

  export interface ProcessStatus {
    nome: string;
    data?: string;
  }

  export interface ProcessHit {
    hit_id: string;
    numero: string;
    situacao: ProcessStatus;
    movimentos?: ProcessMovement[];
  }

  export interface ScheduleConfig {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'custom';
    time?: string; // HH:mm format for daily
    dayOfWeek?: number; // 0-6 for weekly
    interval?: number; // minutes for custom
    lastCheck?: string;
    nextCheck?: string;
  }

  export interface Process {
    id: string;
    number: string;
    title: string;
    description?: string;
    status: string;
    last_movement?: string;
    movements?: ProcessMovement[];
    created_at: string;
    updated_at: string;
    last_check?: string;
    user_id: string;
    schedule_config?: ScheduleConfig;
  }

  export interface ProcessNotification {
    id: string;
    process_id: string;
    type: string;
    message: string;
    read: boolean;
    created_at: string;
    user_id: string;
  }

  export interface ProcessSubject {
    id: string;
    process_id: string;
    name: string;
    code: string;
    is_main: boolean;
    created_at: string;
    updated_at: string;
  }

  export interface ProcessDetail {
    id: string;
    process_id: string;
    court: string;
    filing_date: string;
    degree: string;
    secrecy_level: number;
    format: any;
    system: any;
    class: any;
    judging_body: any;
    last_update: string;
    cause_value: number;
    created_at: string;
    updated_at: string;
  }

  export interface ProcessUpdateHistory {
    id: string;
    process_id: string;
    old_status: string;
    new_status: string;
    update_date: string;
  }

  export type PartyPersonType = "physical" | "legal" | "other";
}
