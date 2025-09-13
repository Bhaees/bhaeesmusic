import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { Song } from '../types/database';

// Demo data for when Supabase is not configured
const DEMO_SONGS: Song[] = [
  {
    id: '1',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    cover_url: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
    file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 200,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: '÷ (Divide)',
    cover_url: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg',
    file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 233,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Bad Habits',
    artist: 'Ed Sheeran',
    album: '= (Equals)',
    cover_url: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg',
    file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 231,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Stay',
    artist: 'The Kid LAROI & Justin Bieber',
    album: 'Stay',
    cover_url: 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg',
    file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 141,
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Good 4 U',
    artist: 'Olivia Rodrigo',
    album: 'SOUR',
    cover_url: 'https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg',
    file_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
    duration: 178,
    created_at: new Date().toISOString(),
  }
];

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Only create Supabase client if real credentials are provided (not placeholders)
export const supabase = supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('your-project') && 
  !supabaseAnonKey.includes('your-anon-key')
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return supabase !== null && 
    supabaseUrl && 
    supabaseAnonKey && 
    !supabaseUrl.includes('your-project') && 
    !supabaseAnonKey.includes('your-anon-key');
};

// Create a mock auth object for demo mode
const createMockAuth = () => ({
  getSession: async () => ({ data: { session: null }, error: null }),
  onAuthStateChange: (callback: any) => {
    // Call callback immediately with no session for demo
    callback('SIGNED_OUT', null);
    return { data: { subscription: { unsubscribe: () => {} } } };
  },
  signUp: async (credentials: any) => ({
    data: { user: { id: 'demo-user', email: credentials.email } },
    error: null
  }),
  signInWithPassword: async (credentials: any) => ({
    data: { user: { id: 'demo-user', email: credentials.email } },
    error: null
  }),
  signOut: async () => ({ error: null }),
  getUser: async () => ({
    data: { user: { id: 'demo-user', email: 'demo@example.com' } },
    error: null
  })
});

// Export auth object - either real Supabase auth or mock auth
export const auth = isSupabaseConfigured() ? supabase!.auth : createMockAuth();

// Auth helper functions
export const signUp = async (email: string, password: string) => {
  if (!isSupabaseConfigured()) {
    return { 
      data: { user: { id: 'demo-user', email } }, 
      error: null 
    };
  }

  const { data, error } = await supabase!.auth.signUp({
    email,
    password,
  });
  
  if (data.user && !error) {
    // Create user profile
    await supabase!
      .from('users')
      .insert([
        {
          id: data.user.id,
          email,
          credits: 0,
          subscription_plan: 'free',
          role: 'user',
        }
      ]);
  }
  
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  if (!isSupabaseConfigured()) {
    return { 
      data: { user: { id: 'demo-user', email } }, 
      error: null 
    };
  }

  return await supabase!.auth.signInWithPassword({
    email,
    password,
  });
};

export const signOut = async () => {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }

  return await supabase!.auth.signOut();
};

// Music functions
export const getSongs = async () => {
  if (!isSupabaseConfigured()) {
    // Return demo data when Supabase is not configured
    return { data: DEMO_SONGS, error: null };
  }

  const { data, error } = await supabase!
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const searchSongs = async (query: string) => {
  if (!isSupabaseConfigured()) {
    // Filter demo songs based on query
    const filteredSongs = DEMO_SONGS.filter(song =>
      song.title.toLowerCase().includes(query.toLowerCase()) ||
      song.artist.toLowerCase().includes(query.toLowerCase()) ||
      song.album.toLowerCase().includes(query.toLowerCase())
    );
    return { data: filteredSongs, error: null };
  }

  const { data, error } = await supabase!
    .from('songs')
    .select('*')
    .or(`title.ilike.%${query}%,artist.ilike.%${query}%,album.ilike.%${query}%`)
    .order('title');
  
  return { data, error };
};

export const getUserDownloads = async (userId: string) => {
  if (!isSupabaseConfigured()) {
    // Return empty downloads for demo
    return { data: [], error: null };
  }

  const { data, error } = await supabase!
    .from('downloads')
    .select(`
      *,
      song:songs(*)
    `)
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });
  
  return { data, error };
};

export const downloadSong = async (songId: string) => {
  if (!isSupabaseConfigured()) {
    return { 
      data: { success: true }, 
      error: null 
    };
  }

  const { data, error } = await supabase!.rpc('handle_song_download', {
    song_uuid: songId
  });
  
  return { data, error };
};

export const getUserProfile = async (userId: string) => {
  if (!isSupabaseConfigured()) {
    return { 
      data: {
        id: userId,
        email: 'demo@example.com',
        credits: 10,
        subscription_plan: 'free',
        role: 'user',
        created_at: new Date().toISOString()
      }, 
      error: null 
    };
  }

  const { data, error } = await supabase!
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
};

export const createTransaction = async (plan: string, amount: number, creditsAdded: number, sessionId: string) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null };
  }

  const { data: { user } } = await supabase!.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase!
    .from('transactions')
    .insert([
      {
        user_id: user.id,
        plan,
        amount,
        credits_added: creditsAdded,
        stripe_session_id: sessionId,
        payment_status: 'pending'
      }
    ]);
  
  return { data, error };
};