import React, { createContext, useContext, useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import { Song } from '@/types/database';

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  queue: Song[];
  currentIndex: number;
  isShuffled: boolean;
  repeatMode: 'none' | 'one' | 'all';
  playSong: (song: Song, queue?: Song[]) => Promise<void>;
  pauseSong: () => Promise<void>;
  resumeSong: () => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setQueue: (songs: Song[], startIndex?: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueueState] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (sound && isPlaying) {
      interval = setInterval(async () => {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setPosition(status.positionMillis || 0);
          setDuration(status.durationMillis || 0);
          
          // Auto play next song when current song ends
          if (status.didJustFinish) {
            if (repeatMode === 'one') {
              await sound.replayAsync();
            } else {
              playNext();
            }
          }
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sound, isPlaying, repeatMode]);

  const playSong = async (song: Song, newQueue?: Song[]) => {
    try {
      // Unload previous sound
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // Update queue if provided
      if (newQueue) {
        setQueueState(newQueue);
        const index = newQueue.findIndex(s => s.id === song.id);
        setCurrentIndex(index !== -1 ? index : 0);
      }

      // Create and play new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.file_url },
        { 
          shouldPlay: true,
          volume: 1.0,
          rate: 1.0,
          shouldCorrectPitch: true,
        }
      );

      setSound(newSound);
      setCurrentSong(song);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing song:', error);
      // Try to continue with next song if current fails
      if (newQueue && newQueue.length > 1) {
        const nextIndex = (currentIndex + 1) % newQueue.length;
        const nextSong = newQueue[nextIndex];
        if (nextSong && nextSong.id !== song.id) {
          setTimeout(() => playSong(nextSong, newQueue), 1000);
        }
      }
    }
  };

  const pauseSong = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const resumeSong = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const playNext = async () => {
    if (queue.length === 0) return;
    
    let nextIndex = currentIndex + 1;
    
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return;
      }
    }
    
    setCurrentIndex(nextIndex);
    await playSong(queue[nextIndex]);
  };

  const playPrevious = async () => {
    if (queue.length === 0) return;
    
    let prevIndex = currentIndex - 1;
    
    if (prevIndex < 0) {
      if (repeatMode === 'all') {
        prevIndex = queue.length - 1;
      } else {
        return;
      }
    }
    
    setCurrentIndex(prevIndex);
    await playSong(queue[prevIndex]);
  };

  const seekTo = async (pos: number) => {
    if (sound) {
      await sound.setPositionAsync(pos);
      setPosition(pos);
    }
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
    // Implement shuffle logic here if needed
  };

  const toggleRepeat = () => {
    const modes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
    const currentModeIndex = modes.indexOf(repeatMode);
    const nextModeIndex = (currentModeIndex + 1) % modes.length;
    setRepeatMode(modes[nextModeIndex]);
  };

  const setQueue = (songs: Song[], startIndex: number = 0) => {
    setQueueState(songs);
    setCurrentIndex(startIndex);
  };

  return (
    <MusicContext.Provider value={{
      currentSong,
      isPlaying,
      position,
      duration,
      queue,
      currentIndex,
      isShuffled,
      repeatMode,
      playSong,
      pauseSong,
      resumeSong,
      playNext,
      playPrevious,
      seekTo,
      toggleShuffle,
      toggleRepeat,
      setQueue,
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}