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
      intimations: {
        Row: {
          attachments: Json
          content: string
          court: string
          court_division: string
          created_at: string
          created_by: string
          deadline: string
          history: Json
          id: string
          intimation_date: string
          method: Database["public"]["Enums"]["intimation_method"]
          observations: string | null
          parties: Json
          process_id: string
          process_number: string
          receipt: Json | null
          related_appeal: Json | null
          related_decision: Json | null
          related_hearing: Json | null
          response: string | null
          status: Database["public"]["Enums"]["intimation_status"]
          title: string
          type: Database["public"]["Enums"]["intimation_type"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          attachments?: Json
          content: string
          court: string
          court_division: string
          created_at?: string
          created_by: string
          deadline: string
          history?: Json
          id?: string
          intimation_date: string
          method: Database["public"]["Enums"]["intimation_method"]
          observations?: string | null
          parties?: Json
          process_id: string
          process_number: string
          receipt?: Json | null
          related_appeal?: Json | null
          related_decision?: Json | null
          related_hearing?: Json | null
          response?: string | null
          status?: Database["public"]["Enums"]["intimation_status"]
          title: string
          type: Database["public"]["Enums"]["intimation_type"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          attachments?: Json
          content?: string
          court?: string
          court_division?: string
          created_at?: string
          created_by?: string
          deadline?: string
          history?: Json
          id?: string
          intimation_date?: string
          method?: Database["public"]["Enums"]["intimation_method"]
          observations?: string | null
          parties?: Json
          process_id?: string
          process_number?: string
          receipt?: Json | null
          related_appeal?: Json | null
          related_decision?: Json | null
          related_hearing?: Json | null
          response?: string | null
          status?: Database["public"]["Enums"]["intimation_status"]
          title?: string
          type?: Database["public"]["Enums"]["intimation_type"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      party_types: {
        Row: {
          description: string | null
          id: number
          name: string
        }
        Insert: {
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      process_decisions: {
        Row: {
          attachments: Json | null
          created_at: string | null
          decision_date: string | null
          decision_type: string | null
          description: string
          id: number
          judge: string | null
          process_id: number
          title: string
          updated_at: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          decision_date?: string | null
          decision_type?: string | null
          description: string
          id?: number
          judge?: string | null
          process_id: number
          title: string
          updated_at?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          decision_date?: string | null
          decision_type?: string | null
          description?: string
          id?: number
          judge?: string | null
          process_id?: number
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "process_decisions_process_id_fkey"
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
          id: number
          json_completo: Json | null
          movimentos: Json | null
          nivele_sigilo: number | null
          orgao_julgador: Json | null
          partes: Json | null
          process_id: number
          sistema: Json | null
          tribunal: string | null
          updated_at: string | null
        }
        Insert: {
          assuntos?: Json | null
          classe?: Json | null
          created_at?: string | null
          data_ajuizamento?: string | null
          data_hora_ultima_atualizacao?: string | null
          formato?: Json | null
          grau?: string | null
          id?: number
          json_completo?: Json | null
          movimentos?: Json | null
          nivele_sigilo?: number | null
          orgao_julgador?: Json | null
          partes?: Json | null
          process_id: number
          sistema?: Json | null
          tribunal?: string | null
          updated_at?: string | null
        }
        Update: {
          assuntos?: Json | null
          classe?: Json | null
          created_at?: string | null
          data_ajuizamento?: string | null
          data_hora_ultima_atualizacao?: string | null
          formato?: Json | null
          grau?: string | null
          id?: number
          json_completo?: Json | null
          movimentos?: Json | null
          nivele_sigilo?: number | null
          orgao_julgador?: Json | null
          partes?: Json | null
          process_id?: number
          sistema?: Json | null
          tribunal?: string | null
          updated_at?: string | null
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
      process_movements: {
        Row: {
          codigo: number | null
          complemento: string | null
          complementos_tabelados: Json | null
          created_at: string | null
          data_hora: string | null
          id: number
          json_completo: Json | null
          movimento_principal_id: number | null
          nome: string | null
          orgao_julgador: Json | null
          process_id: number
          tipo: string | null
        }
        Insert: {
          codigo?: number | null
          complemento?: string | null
          complementos_tabelados?: Json | null
          created_at?: string | null
          data_hora?: string | null
          id?: number
          json_completo?: Json | null
          movimento_principal_id?: number | null
          nome?: string | null
          orgao_julgador?: Json | null
          process_id: number
          tipo?: string | null
        }
        Update: {
          codigo?: number | null
          complemento?: string | null
          complementos_tabelados?: Json | null
          created_at?: string | null
          data_hora?: string | null
          id?: number
          json_completo?: Json | null
          movimento_principal_id?: number | null
          nome?: string | null
          orgao_julgador?: Json | null
          process_id?: number
          tipo?: string | null
        }
        Relationships: [
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
          additional_info: Json | null
          address: Json | null
          contact_info: Json | null
          created_at: string | null
          document_number: string | null
          entity_type: string
          id: number
          name: string
          party_type_id: number
          process_id: number
          representative: string | null
          updated_at: string | null
        }
        Insert: {
          additional_info?: Json | null
          address?: Json | null
          contact_info?: Json | null
          created_at?: string | null
          document_number?: string | null
          entity_type: string
          id?: number
          name: string
          party_type_id: number
          process_id: number
          representative?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_info?: Json | null
          address?: Json | null
          contact_info?: Json | null
          created_at?: string | null
          document_number?: string | null
          entity_type?: string
          id?: number
          name?: string
          party_type_id?: number
          process_id?: number
          representative?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "process_parties_party_type_id_fkey"
            columns: ["party_type_id"]
            isOneToOne: false
            referencedRelation: "party_types"
            referencedColumns: ["id"]
          },
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
          id: number
          nome: string | null
          principal: boolean | null
          process_id: number
        }
        Insert: {
          codigo?: number | null
          created_at?: string | null
          id?: number
          nome?: string | null
          principal?: boolean | null
          process_id: number
        }
        Update: {
          codigo?: number | null
          created_at?: string | null
          id?: number
          nome?: string | null
          principal?: boolean | null
          process_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "process_subjects_process_id_fkey"
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
          id: number
          number: string
          plaintiff: string | null
          plaintiff_document: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          court?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          number: string
          plaintiff?: string | null
          plaintiff_document?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          court?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          number?: string
          plaintiff?: string | null
          plaintiff_document?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      court_instance: "primeira" | "segunda" | "superior" | "supremo"
      intimation_method: "official_gazette" | "mail" | "officer" | "electronic"
      intimation_status: "pending" | "completed" | "expired"
      intimation_type: "defense" | "hearing" | "payment" | "document" | "other"
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
