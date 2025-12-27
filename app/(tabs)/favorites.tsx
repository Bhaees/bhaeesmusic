import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart } from 'lucide-react-native';
import { getFavorites } from '@/lib/supabase';
import { Favorite } from '@/types/database';
import SongCard from '@/components/SongCard';
import MusicPlayer from '@/components/MusicPlayer';
import { useMusic } from '@/contexts/MusicContext';
import { useAuth } from '@/contexts/AuthContext';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { setQueue } = useMusic();
  const { user } = useAuth();

  const fetchFavorites = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await getFavorites(user.id);
      if (data) {
        setFavorites(data);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  const handlePlaySong = (index: number) => {
    const songs = favorites.map(f => f.song!).filter(s => s);
    setQueue(songs, index);
  };

  const handleFavoriteRemoved = () => {
    fetchFavorites();
  };

  if (!user) {
    return (
      <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']} style={styles.container}>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>Please log in to view your favorites</Text>
        </View>
      </LinearGradient>
    );
  }

  if (loading) {
    return (
      <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading favorites...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <>
      <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']} style={styles.container}>
        <View style={styles.header}>
          <Heart size={32} color="#FF4458" fill="#FF4458" />
          <Text style={styles.title}>Favorites</Text>
          <Text style={styles.subtitle}>{favorites.length} songs</Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {favorites.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Heart size={48} color="#666" />
              <Text style={styles.emptyText}>No favorites yet</Text>
              <Text style={styles.emptySubtext}>
                Mark songs as favorites to see them here
              </Text>
            </View>
          ) : (
            <View style={styles.songsContainer}>
              {favorites.map((favorite, index) => (
                <SongCard
                  key={favorite.id}
                  song={favorite.song!}
                  showFavorite
                  onPlayPress={() => handlePlaySong(index)}
                  onFavoriteToggle={handleFavoriteRemoved}
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
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  messageText: {
    color: '#b3b3b3',
    fontSize: 18,
    textAlign: 'center',
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
    marginTop: 16,
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
