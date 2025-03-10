
// Add PartyType to be exported here
export type PartyPersonType = "physical" | "legal";

export type PartyType = {
  id: string;
  document: string;
  name: string;
  type: "AUTHOR" | "DEFENDANT" | "MP";
  subtype: string;
  personType: PartyPersonType;
};

// Add other types needed from the process
export interface Process {
  id: string;
  number: string;
  title: string;
  description?: string;
  status: string;
  court?: string;
  type?: string;
  instance?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Add ProcessNotification type to fix notification error
export interface ProcessNotification {
  id: string;
  title: string;
  message: string;
  type: "update" | "deadline" | "document" | "hearing";
  process_id?: string;
  user_id: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}
