import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          active?: boolean;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          company_id: string;
          username: string;
          email: string;
          role: 'SuperAdmin' | 'Admin' | 'Viewer';
          active: boolean;
          full_name: string;
          last_login: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          company_id: string;
          username: string;
          email: string;
          role: 'SuperAdmin' | 'Admin' | 'Viewer';
          active?: boolean;
          full_name: string;
          last_login?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          username?: string;
          email?: string;
          role?: 'SuperAdmin' | 'Admin' | 'Viewer';
          active?: boolean;
          full_name?: string;
          last_login?: string | null;
          created_at?: string;
        };
      };
      utility_contracts: {
        Row: {
          id: string;
          company_id: string;
          utility_name: string;
          storm_event: string;
          region: string;
          contract_number: string;
          active: boolean;
          start_date: string;
          end_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          utility_name: string;
          storm_event: string;
          region: string;
          contract_number: string;
          active?: boolean;
          start_date: string;
          end_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          utility_name?: string;
          storm_event?: string;
          region?: string;
          contract_number?: string;
          active?: boolean;
          start_date?: string;
          end_date?: string | null;
          created_at?: string;
        };
      };
      crews: {
        Row: {
          id: string;
          company_id: string;
          utility_contract_id: string;
          crew_name: string;
          supervisor_id: string | null;
          active: boolean;
          equipment_assigned: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          utility_contract_id: string;
          crew_name: string;
          supervisor_id?: string | null;
          active?: boolean;
          equipment_assigned?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          utility_contract_id?: string;
          crew_name?: string;
          supervisor_id?: string | null;
          active?: boolean;
          equipment_assigned?: string[];
          created_at?: string;
        };
      };
      crew_members: {
        Row: {
          id: string;
          crew_id: string;
          name: string;
          role: string;
          hourly_rate: number;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          crew_id: string;
          name: string;
          role: string;
          hourly_rate?: number;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          crew_id?: string;
          name?: string;
          role?: string;
          hourly_rate?: number;
          active?: boolean;
          created_at?: string;
        };
      };
      time_entries: {
        Row: {
          id: string;
          crew_id: string;
          member_id: string;
          date: string;
          start_time: string;
          end_time: string;
          work_package_id: string | null;
          hours_regular: number;
          hours_overtime: number;
          status: 'draft' | 'submitted' | 'approved' | 'rejected';
          comments: string | null;
          gps_locations: any[];
          submitted_by: string | null;
          submitted_at: string | null;
          location: string;
          work_description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          crew_id: string;
          member_id: string;
          date: string;
          start_time: string;
          end_time: string;
          work_package_id?: string | null;
          hours_regular?: number;
          hours_overtime?: number;
          status?: 'draft' | 'submitted' | 'approved' | 'rejected';
          comments?: string | null;
          gps_locations?: any[];
          submitted_by?: string | null;
          submitted_at?: string | null;
          location?: string;
          work_description?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          crew_id?: string;
          member_id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          work_package_id?: string | null;
          hours_regular?: number;
          hours_overtime?: number;
          status?: 'draft' | 'submitted' | 'approved' | 'rejected';
          comments?: string | null;
          gps_locations?: any[];
          submitted_by?: string | null;
          submitted_at?: string | null;
          location?: string;
          work_description?: string;
          created_at?: string;
        };
      };
      exceptions: {
        Row: {
          id: string;
          time_entry_id: string;
          flagged_by: string;
          reason: string;
          description: string;
          status: 'submitted' | 'under_review' | 'accepted' | 'rejected';
          admin_notes: string | null;
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          time_entry_id: string;
          flagged_by: string;
          reason: string;
          description: string;
          status?: 'submitted' | 'under_review' | 'accepted' | 'rejected';
          admin_notes?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          time_entry_id?: string;
          flagged_by?: string;
          reason?: string;
          description?: string;
          status?: 'submitted' | 'under_review' | 'accepted' | 'rejected';
          admin_notes?: string | null;
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];