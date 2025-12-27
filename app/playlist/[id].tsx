import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { getPlaylistSongs, getUserDownloads } from '@/lib/supabase';
import { PlaylistSong } from '@/types/database';
import SongCard from '@/components/SongCard';
import MusicPlayer from '@/components/MusicPlayer';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMusic } from '@/contexts/MusicContext';
import { useAuth } from '@/contexts/AuthContext';

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [playlistSongs, setPlaylistSongs] = useState<PlaylistSong[]>([]);
  const [downloadedSongIds, setDownloadedSongIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { setQueue } = useMusic();
  const { user } = useAuth();

  const fetchPlaylistSongs = async () => {
    if (!id) return;

    try {
      const { data, error } = await getPlaylistSongs(id);
      if (data) {
        setPlaylistSongs(data);
      }

      if (user) {
        const { data: downloads } = await getUserDownloads(user.id);
        if (downloads) {
          const ids = new Set(downloads.map(d => d.song_id));
          setDownloadedSongIds(ids);
        }
      }
    } catch (error) {
      console.error('Error fetching playlist songs:', error);
      Alert.alert('Error', 'Failed to load playlist');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlaylistSongs();
  }, [id, user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlaylistSongs();
  };

  const handlePlaySong = (index: number) => {
    const songs = playlistSongs.map(ps => ps.song).filter(s => s) as any[];
    setQueue(songs, index);
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading playlist...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <>
      <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Playlist</Text>
          <Text style={styles.subtitle}>{playlistSongs.length} songs</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {playlistSongs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No songs in this playlist</Text>
              <Text style={styles.emptySubtext}>
                Add songs from the home or search screens
              </Text>
            </View>
          ) : (
            <View style={styles.songsContainer}>
              {playlistSongs.map((playlistSong, index) => (
                <SongCard
                  key={playlistSong.id}
                  song={playlistSong.song!}
                  showFavorite
                  isDownloaded={downloadedSongIds.has(playlistSong.song_id)}
                  onPlayPress={() => handlePlaySong(index)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </LinearGradient>
      <MusicPlayer />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: 'center',
    flexDirection: 'column',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 60,
    padding: 8,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
  },
  subtitle: {
    color: '#b3b3b3',
    fontSize: 16,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#b3b3b3',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  songsContainer: {
    gap: 8,
  },
});
