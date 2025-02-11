export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          gender: 'male' | 'female' | 'unspecified'
          birth_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gender: 'male' | 'female' | 'unspecified'
          birth_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          gender?: 'male' | 'female' | 'unspecified'
          birth_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      analyses: {
        Row: {
          id: string
          user_id: string
          image_url: string | null
          scores: Json
          detailed_scores: Json
          advice: Json
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url?: string | null
          scores: Json
          detailed_scores: Json
          advice: Json
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string | null
          scores?: Json
          detailed_scores?: Json
          advice?: Json
          is_public?: boolean
          created_at?: string
        }
      }
      daily_tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          time_of_day: string
          duration: number
          difficulty: string
          priority: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category: string
          time_of_day: string
          duration: number
          difficulty: string
          priority: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          time_of_day?: string
          duration?: number
          difficulty?: string
          priority?: number
          created_at?: string
          updated_at?: string
        }
      }
      task_completions: {
        Row: {
          id: string
          user_id: string
          task_id: string
          completed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          task_id: string
          completed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task_id?: string
          completed_at?: string
        }
      }
    }
  }
}