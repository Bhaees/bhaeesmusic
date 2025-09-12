export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          credits: number;
          subscription_plan: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          credits?: number;
          subscription_plan?: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          credits?: number;
          subscription_plan?: string;
          role?: string;
          created_at?: string;
        };
      };
      songs: {
        Row: {
          id: string;
          title: string;
          artist: string;
          album: string;
          cover_url: string;
          file_url: string;
          duration: number;
          created_at: string;
          uploaded_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          artist: string;
          album: string;
          cover_url: string;
          file_url: string;
          duration: number;
          created_at?: string;
          uploaded_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          artist?: string;
          album?: string;
          cover_url?: string;
          file_url?: string;
          duration?: number;
          created_at?: string;
          uploaded_by?: string | null;
        };
      };
      downloads: {
        Row: {
          id: string;
          user_id: string;
          song_id: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          song_id: string;
          timestamp?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          song_id?: string;
          timestamp?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          plan: string;
          amount: number;
          payment_status: string;
          credits_added: number;
          stripe_session_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan: string;
          amount: number;
          payment_status?: string;
          credits_added: number;
          stripe_session_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan?: string;
          amount?: number;
          payment_status?: string;
          credits_added?: number;
          stripe_session_id?: string | null;
          created_at?: string;
        };
      };
    };
    Functions: {
      handle_song_download: {
        Args: {
          song_uuid: string;
        };
        Returns: any;
      };
      process_payment_success: {
        Args: {
          session_id: string;
        };
        Returns: any;
      };
    };
  };
}