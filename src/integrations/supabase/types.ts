export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          body_type: string | null
          created_at: string
          id: string
          image_url: string | null
          name: string
          position: number
          slug: string
        }
        Insert: {
          body_type?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          position?: number
          slug: string
        }
        Update: {
          body_type?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          position?: number
          slug?: string
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          created_at: string
          email: string | null
          id: string
          kind: string
          message: string | null
          name: string
          phone: string
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          user_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          kind?: string
          message?: string | null
          name: string
          phone: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          kind?: string
          message?: string | null
          name?: string
          phone?: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      features: {
        Row: {
          id: string
          name: string
          position: number
        }
        Insert: {
          id?: string
          name: string
          position?: number
        }
        Update: {
          id?: string
          name?: string
          position?: number
        }
        Relationships: []
      }
      financing_requests: {
        Row: {
          created_at: string
          deposit: number | null
          email: string | null
          employment_status: string | null
          id: string
          monthly_income: number | null
          name: string
          payment_period: string | null
          phone: string
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          user_id: string | null
          vehicle_id: string | null
          vehicle_interest: string | null
        }
        Insert: {
          created_at?: string
          deposit?: number | null
          email?: string | null
          employment_status?: string | null
          id?: string
          monthly_income?: number | null
          name: string
          payment_period?: string | null
          phone: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id?: string | null
          vehicle_id?: string | null
          vehicle_interest?: string | null
        }
        Update: {
          created_at?: string
          deposit?: number | null
          email?: string | null
          employment_status?: string | null
          id?: string
          monthly_income?: number | null
          name?: string
          payment_period?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id?: string | null
          vehicle_id?: string | null
          vehicle_interest?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financing_requests_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      sell_requests: {
        Row: {
          created_at: string
          description: string | null
          email: string | null
          expected_price: number | null
          fuel_type: string | null
          id: string
          location: string | null
          make: string
          mileage: number | null
          model: string
          name: string
          phone: string
          photos: string[]
          status: Database["public"]["Enums"]["request_status"]
          transmission: string | null
          updated_at: string
          user_id: string | null
          year: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          email?: string | null
          expected_price?: number | null
          fuel_type?: string | null
          id?: string
          location?: string | null
          make: string
          mileage?: number | null
          model: string
          name: string
          phone: string
          photos?: string[]
          status?: Database["public"]["Enums"]["request_status"]
          transmission?: string | null
          updated_at?: string
          user_id?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string | null
          expected_price?: number | null
          fuel_type?: string | null
          id?: string
          location?: string | null
          make?: string
          mileage?: number | null
          model?: string
          name?: string
          phone?: string
          photos?: string[]
          status?: Database["public"]["Enums"]["request_status"]
          transmission?: string | null
          updated_at?: string
          user_id?: string | null
          year?: number | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string
          icon: string | null
          id: string
          position: number
          published: boolean
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          position?: number
          published?: boolean
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          position?: number
          published?: boolean
          title?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          id: string
          is_demo: boolean
          location: string | null
          name: string
          published: boolean
          rating: number
          review: string
          vehicle_purchased: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_demo?: boolean
          location?: string | null
          name: string
          published?: boolean
          rating?: number
          review: string
          vehicle_purchased?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_demo?: boolean
          location?: string | null
          name?: string
          published?: boolean
          rating?: number
          review?: string
          vehicle_purchased?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_features: {
        Row: {
          feature_id: string
          vehicle_id: string
        }
        Insert: {
          feature_id: string
          vehicle_id: string
        }
        Update: {
          feature_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_features_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_images: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          position: number
          url: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          position?: number
          url: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          position?: number
          url?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_images_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          body_type: string
          condition: string
          created_at: string
          description: string | null
          doors: number | null
          drive_type: string | null
          engine: string | null
          engine_size: number | null
          exterior_color: string | null
          featured: boolean
          fuel_type: string
          id: string
          interior_color: string | null
          is_demo: boolean
          location: string | null
          make: string
          mileage: number
          model: string
          price: number
          seats: number | null
          status: Database["public"]["Enums"]["vehicle_status"]
          stock_number: string | null
          transmission: string
          updated_at: string
          variant: string | null
          year: number
        }
        Insert: {
          body_type?: string
          condition?: string
          created_at?: string
          description?: string | null
          doors?: number | null
          drive_type?: string | null
          engine?: string | null
          engine_size?: number | null
          exterior_color?: string | null
          featured?: boolean
          fuel_type?: string
          id?: string
          interior_color?: string | null
          is_demo?: boolean
          location?: string | null
          make: string
          mileage?: number
          model: string
          price?: number
          seats?: number | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          stock_number?: string | null
          transmission?: string
          updated_at?: string
          variant?: string | null
          year: number
        }
        Update: {
          body_type?: string
          condition?: string
          created_at?: string
          description?: string | null
          doors?: number | null
          drive_type?: string | null
          engine?: string | null
          engine_size?: number | null
          exterior_color?: string | null
          featured?: boolean
          fuel_type?: string
          id?: string
          interior_color?: string | null
          is_demo?: boolean
          location?: string | null
          make?: string
          mileage?: number
          model?: string
          price?: number
          seats?: number | null
          status?: Database["public"]["Enums"]["vehicle_status"]
          stock_number?: string | null
          transmission?: string
          updated_at?: string
          variant?: string | null
          year?: number
        }
        Relationships: []
      }
      website_settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "customer"
      request_status:
        | "new"
        | "contacted"
        | "viewing_scheduled"
        | "negotiating"
        | "reviewing"
        | "accepted"
        | "rejected"
        | "completed"
        | "closed"
      vehicle_status: "available" | "reserved" | "sold" | "draft"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer"],
      request_status: [
        "new",
        "contacted",
        "viewing_scheduled",
        "negotiating",
        "reviewing",
        "accepted",
        "rejected",
        "completed",
        "closed",
      ],
      vehicle_status: ["available", "reserved", "sold", "draft"],
    },
  },
} as const
