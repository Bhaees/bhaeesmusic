import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search as SearchIcon } from 'lucide-react-native';
import { searchSongs } from '@/lib/supabase';
import { Song } from '@/types/database';
import SongCard from '@/components/SongCard';
import MusicPlayer from '@/components/MusicPlayer';
import { useMusic } from '@/contexts/MusicContext';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const { setQueue } = useMusic();

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const delayedSearch = setTimeout(async () => {
      setLoading(true);
      try {
        const { data, error } = await searchSongs(query);
        if (data) {
          setResults(data);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query]);

  const handlePlaySong = (song: Song) => {
    const songIndex = results.findIndex(s => s.id === song.id);
    setQueue(results, songIndex);
  };

  return (
    <>
      <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Search</Text>
          
          <View style={styles.searchContainer}>
            <SearchIcon size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search songs, artists, albums..."
              placeholderTextColor="#666"
              value={query}
              onChangeText={setQuery}
            />
          </View>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {loading && (
            <Text style={styles.loadingText}>Searching...</Text>
          )}
          
          {!loading && query && results.length === 0 && (
            <Text style={styles.noResultsText}>No results found</Text>
          )}
          
          {!loading && query === '' && (
            <Text style={styles.emptyText}>Start typing to search for music</Text>
          )}

          <View style={styles.resultsContainer}>
            {results.map((song) => (
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 12,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingText: {
    color: '#b3b3b3',
    textAlign: 'center',
    marginTop: 32,
  },
  noResultsText: {
    color: '#b3b3b3',
    textAlign: 'center',
    marginTop: 32,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 32,
  },
  resultsContainer: {
    gap: 8,
  },
});