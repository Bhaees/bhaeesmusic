import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getUserDownloads } from '@/lib/supabase';
import { Download } from '@/types/database';
import SongCard from '@/components/SongCard';
import MusicPlayer from '@/components/MusicPlayer';
import { useAuth } from '@/contexts/AuthContext';
import { useMusic } from '@/contexts/MusicContext';

export default function DownloadsScreen() {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const { setQueue } = useMusic();

  const fetchDownloads = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await getUserDownloads(user.id);
      if (data) {
        setDownloads(data);
      }
    } catch (error) {
      console.error('Error fetching downloads:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDownloads();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDownloads();
  };

  const handlePlaySong = (download: Download) => {
    if (!download.song) return;
    
    const songs = downloads.map(d => d.song!).filter(Boolean);
    const songIndex = songs.findIndex(s => s.id === download.song!.id);
    setQueue(songs, songIndex);
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading downloads...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <>
      <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Downloads</Text>
          <Text style={styles.subtitle}>
            {downloads.length} song{downloads.length !== 1 ? 's' : ''} downloaded
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {downloads.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No downloads yet</Text>
              <Text style={styles.emptySubtext}>
                Download songs from the Home or Search tabs to access them offline
              </Text>
            </View>
          ) : (
            <View style={styles.downloadsContainer}>
              {downloads.map((download) => (
                download.song && (
                  <SongCard
                    key={download.id}
                    song={download.song}
                    isDownloaded
                    onPlayPress={() => handlePlaySong(download)}
                  />
                )
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
    paddingBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#b3b3b3',
    fontSize: 16,
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
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#b3b3b3',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  downloadsContainer: {
    gap: 8,
  },
});