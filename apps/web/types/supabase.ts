// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      cows: {
        Row: {
          id: string
          farm_id: string
          name: string
          breed: string | null
          tag_id: string
          color: string | null
          age: number | null
          weight: number | null
          status: string
          birth_date: string | null
          sire: string | null
          dam: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          name: string
          breed?: string | null
          tag_id: string
          color?: string | null
          age?: number | null
          weight?: number | null
          status?: string
          birth_date?: string | null
          sire?: string | null
          dam?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farm_id?: string
          name?: string
          breed?: string | null
          tag_id?: string
          color?: string | null
          age?: number | null
          weight?: number | null
          status?: string
          birth_date?: string | null
          sire?: string | null
          dam?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      health_records: {
        Row: {
          id: string
          cow_id: string
          farm_id: string
          record_type: string
          title: string
          record_date: string
          description: string | null
          vaccine_name: string | null
          medication_name: string | null
          dosage: string | null
          administered_by: string | null
          next_due_date: string | null
          disease_name: string | null
          symptoms: string | null
          diagnosis: string | null
          treatment_plan: string | null
          recovery_status: string | null
          vet_name: string | null
          vet_contact: string | null
          appointment_date: string | null
          cost: number | null
          attachments: unknown[] | null
          notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          cow_id: string
          farm_id: string
          record_type: string
          title: string
          record_date: string
          description?: string | null
          vaccine_name?: string | null
          medication_name?: string | null
          dosage?: string | null
          administered_by?: string | null
          next_due_date?: string | null
          disease_name?: string | null
          symptoms?: string | null
          diagnosis?: string | null
          treatment_plan?: string | null
          recovery_status?: string | null
          vet_name?: string | null
          vet_contact?: string | null
          appointment_date?: string | null
          cost?: number | null
          attachments?: unknown[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          cow_id?: string
          farm_id?: string
          record_type?: string
          title?: string
          record_date?: string
          description?: string | null
          vaccine_name?: string | null
          medication_name?: string | null
          dosage?: string | null
          administered_by?: string | null
          next_due_date?: string | null
          disease_name?: string | null
          symptoms?: string | null
          diagnosis?: string | null
          treatment_plan?: string | null
          recovery_status?: string | null
          vet_name?: string | null
          vet_contact?: string | null
          appointment_date?: string | null
          cost?: number | null
          attachments?: unknown[] | null
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      milk_production: {
        Row: {
          id: string
          cow_id: string
          farm_id: string
          production_date: string
          morning_yield: number
          evening_yield: number
          total_yield: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cow_id: string
          farm_id: string
          production_date: string
          morning_yield: number
          evening_yield: number
          total_yield: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cow_id?: string
          farm_id?: string
          production_date?: string
          morning_yield?: number
          evening_yield?: number
          total_yield?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      upcoming_health_events: {
        Row: {
          id: string
          cow_id: string
          farm_id: string
          record_type: string
          title: string
          next_due_date: string
          cow_name: string
          tag_id: string
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}