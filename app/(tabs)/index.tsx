import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getSongs } from '@/lib/supabase';
import { Song } from '@/types/database';
import SongCard from '@/components/SongCard';
import MusicPlayer from '@/components/MusicPlayer';
import Logo from '@/components/Logo';
import { useMusic } from '@/contexts/MusicContext';

export default function HomeScreen() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { setQueue } = useMusic();

  const fetchSongs = async () => {
    try {
      const { data, error } = await getSongs();
      if (data) {
        setSongs(data);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSongs();
  };

  const handlePlaySong = (song: Song) => {
    const songIndex = songs.findIndex(s => s.id === song.id);
    setQueue(songs, songIndex);
  };

  if (loading) {
    return (
      <LinearGradient colors={['#1a1a1a', '#2d1b69']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Logo size="large" />
          <Text style={styles.loadingText}>Loading music...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <>
      <LinearGradient colors={['#1a1a1a', '#2d1b69']} style={styles.container}>
        <View style={styles.header}>
          <Logo size="medium" showText={false} />
          <Text style={styles.title}>BhaeBeats</Text>
          <Text style={styles.subtitle}>Discover amazing music</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {songs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No songs available</Text>
              <Text style={styles.emptySubtext}>
                Pull down to refresh or check back later
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>Featured Songs</Text>
              <View style={styles.songsContainer}>
                {songs.map((song) => (
                  <SongCard
                    key={song.id}
                    song={song}
                    showDownload
                    onPlayPress={() => handlePlaySong(song)}
                  />
                ))}
              </View>
            </>
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
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 12,
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
    marginTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
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
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#b3b3b3',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  songsContainer: {
    gap: 8,
  },
});