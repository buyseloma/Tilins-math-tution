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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          class_id: string | null
          id: string
          is_present: boolean | null
          marked_at: string | null
          student_id: string
        }
        Insert: {
          class_id?: string | null
          id?: string
          is_present?: boolean | null
          marked_at?: string | null
          student_id: string
        }
        Update: {
          class_id?: string | null
          id?: string
          is_present?: boolean | null
          marked_at?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          board: Database["public"]["Enums"]["board_type"]
          created_at: string | null
          grade: string
          id: string
          mode: Database["public"]["Enums"]["class_mode"]
          name: string
          teacher_id: string | null
        }
        Insert: {
          board: Database["public"]["Enums"]["board_type"]
          created_at?: string | null
          grade: string
          id?: string
          mode: Database["public"]["Enums"]["class_mode"]
          name: string
          teacher_id?: string | null
        }
        Update: {
          board?: Database["public"]["Enums"]["board_type"]
          created_at?: string | null
          grade?: string
          id?: string
          mode?: Database["public"]["Enums"]["class_mode"]
          name?: string
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batches_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      class_notes: {
        Row: {
          class_id: string | null
          file_url: string
          id: string
          title: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          class_id?: string | null
          file_url: string
          id?: string
          title: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          class_id?: string | null
          file_url?: string
          id?: string
          title?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_notes_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_notes_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          batch_id: string
          created_at: string | null
          date: string
          duration_minutes: number | null
          id: string
          is_completed: boolean | null
          meet_link: string | null
          subject: string
          time: string
        }
        Insert: {
          batch_id: string
          created_at?: string | null
          date: string
          duration_minutes?: number | null
          id?: string
          is_completed?: boolean | null
          meet_link?: string | null
          subject: string
          time: string
        }
        Update: {
          batch_id?: string
          created_at?: string | null
          date?: string
          duration_minutes?: number | null
          id?: string
          is_completed?: boolean | null
          meet_link?: string | null
          subject?: string
          time?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_bookings: {
        Row: {
          board: Database["public"]["Enums"]["board_type"]
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string
          preferred_mode: Database["public"]["Enums"]["class_mode"]
        }
        Insert: {
          board: Database["public"]["Enums"]["board_type"]
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          phone: string
          preferred_mode: Database["public"]["Enums"]["class_mode"]
        }
        Update: {
          board?: Database["public"]["Enums"]["board_type"]
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string
          preferred_mode?: Database["public"]["Enums"]["class_mode"]
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          event_id: string | null
          id: string
          registered_at: string | null
          student_id: string
        }
        Insert: {
          event_id?: string | null
          id?: string
          registered_at?: string | null
          student_id: string
        }
        Update: {
          event_id?: string | null
          id?: string
          registered_at?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          description: string | null
          event_date: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      fees: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          id: string
          paid_date: string | null
          status: Database["public"]["Enums"]["fee_status"] | null
          student_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          id?: string
          paid_date?: string | null
          status?: Database["public"]["Enums"]["fee_status"] | null
          student_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: string
          paid_date?: string | null
          status?: Database["public"]["Enums"]["fee_status"] | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          recipient_id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          recipient_id: string
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          recipient_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          admission_date: string | null
          batch_id: string | null
          board: Database["public"]["Enums"]["board_type"]
          grade: string
          id: string
          parent_id: string | null
        }
        Insert: {
          admission_date?: string | null
          batch_id?: string | null
          board: Database["public"]["Enums"]["board_type"]
          grade: string
          id: string
          parent_id?: string | null
        }
        Update: {
          admission_date?: string | null
          batch_id?: string | null
          board?: Database["public"]["Enums"]["board_type"]
          grade?: string
          id?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_submissions: {
        Row: {
          grade: number | null
          id: string
          is_completed: boolean | null
          student_id: string
          submitted_at: string | null
          task_id: string | null
        }
        Insert: {
          grade?: number | null
          id?: string
          is_completed?: boolean | null
          student_id: string
          submitted_at?: string | null
          task_id?: string | null
        }
        Update: {
          grade?: number | null
          id?: string
          is_completed?: boolean | null
          student_id?: string
          submitted_at?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          batch_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string
          id: string
          title: string
        }
        Insert: {
          batch_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date: string
          id?: string
          title: string
        }
        Update: {
          batch_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      test_marks: {
        Row: {
          id: string
          marks_obtained: number | null
          retest_date: string | null
          retest_eligible: boolean | null
          student_id: string
          test_id: string | null
        }
        Insert: {
          id?: string
          marks_obtained?: number | null
          retest_date?: string | null
          retest_eligible?: boolean | null
          student_id: string
          test_id?: string | null
        }
        Update: {
          id?: string
          marks_obtained?: number | null
          retest_date?: string | null
          retest_eligible?: boolean | null
          student_id?: string
          test_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_marks_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "tests"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_featured: boolean | null
          rating: number | null
          student_name: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          rating?: number | null
          student_name: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          rating?: number | null
          student_name?: string
        }
        Relationships: []
      }
      tests: {
        Row: {
          batch_id: string
          created_at: string | null
          id: string
          max_marks: number
          subject: string
          test_date: string
        }
        Insert: {
          batch_id: string
          created_at?: string | null
          id?: string
          max_marks: number
          subject: string
          test_date: string
        }
        Update: {
          batch_id?: string
          created_at?: string | null
          id?: string
          max_marks?: number
          subject?: string
          test_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "tests_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
    }
    Enums: {
      app_role: "admin" | "teacher" | "parent" | "student"
      board_type: "state_board" | "cbse" | "icse" | "cambridge"
      class_mode: "online" | "offline"
      fee_status: "paid" | "pending" | "overdue"
      user_role: "student" | "admin" | "teacher" | "parent"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "teacher", "parent", "student"],
      board_type: ["state_board", "cbse", "icse", "cambridge"],
      class_mode: ["online", "offline"],
      fee_status: ["paid", "pending", "overdue"],
      user_role: ["student", "admin", "teacher", "parent"],
    },
  },
} as const
