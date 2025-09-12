import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (data.user && !error) {
    // Create user profile
    await supabase
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
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

// Music functions
export const getSongs = async () => {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const searchSongs = async (query: string) => {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .or(`title.ilike.%${query}%,artist.ilike.%${query}%,album.ilike.%${query}%`)
    .order('title');
  
  return { data, error };
};

export const getUserDownloads = async (userId: string) => {
  const { data, error } = await supabase
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
  const { data, error } = await supabase.rpc('handle_song_download', {
    song_uuid: songId
  });
  
  return { data, error };
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
};

export const createTransaction = async (plan: string, amount: number, creditsAdded: number, sessionId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('User not authenticated');
  
  const { data, error } = await supabase
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