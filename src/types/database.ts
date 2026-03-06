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
      prefectures: {
        Row: {
          code: string
          name: string
          region: string
        }
        Insert: {
          code: string
          name: string
          region: string
        }
        Update: {
          code?: string
          name?: string
          region?: string
        }
        Relationships: []
      }
      cities: {
        Row: {
          code: string
          prefecture_code: string
          name: string
        }
        Insert: {
          code: string
          prefecture_code: string
          name: string
        }
        Update: {
          code?: string
          prefecture_code?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: 'cities_prefecture_code_fkey'
            columns: ['prefecture_code']
            isOneToOne: false
            referencedRelation: 'prefectures'
            referencedColumns: ['code']
          },
        ]
      }
      industry_classifications: {
        Row: {
          id: number
          code: string
          name: string
          level: 'major' | 'middle' | 'minor' | 'detail'
          parent_code: string | null
          version: number
          valid_from: string
        }
        Insert: {
          id?: number
          code: string
          name: string
          level: 'major' | 'middle' | 'minor' | 'detail'
          parent_code?: string | null
          version?: number
          valid_from?: string
        }
        Update: {
          code?: string
          name?: string
          level?: 'major' | 'middle' | 'minor' | 'detail'
          parent_code?: string | null
          version?: number
          valid_from?: string
        }
        Relationships: []
      }
      gbiz_industry_mapping: {
        Row: {
          id: number
          eda_code: string
          eda_name: string
          jsic_code: string
          jsic_level: 'major' | 'middle' | 'minor' | 'detail'
          confidence: number
          is_manual: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          eda_code: string
          eda_name: string
          jsic_code: string
          jsic_level: 'major' | 'middle' | 'minor' | 'detail'
          confidence?: number
          is_manual?: boolean
        }
        Update: {
          eda_code?: string
          eda_name?: string
          jsic_code?: string
          jsic_level?: 'major' | 'middle' | 'minor' | 'detail'
          confidence?: number
          is_manual?: boolean
        }
        Relationships: []
      }
      unmapped_industries: {
        Row: {
          id: number
          eda_code: string | null
          business_items: string | null
          corporate_number: string
          reviewed: boolean
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          eda_code?: string | null
          business_items?: string | null
          corporate_number: string
          reviewed?: boolean
        }
        Update: {
          reviewed?: boolean
          reviewed_at?: string | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          id: string
          corporate_number: string
          name: string
          name_kana: string | null
          postal_code: string | null
          prefecture_code: string
          prefecture_name: string
          city_code: string | null
          city_name: string | null
          address: string | null
          full_address: string | null
          representative_name: string | null
          capital: number | null
          employee_count: number | null
          business_summary: string | null
          gbiz_business_items: string | null
          website_url: string | null
          corporate_type: string | null
          establishment_date: string | null
          status: 'active' | 'closed' | 'merged'
          search_vector: unknown | null
          gbizinfo_updated_at: string | null
          nta_updated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          corporate_number: string
          name: string
          name_kana?: string | null
          postal_code?: string | null
          prefecture_code: string
          prefecture_name: string
          city_code?: string | null
          city_name?: string | null
          address?: string | null
          full_address?: string | null
          representative_name?: string | null
          capital?: number | null
          employee_count?: number | null
          business_summary?: string | null
          gbiz_business_items?: string | null
          website_url?: string | null
          corporate_type?: string | null
          establishment_date?: string | null
          status?: 'active' | 'closed' | 'merged'
          gbizinfo_updated_at?: string | null
          nta_updated_at?: string | null
        }
        Update: {
          corporate_number?: string
          name?: string
          name_kana?: string | null
          postal_code?: string | null
          prefecture_code?: string
          prefecture_name?: string
          city_code?: string | null
          city_name?: string | null
          address?: string | null
          full_address?: string | null
          representative_name?: string | null
          capital?: number | null
          employee_count?: number | null
          business_summary?: string | null
          gbiz_business_items?: string | null
          website_url?: string | null
          corporate_type?: string | null
          establishment_date?: string | null
          status?: 'active' | 'closed' | 'merged'
          gbizinfo_updated_at?: string | null
          nta_updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'companies_prefecture_code_fkey'
            columns: ['prefecture_code']
            isOneToOne: false
            referencedRelation: 'prefectures'
            referencedColumns: ['code']
          },
        ]
      }
      company_industry_mapping: {
        Row: {
          company_id: string
          jsic_code: string
          source: 'gbizinfo' | 'manual'
          confidence: number
          created_at: string
        }
        Insert: {
          company_id: string
          jsic_code: string
          source?: 'gbizinfo' | 'manual'
          confidence?: number
        }
        Update: {
          source?: 'gbizinfo' | 'manual'
          confidence?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          clerk_user_id: string
          email: string
          plan: 'free' | 'starter' | 'pro'
          status: 'active' | 'suspended' | 'deleted'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          monthly_download_count: number
          download_reset_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          clerk_user_id: string
          email: string
          plan?: 'free' | 'starter' | 'pro'
          status?: 'active' | 'suspended' | 'deleted'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          monthly_download_count?: number
        }
        Update: {
          email?: string
          plan?: 'free' | 'starter' | 'pro'
          status?: 'active' | 'suspended' | 'deleted'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          monthly_download_count?: number
          download_reset_at?: string
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          id: string
          user_id: string
          name: string
          search_params: Json
          share_token: string | null
          share_expires_at: string | null
          result_count: number | null
          notify_enabled: boolean
          notify_frequency: 'daily' | 'weekly' | 'monthly'
          last_notified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          name: string
          search_params: Json
          share_token?: string | null
          share_expires_at?: string | null
          result_count?: number | null
          notify_enabled?: boolean
          notify_frequency?: 'daily' | 'weekly' | 'monthly'
        }
        Update: {
          name?: string
          search_params?: Json
          share_token?: string | null
          share_expires_at?: string | null
          result_count?: number | null
          notify_enabled?: boolean
          notify_frequency?: 'daily' | 'weekly' | 'monthly'
          last_notified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'saved_searches_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      download_logs: {
        Row: {
          id: string
          user_id: string
          search_params: Json
          format: 'csv' | 'xlsx'
          encoding: 'utf8' | 'sjis'
          record_count: number
          file_url: string | null
          status: 'pending' | 'generating' | 'completed' | 'failed' | 'expired'
          created_at: string
        }
        Insert: {
          user_id: string
          search_params: Json
          format: 'csv' | 'xlsx'
          encoding?: 'utf8' | 'sjis'
          record_count: number
          file_url?: string | null
          status?: 'pending' | 'generating' | 'completed' | 'failed' | 'expired'
        }
        Update: {
          file_url?: string | null
          status?: 'pending' | 'generating' | 'completed' | 'failed' | 'expired'
        }
        Relationships: [
          {
            foreignKeyName: 'download_logs_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'new_companies' | 'alert_triggered'
          title: string
          message: string
          saved_search_id: string | null
          new_count: number
          is_read: boolean
          created_at: string
        }
        Insert: {
          user_id: string
          type: 'new_companies' | 'alert_triggered'
          title: string
          message: string
          saved_search_id?: string | null
          new_count?: number
          is_read?: boolean
        }
        Update: {
          is_read?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'notifications_saved_search_id_fkey'
            columns: ['saved_search_id']
            isOneToOne: false
            referencedRelation: 'saved_searches'
            referencedColumns: ['id']
          },
        ]
      }
      sync_logs: {
        Row: {
          id: string
          source: 'gbizinfo' | 'nta'
          sync_type: 'full' | 'incremental'
          records_processed: number
          records_inserted: number
          records_updated: number
          records_failed: number
          status: 'running' | 'completed' | 'failed' | 'cancelled'
          target_prefecture: string | null
          started_at: string
          completed_at: string | null
          error_message: string | null
        }
        Insert: {
          source: 'gbizinfo' | 'nta'
          sync_type: 'full' | 'incremental'
          records_processed?: number
          records_inserted?: number
          records_updated?: number
          records_failed?: number
          status?: 'running' | 'completed' | 'failed' | 'cancelled'
          target_prefecture?: string | null
        }
        Update: {
          records_processed?: number
          records_inserted?: number
          records_updated?: number
          records_failed?: number
          status?: 'running' | 'completed' | 'failed' | 'cancelled'
          completed_at?: string | null
          error_message?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      mv_prefecture_industry_count: {
        Row: {
          prefecture_code: string
          prefecture_name: string
          region: string
          jsic_code: string
          industry_name: string
          industry_level: string
          company_count: number
        }
        Relationships: []
      }
      mv_prefecture_summary: {
        Row: {
          prefecture_code: string
          prefecture_name: string
          region: string
          total_companies: number
          with_website: number
          avg_capital: number | null
          avg_employees: number | null
        }
        Relationships: []
      }
      mv_industry_summary: {
        Row: {
          major_code: string
          major_name: string
          company_count: number
        }
        Relationships: []
      }
    }
    Functions: {
      refresh_all_materialized_views: {
        Args: Record<string, never>
        Returns: void
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
