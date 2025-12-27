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
    // Create user profile with starter credits
    const { error: insertError } = await supabase!
      .from('users')
      .insert([
        {
          id: data.user.id,
          email,
          credits: 5,
          subscription_plan: 'free',
          role: 'user',
        }
      ]);

    if (insertError) {
      console.error('Error creating user profile:', insertError);
    }
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

export const getFavorites = async (userId: string) => {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase!
    .from('favorites')
    .select(`
      *,
      song:songs(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return { data, error };
};

export const toggleFavorite = async (songId: string) => {
  if (!isSupabaseConfigured()) {
    return { data: { isFavorited: true }, error: null };
  }

  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: existing } = await supabase!
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('song_id', songId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase!
      .from('favorites')
      .delete()
      .eq('id', existing.id);
    return { data: { isFavorited: false }, error };
  } else {
    const { error } = await supabase!
      .from('favorites')
      .insert([{ user_id: user.id, song_id: songId }]);
    return { data: { isFavorited: true }, error };
  }
};

export const isFavoriteSong = async (songId: string) => {
  if (!isSupabaseConfigured()) {
    return { data: false, error: null };
  }

  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) return { data: false, error: null };

  const { data, error } = await supabase!
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('song_id', songId)
    .maybeSingle();

  return { data: !!data, error };
};

export const getUserPlaylists = async (userId: string) => {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase!
    .from('playlists')
    .select(`
      *,
      playlist_songs(count)
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  const playlists = data?.map(p => ({
    ...p,
    song_count: p.playlist_songs?.[0]?.count || 0
  }));

  return { data: playlists || [], error };
};

export const createPlaylist = async (name: string, description?: string) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null };
  }

  const { data: { user } } = await supabase!.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase!
    .from('playlists')
    .insert([{
      user_id: user.id,
      name,
      description: description || null
    }])
    .select()
    .single();

  return { data, error };
};

export const updatePlaylist = async (playlistId: string, name: string, description?: string) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null };
  }

  const { data, error } = await supabase!
    .from('playlists')
    .update({
      name,
      description: description || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', playlistId)
    .select()
    .single();

  return { data, error };
};

export const deletePlaylist = async (playlistId: string) => {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }

  const { error } = await supabase!
    .from('playlists')
    .delete()
    .eq('id', playlistId);

  return { error };
};

export const getPlaylistSongs = async (playlistId: string) => {
  if (!isSupabaseConfigured()) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase!
    .from('playlist_songs')
    .select(`
      *,
      song:songs(*)
    `)
    .eq('playlist_id', playlistId)
    .order('position');

  return { data, error };
};

export const addSongToPlaylist = async (playlistId: string, songId: string) => {
  if (!isSupabaseConfigured()) {
    return { data: null, error: null };
  }

  const { data: maxPosition } = await supabase!
    .from('playlist_songs')
    .select('position')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (maxPosition?.position || 0) + 1;

  const { data, error } = await supabase!
    .from('playlist_songs')
    .insert([{
      playlist_id: playlistId,
      song_id: songId,
      position: nextPosition
    }])
    .select()
    .single();

  return { data, error };
};

export const removeSongFromPlaylist = async (playlistSongId: string) => {
  if (!isSupabaseConfigured()) {
    return { error: null };
  }

  const { error } = await supabase!
    .from('playlist_songs')
    .delete()
    .eq('id', playlistSongId);

  return { error };
};

export const getDownloadStats = async (userId: string) => {
  if (!isSupabaseConfigured()) {
    return {
      data: {
        total_downloads: 0,
        total_credits_spent: 0,
        favorite_artist: null
      },
      error: null
    };
  }

  const { data: downloads, error: downloadError } = await supabase!
    .from('downloads')
    .select(`
      id,
      song:songs(artist)
    `)
    .eq('user_id', userId);

  if (downloadError || !downloads) {
    return { data: null, error: downloadError };
  }

  const artistCounts: Record<string, number> = {};
  let favorite_artist = null;
  let maxCount = 0;

  downloads.forEach(d => {
    if (d.song?.artist) {
      artistCounts[d.song.artist] = (artistCounts[d.song.artist] || 0) + 1;
      if (artistCounts[d.song.artist] > maxCount) {
        maxCount = artistCounts[d.song.artist];
        favorite_artist = d.song.artist;
      }
    }
  });

  const data = {
    total_downloads: downloads.length,
    total_credits_spent: downloads.length,
    favorite_artist
  };

  return { data, error: null };
};