import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Download as DownloadIcon, Check } from 'lucide-react-native';
import { Song } from '@/types/database';
import { useMusic } from '@/contexts/MusicContext';
import { useAuth } from '@/contexts/AuthContext';
import { downloadSong } from '@/lib/supabase';

interface SongCardProps {
  song: Song;
  showDownload?: boolean;
  isDownloaded?: boolean;
  onPlayPress?: () => void;
  onDownloadPress?: () => void;
}

export default function SongCard({ 
  song, 
  showDownload = false, 
  isDownloaded = false,
  onPlayPress,
  onDownloadPress 
}: SongCardProps) {
  const { playSong } = useMusic();
  const { user, refreshUser } = useAuth();

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    if (onPlayPress) {
      onPlayPress();
    } else {
      playSong(song);
    }
  };

  const handleDownload = async () => {
    if (onDownloadPress) {
      onDownloadPress();
      return;
    }

    if (!user || user.credits < 1) {
      alert('Insufficient credits. Please purchase more credits to download songs.');
      return;
    }

    try {
      const { data, error } = await downloadSong(song.id);
      
      if (error) {
        alert('Error downloading song: ' + error.message);
        return;
      }

      if (data?.success) {
        alert('Song downloaded successfully!');
        refreshUser();
      } else {
        alert(data?.error || 'Failed to download song');
      }
    } catch (error) {
      alert('Error downloading song');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: song.cover_url }} style={styles.cover} />
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {song.artist}
        </Text>
        <Text style={styles.album} numberOfLines={1}>
          {song.album}
        </Text>
        <Text style={styles.duration}>
          {formatDuration(song.duration)}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.playButton} 
          onPress={handlePlay}
        >
          <Play size={20} color="#fff" fill="#fff" />
        </TouchableOpacity>
        
        {showDownload && (
          <TouchableOpacity 
            style={[
              styles.downloadButton,
              isDownloaded && styles.downloadedButton
            ]} 
            onPress={handleDownload}
            disabled={isDownloaded || (user?.credits || 0) < 1}
          >
            {isDownloaded ? (
              <Check size={20} color="#1DB954" />
            ) : (
              <DownloadIcon 
                size={20} 
                color={(user?.credits || 0) < 1 ? "#666" : "#fff"} 
              />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#1a1a1a',
    marginBottom: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  cover: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  artist: {
    color: '#b3b3b3',
    fontSize: 14,
    marginBottom: 2,
  },
  album: {
    color: '#666',
    fontSize: 12,
    marginBottom: 2,
  },
  duration: {
    color: '#666',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadedButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#1DB954',
  },
});