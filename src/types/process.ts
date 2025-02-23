
export type ProcessStatus = "active" | "pending" | "closed";
export type ProcessType = "liminar" | "recurso" | "outros";
export type CourtInstance = "primeira" | "segunda" | "superior" | "supremo";
export type IntimationType = "defense" | "hearing" | "payment" | "document" | "other";
export type IntimationStatus = "pending" | "completed" | "expired";
export type IntimationMethod = "official_gazette" | "mail" | "officer" | "electronic";

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
  process_number: string;
  court: string;
  court_division: string;
  title: string;
  content: string;
  intimation_date: string;
  deadline: string;
  type: IntimationType;
  method: IntimationMethod;
  status: IntimationStatus;
  response?: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by?: string;
  parties: {
    name: string;
    role: string;
    lawyer?: {
      name: string;
      oab: string;
      contact: string;
    };
  }[];
  attachments: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
  receipt?: {
    id: string;
    date: string;
    type: string;
    proof_url?: string;
  };
  related_hearing?: {
    date: string;
    time: string;
    location: string;
    type: string;
  };
  related_decision?: {
    id: string;
    type: string;
    content: string;
    date: string;
  };
  related_appeal?: {
    id: string;
    type: string;
    status: string;
    filing_date: string;
  };
  observations?: string;
  history: {
    id: string;
    date: string;
    user: string;
    action: string;
    details?: string;
  }[];
}

