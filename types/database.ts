export interface User {
  id: string;
  email: string;
  credits: number;
  subscription_plan: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover_url: string;
  file_url: string;
  duration: number;
  created_at: string;
  uploaded_by?: string;
}

export interface Download {
  id: string;
  user_id: string;
  song_id: string;
  timestamp: string;
  song?: Song;
}

export interface Transaction {
  id: string;
  user_id: string;
  plan: string;
  amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  credits_added: number;
  stripe_session_id?: string;
  created_at: string;
}

export interface CreditPlan {
  id: string;
  name: string;
  credits: number;
  price: number;
  description: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  song_id: string;
  created_at: string;
  song?: Song;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  song_count?: number;
}

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  position: number;
  added_at: string;
  song?: Song;
}