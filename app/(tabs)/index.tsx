import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getSongs } from '@/lib/supabase';
import { Song } from '@/types/database';
import SongCard from '@/components/SongCard';
import MusicPlayer from '@/components/MusicPlayer';
import { useMusic } from '@/contexts/MusicContext';
import Logo from '@/components/Logo';

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
        setQueue(data);
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
          <Text style={styles.loadingText}>Loading music...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <>
      <LinearGradient colors={['#1a1a1a', '#2d1b69']} style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <Logo size="medium" showText={false} />
            <Text style={styles.appName}>BhaeBeats</Text>
          </View>
          
          <Text style={styles.greeting}>Good evening</Text>
          <Text style={styles.title}>Featured Music</Text>
          
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
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  appName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  greeting: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  songsContainer: {
    gap: 8,
  },
});