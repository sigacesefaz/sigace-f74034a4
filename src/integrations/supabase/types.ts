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
          court: string | null
          created_at: string | null
          description: string | null
          hits: Json | null
          id: number
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
          court?: string | null
          created_at?: string | null
          description?: string | null
          hits?: Json | null
          id?: number
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
          court?: string | null
          created_at?: string | null
          description?: string | null
          hits?: Json | null
          id?: number
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
      process_status: "Em andamento" | "Suspenso" | "Baixado"
      process_type: "liminar" | "recurso" | "outros"
      user_type: "internal" | "external"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
