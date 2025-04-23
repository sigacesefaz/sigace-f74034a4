export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      email_tracking: {
        Row: {
          count: number
          id: string
          month: number
          updated_at: string | null
          year: number
        }
        Insert: {
          count?: number
          id?: string
          month: number
          updated_at?: string | null
          year: number
        }
        Update: {
          count?: number
          id?: string
          month?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      entity_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      party_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      process_archive_info: {
        Row: {
          action: string
          created_at: string
          date: string
          id: number
          process_id: number
          reason: string | null
          updated_at: string
        }
        Insert: {
          action: string
          created_at?: string
          date?: string
          id?: number
          process_id: number
          reason?: string | null
          updated_at?: string
        }
        Update: {
          action?: string
          created_at?: string
          date?: string
          id?: number
          process_id?: number
          reason?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "process_archive_info_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
        ]
      }
      process_details: {
        Row: {
          assuntos: Json | null
          classe: Json | null
          created_at: string | null
          data_ajuizamento: string | null
          data_hora_ultima_atualizacao: string | null
          formato: Json | null
          grau: string | null
          id: string
          json_completo: Json | null
          movimentos: Json | null
          nivel_sigilo: number | null
          orgao_julgador: Json | null
          partes: Json | null
          process_id: number | null
          sistema: Json | null
          tribunal: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assuntos?: Json | null
          classe?: Json | null
          created_at?: string | null
          data_ajuizamento?: string | null
          data_hora_ultima_atualizacao?: string | null
          formato?: Json | null
          grau?: string | null
          id?: string
          json_completo?: Json | null
          movimentos?: Json | null
          nivel_sigilo?: number | null
          orgao_julgador?: Json | null
          partes?: Json | null
          process_id?: number | null
          sistema?: Json | null
          tribunal?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assuntos?: Json | null
          classe?: Json | null
          created_at?: string | null
          data_ajuizamento?: string | null
          data_hora_ultima_atualizacao?: string | null
          formato?: Json | null
          grau?: string | null
          id?: string
          json_completo?: Json | null
          movimentos?: Json | null
          nivel_sigilo?: number | null
          orgao_julgador?: Json | null
          partes?: Json | null
          process_id?: number | null
          sistema?: Json | null
          tribunal?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "process_details_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
        ]
      }
      process_documents: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          hit_id: string | null
          id: string
          process_id: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          hit_id?: string | null
          id?: string
          process_id?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          hit_id?: string | null
          id?: string
          process_id?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "process_documents_hit_id_fkey"
            columns: ["hit_id"]
            isOneToOne: false
            referencedRelation: "process_hits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "process_documents_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
        ]
      }
      process_hits: {
        Row: {
          classe: Json | null
          created_at: string | null
          data_ajuizamento: string | null
          data_hora_ultima_atualizacao: string | null
          formato: Json | null
          grau: string | null
          hit_id: string | null
          hit_index: string | null
          hit_score: number | null
          id: string
          nivel_sigilo: number | null
          numero_processo: string | null
          orgao_julgador: Json | null
          process_id: number | null
          sistema: Json | null
          situacao: Json | null
          tribunal: string | null
          updated_at: string | null
          user_id: string | null
          valor_causa: number | null
        }
        Insert: {
          classe?: Json | null
          created_at?: string | null
          data_ajuizamento?: string | null
          data_hora_ultima_atualizacao?: string | null
          formato?: Json | null
          grau?: string | null
          hit_id?: string | null
          hit_index?: string | null
          hit_score?: number | null
          id?: string
          nivel_sigilo?: number | null
          numero_processo?: string | null
          orgao_julgador?: Json | null
          process_id?: number | null
          sistema?: Json | null
          situacao?: Json | null
          tribunal?: string | null
          updated_at?: string | null
          user_id?: string | null
          valor_causa?: number | null
        }
        Update: {
          classe?: Json | null
          created_at?: string | null
          data_ajuizamento?: string | null
          data_hora_ultima_atualizacao?: string | null
          formato?: Json | null
          grau?: string | null
          hit_id?: string | null
          hit_index?: string | null
          hit_score?: number | null
          id?: string
          nivel_sigilo?: number | null
          numero_processo?: string | null
          orgao_julgador?: Json | null
          process_id?: number | null
          sistema?: Json | null
          situacao?: Json | null
          tribunal?: string | null
          updated_at?: string | null
          user_id?: string | null
          valor_causa?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "process_hits_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
        ]
      }
      process_intimations: {
        Row: {
          content: string
          court: string
          court_division: string
          created_at: string
          created_by: string
          creator_address: string | null
          creator_document: string | null
          creator_email: string | null
          creator_is_intimated: boolean | null
          creator_name: string | null
          creator_phone: string | null
          deadline: string
          filing_date: string | null
          id: string
          instance: string | null
          intimated_address: string | null
          intimated_document: string | null
          intimated_email: string | null
          intimated_name: string
          intimated_phone: string | null
          intimated_registration: string | null
          intimation_date: string
          intimation_method: string
          judgment_body: string | null
          process_id: string
          process_number: string
          receipt: Json | null
          receipt_data: string | null
          receipt_file: string | null
          receipt_mime_type: string | null
          receipt_type: string | null
          status: Database["public"]["Enums"]["intimation_status"]
          subject: string | null
          title: string
          type: Database["public"]["Enums"]["intimation_type"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content: string
          court: string
          court_division: string
          created_at?: string
          created_by: string
          creator_address?: string | null
          creator_document?: string | null
          creator_email?: string | null
          creator_is_intimated?: boolean | null
          creator_name?: string | null
          creator_phone?: string | null
          deadline: string
          filing_date?: string | null
          id?: string
          instance?: string | null
          intimated_address?: string | null
          intimated_document?: string | null
          intimated_email?: string | null
          intimated_name?: string
          intimated_phone?: string | null
          intimated_registration?: string | null
          intimation_date: string
          intimation_method?: string
          judgment_body?: string | null
          process_id: string
          process_number: string
          receipt?: Json | null
          receipt_data?: string | null
          receipt_file?: string | null
          receipt_mime_type?: string | null
          receipt_type?: string | null
          status?: Database["public"]["Enums"]["intimation_status"]
          subject?: string | null
          title: string
          type: Database["public"]["Enums"]["intimation_type"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: string
          court?: string
          court_division?: string
          created_at?: string
          created_by?: string
          creator_address?: string | null
          creator_document?: string | null
          creator_email?: string | null
          creator_is_intimated?: boolean | null
          creator_name?: string | null
          creator_phone?: string | null
          deadline?: string
          filing_date?: string | null
          id?: string
          instance?: string | null
          intimated_address?: string | null
          intimated_document?: string | null
          intimated_email?: string | null
          intimated_name?: string
          intimated_phone?: string | null
          intimated_registration?: string | null
          intimation_date?: string
          intimation_method?: string
          judgment_body?: string | null
          process_id?: string
          process_number?: string
          receipt?: Json | null
          receipt_data?: string | null
          receipt_file?: string | null
          receipt_mime_type?: string | null
          receipt_type?: string | null
          status?: Database["public"]["Enums"]["intimation_status"]
          subject?: string | null
          title?: string
          type?: Database["public"]["Enums"]["intimation_type"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      process_judicial_decisions: {
        Row: {
          attachments: Json | null
          content: string | null
          created_at: string | null
          decision_date: string | null
          decision_type: string | null
          hit_id: string | null
          id: string
          judge: string | null
          process_id: number | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          content?: string | null
          created_at?: string | null
          decision_date?: string | null
          decision_type?: string | null
          hit_id?: string | null
          id?: string
          judge?: string | null
          process_id?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          content?: string | null
          created_at?: string | null
          decision_date?: string | null
          decision_type?: string | null
          hit_id?: string | null
          id?: string
          judge?: string | null
          process_id?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "process_judicial_decisions_hit_id_fkey"
            columns: ["hit_id"]
            isOneToOne: false
            referencedRelation: "process_hits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "process_judicial_decisions_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
        ]
      }
      process_movement_documents: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          movement_id: string
          process_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          movement_id: string
          process_id: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          movement_id?: string
          process_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_movement"
            columns: ["movement_id"]
            isOneToOne: false
            referencedRelation: "process_movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_process"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
        ]
      }
      process_movements: {
        Row: {
          codigo: number | null
          complemento: string | null
          complementos_tabelados: Json | null
          created_at: string | null
          data_hora: string | null
          hit_id: string | null
          id: string
          json_completo: Json | null
          movimento_principal_id: string | null
          nome: string | null
          orgao_julgador: Json | null
          process_id: number | null
          tipo: string | null
          user_id: string | null
        }
        Insert: {
          codigo?: number | null
          complemento?: string | null
          complementos_tabelados?: Json | null
          created_at?: string | null
          data_hora?: string | null
          hit_id?: string | null
          id?: string
          json_completo?: Json | null
          movimento_principal_id?: string | null
          nome?: string | null
          orgao_julgador?: Json | null
          process_id?: number | null
          tipo?: string | null
          user_id?: string | null
        }
        Update: {
          codigo?: number | null
          complemento?: string | null
          complementos_tabelados?: Json | null
          created_at?: string | null
          data_hora?: string | null
          hit_id?: string | null
          id?: string
          json_completo?: Json | null
          movimento_principal_id?: string | null
          nome?: string | null
          orgao_julgador?: Json | null
          process_id?: number | null
          tipo?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "process_movements_hit_id_fkey"
            columns: ["hit_id"]
            isOneToOne: false
            referencedRelation: "process_hits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "process_movements_movimento_principal_id_fkey"
            columns: ["movimento_principal_id"]
            isOneToOne: false
            referencedRelation: "process_movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "process_movements_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
        ]
      }
      process_parties: {
        Row: {
          created_at: string | null
          document: string | null
          id: string
          name: string
          person_type: string | null
          process_id: number | null
          subtype: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          document?: string | null
          id?: string
          name: string
          person_type?: string | null
          process_id?: number | null
          subtype?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          document?: string | null
          id?: string
          name?: string
          person_type?: string | null
          process_id?: number | null
          subtype?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "process_parties_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
        ]
      }
      process_subjects: {
        Row: {
          codigo: number | null
          created_at: string | null
          hit_id: string | null
          id: string
          nome: string | null
          principal: boolean | null
          process_id: number | null
          user_id: string | null
        }
        Insert: {
          codigo?: number | null
          created_at?: string | null
          hit_id?: string | null
          id?: string
          nome?: string | null
          principal?: boolean | null
          process_id?: number | null
          user_id?: string | null
        }
        Update: {
          codigo?: number | null
          created_at?: string | null
          hit_id?: string | null
          id?: string
          nome?: string | null
          principal?: boolean | null
          process_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "process_subjects_hit_id_fkey"
            columns: ["hit_id"]
            isOneToOne: false
            referencedRelation: "process_hits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "process_subjects_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
        ]
      }
      process_update_history: {
        Row: {
          created_at: string | null
          details: Json | null
          id: string
          new_status: string | null
          previous_status: string | null
          process_id: number
          update_date: string | null
          update_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          id?: string
          new_status?: string | null
          previous_status?: string | null
          process_id: number
          update_date?: string | null
          update_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          id?: string
          new_status?: string | null
          previous_status?: string | null
          process_id?: number
          update_date?: string | null
          update_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "process_update_history_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
        ]
      }
      processes: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          court: string | null
          created_at: string | null
          description: string | null
          hits: Json | null
          id: number
          is_archived: boolean
          is_parent: boolean | null
          metadata: Json | null
          number: string
          parent_id: number | null
          plaintiff: string | null
          plaintiff_document: string | null
          schedule_config: Json | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          archive_reason?: string | null
          archived_at?: string | null
          court?: string | null
          created_at?: string | null
          description?: string | null
          hits?: Json | null
          id?: number
          is_archived?: boolean
          is_parent?: boolean | null
          metadata?: Json | null
          number: string
          parent_id?: number | null
          plaintiff?: string | null
          plaintiff_document?: string | null
          schedule_config?: Json | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          archive_reason?: string | null
          archived_at?: string | null
          court?: string | null
          created_at?: string | null
          description?: string | null
          hits?: Json | null
          id?: number
          is_archived?: boolean
          is_parent?: boolean | null
          metadata?: Json | null
          number?: string
          parent_id?: number | null
          plaintiff?: string | null
          plaintiff_document?: string | null
          schedule_config?: Json | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "processes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          document_number: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string
          document_number?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string
          document_number?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      system_configuration: {
        Row: {
          created_at: string | null
          email_monthly_limit: number
          google_auth_client_id: string | null
          google_auth_client_secret: string | null
          id: string
          resend_api_key: string | null
          resend_test_mode: boolean | null
          resend_verified_email: string | null
          update_processes_day: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email_monthly_limit?: number
          google_auth_client_id?: string | null
          google_auth_client_secret?: string | null
          id?: string
          resend_api_key?: string | null
          resend_test_mode?: boolean | null
          resend_verified_email?: string | null
          update_processes_day?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email_monthly_limit?: number
          google_auth_client_id?: string | null
          google_auth_client_secret?: string | null
          id?: string
          resend_api_key?: string | null
          resend_test_mode?: boolean | null
          resend_verified_email?: string | null
          update_processes_day?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_process_status_based_on_movements: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      court_instance: "primeira" | "segunda" | "superior" | "supremo"
      intimation_method: "official_gazette" | "mail" | "officer" | "electronic"
      intimation_status: "pending" | "completed" | "expired"
      intimation_type:
        | "defense"
        | "hearing"
        | "payment"
        | "document"
        | "other"
        | "notification"
        | "citation"
        | "subpoena"
        | "sentence"
        | "decision"
      process_class:
        | "Ação Civil Pública"
        | "Ação Trabalhista"
        | "Mandado de Segurança"
        | "Recurso Ordinário"
        | "Agravo de Petição"
        | "Outros"
      process_priority: "Normal" | "Urgente" | "Alta" | "Baixa"
      process_status: "Em andamento" | "Arquivado" | "Suspenso" | "Baixado"
      process_type: "liminar" | "recurso" | "outros"
      user_type: "internal" | "external"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      court_instance: ["primeira", "segunda", "superior", "supremo"],
      intimation_method: ["official_gazette", "mail", "officer", "electronic"],
      intimation_status: ["pending", "completed", "expired"],
      intimation_type: [
        "defense",
        "hearing",
        "payment",
        "document",
        "other",
        "notification",
        "citation",
        "subpoena",
        "sentence",
        "decision",
      ],
      process_class: [
        "Ação Civil Pública",
        "Ação Trabalhista",
        "Mandado de Segurança",
        "Recurso Ordinário",
        "Agravo de Petição",
        "Outros",
      ],
      process_priority: ["Normal", "Urgente", "Alta", "Baixa"],
      process_status: ["Em andamento", "Arquivado", "Suspenso", "Baixado"],
      process_type: ["liminar", "recurso", "outros"],
      user_type: ["internal", "external"],
    },
  },
} as const
