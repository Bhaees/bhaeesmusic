import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useMusic } from '@/contexts/MusicContext';

export default function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    position,
    duration,
    playNext,
    playPrevious,
    pauseSong,
    resumeSong,
    toggleShuffle,
    toggleRepeat,
    isShuffled,
    repeatMode,
  } = useMusic();

  if (!currentSong) return null;

  const progress = duration > 0 ? position / duration : 0;

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: withSpring(`${progress * 100}%`),
  }));

  const getRepeatColor = () => {
    switch (repeatMode) {
      case 'one': return '#1DB954';
      case 'all': return '#1DB954';
      default: return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
      </View>
      
      <View style={styles.content}>
        <Image source={{ uri: currentSong.cover_url }} style={styles.cover} />
        
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>

        <View style={styles.timeInfo}>
          <Text style={styles.time}>
            {formatTime(position)}
          </Text>
          <Text style={styles.time}>
            {formatTime(duration)}
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={toggleShuffle}
        >
          <Shuffle 
            size={18} 
            color={isShuffled ? '#1DB954' : '#666'} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={playPrevious}
        >
          <SkipBack size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.playButton}
          onPress={isPlaying ? pauseSong : resumeSong}
        >
          {isPlaying ? (
            <Pause size={24} color="#000" />
          ) : (
            <Play size={24} color="#000" fill="#000" />
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={playNext}
        >
          <SkipForward size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={toggleRepeat}
        >
          <Repeat 
            size={18} 
            color={getRepeatColor()} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    backdropFilter: 'blur(20px)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  progressBar: {
    height: 3,
    backgroundColor: '#333',
    borderRadius: 1.5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: 1.5,
  },
  content: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  cover: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  artist: {
    color: '#b3b3b3',
    fontSize: 12,
  },
  timeInfo: {
    alignItems: 'flex-end',
  },
  time: {
    color: '#666',
    fontSize: 11,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 20,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
  },
});