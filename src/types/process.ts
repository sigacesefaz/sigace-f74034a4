
export type ProcessStatus = "active" | "pending" | "closed";
export type ProcessType = "liminar" | "recurso" | "outros";
export type CourtInstance = "primeira" | "segunda" | "superior" | "supremo";

export interface Process {
  id: string;
  number: string;
  title: string;
  status: ProcessStatus;
  type: ProcessType;
  instance: CourtInstance;
  value: number;
  description: string;
  created_at: string;
  updated_at: string;
  plaintiff: string;
  plaintiff_document: string;
  defendant: string;
  defendant_document: string;
  judge: string;
  court: string;
  tags: string[];
  attachments: string[];
}

export interface ProcessParty {
  id: string;
  name: string;
  document: string;
  type: "physical" | "legal" | "public";
  role: string;
  contact_email: string;
  contact_phone: string;
}

export interface ProcessNotification {
  id: string;
  process_id: string;
  title: string;
  message: string;
  type: "deadline" | "update" | "document" | "hearing";
  created_at: string;
  read: boolean;
  deadline?: string;
}

export interface ProcessIntimation {
  id: string;
  process_id: string;
  title: string;
  content: string;
  deadline: string;
  created_at: string;
  status: "pending" | "responded" | "expired";
  response?: string;
}
