
export interface Process {
  id: string;
  number: string;
  title: string;
  description?: string;
  status: string;
  court?: string;
  instance?: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
  hits?: any[];
  is_parent?: boolean;
  parent_id?: string;
  movimentacoes?: any[];
}

export interface PartyType {
  id: string;
  name: string;
  document?: string;
  type: string; // Alterado para string para compatibilidade
  subtype?: string;
  personType?: string;
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  decision_type: string;
  judge: string;
  decision_date: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
}
