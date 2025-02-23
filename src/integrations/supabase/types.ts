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
        Relationships: [
          {
            foreignKeyName: "intimations_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
        ]
      }
      processes: {
        Row: {
          attachments: string[] | null
          court: string
          created_at: string
          defendant: string | null
          defendant_document: string | null
          description: string | null
          id: string
          instance: string
          judge: string | null
          number: string
          plaintiff: string | null
          plaintiff_document: string | null
          status: string
          tags: string[] | null
          title: string
          type: string
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          attachments?: string[] | null
          court: string
          created_at?: string
          defendant?: string | null
          defendant_document?: string | null
          description?: string | null
          id?: string
          instance: string
          judge?: string | null
          number: string
          plaintiff?: string | null
          plaintiff_document?: string | null
          status: string
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          attachments?: string[] | null
          court?: string
          created_at?: string
          defendant?: string | null
          defendant_document?: string | null
          description?: string | null
          id?: string
          instance?: string
          judge?: string | null
          number?: string
          plaintiff?: string | null
          plaintiff_document?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
          value?: number | null
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
      intimation_method: "official_gazette" | "mail" | "officer" | "electronic"
      intimation_status: "pending" | "completed" | "expired"
      intimation_type: "defense" | "hearing" | "payment" | "document" | "other"
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
