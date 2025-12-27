import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Music, Plus, Trash2, Edit2 } from 'lucide-react-native';
import { getUserPlaylists, createPlaylist, deletePlaylist, updatePlaylist } from '@/lib/supabase';
import { Playlist } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function PlaylistsScreen() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const fetchPlaylists = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await getUserPlaylists(user.id);
      if (data) {
        setPlaylists(data);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPlaylists();
  };

  const handleCreatePlaylist = async () => {
    if (!playlistName.trim()) {
      Alert.alert('Error', 'Playlist name is required');
      return;
    }

    try {
      if (editingPlaylist) {
        const { error } = await updatePlaylist(editingPlaylist.id, playlistName, playlistDesc);
        if (error) {
          Alert.alert('Error', 'Failed to update playlist');
          return;
        }
      } else {
        const { error } = await createPlaylist(playlistName, playlistDesc);
        if (error) {
          Alert.alert('Error', 'Failed to create playlist');
          return;
        }
      }

      setPlaylistName('');
      setPlaylistDesc('');
      setEditingPlaylist(null);
      setShowCreateModal(false);
      fetchPlaylists();
    } catch (error) {
      Alert.alert('Error', 'An error occurred');
      console.error(error);
    }
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    Alert.alert('Delete Playlist', 'Are you sure you want to delete this playlist?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await deletePlaylist(playlistId);
          if (error) {
            Alert.alert('Error', 'Failed to delete playlist');
          } else {
            fetchPlaylists();
          }
        },
      },
    ]);
  };

  const handleEditPlaylist = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setPlaylistName(playlist.name);
    setPlaylistDesc(playlist.description || '');
    setShowCreateModal(true);
  };

  const handleSelectPlaylist = (playlistId: string) => {
    router.push(`/playlist/${playlistId}`);
  };

  const openCreateModal = () => {
    setEditingPlaylist(null);
    setPlaylistName('');
    setPlaylistDesc('');
    setShowCreateModal(true);
  };

  if (!user) {
    return (
      <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']} style={styles.container}>
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>Please log in to manage playlists</Text>
        </View>
      </LinearGradient>
    );
  }

  if (loading) {
    return (
      <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading playlists...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']} style={styles.container}>
      <View style={styles.header}>
        <Music size={32} color="#1DB954" />
        <Text style={styles.title}>Playlists</Text>
        <Text style={styles.subtitle}>{playlists.length} playlists</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {playlists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Music size={48} color="#666" />
            <Text style={styles.emptyText}>No playlists yet</Text>
            <Text style={styles.emptySubtext}>
              Create a playlist to organize your favorite songs
            </Text>
          </View>
        ) : (
          <View style={styles.playlistsContainer}>
            {playlists.map((playlist) => (
              <TouchableOpacity
                key={playlist.id}
                style={styles.playlistCard}
                onPress={() => handleSelectPlaylist(playlist.id)}
              >
                <View style={styles.playlistContent}>
                  <Music size={24} color="#1DB954" />
                  <View style={styles.playlistInfo}>
                    <Text style={styles.playlistName}>{playlist.name}</Text>
                    <Text style={styles.playlistMeta}>
                      {playlist.song_count || 0} songs
                    </Text>
                  </View>
                </View>

                <View style={styles.playlistActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditPlaylist(playlist)}
                  >
                    <Edit2 size={18} color="#666" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeletePlaylist(playlist.id)}
                  >
                    <Trash2 size={18} color="#FF4458" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.createButton}
        onPress={openCreateModal}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingPlaylist ? 'Edit Playlist' : 'New Playlist'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Playlist name"
              placeholderTextColor="#666"
              value={playlistName}
              onChangeText={setPlaylistName}
            />

            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Description (optional)"
              placeholderTextColor="#666"
              value={playlistDesc}
              onChangeText={setPlaylistDesc}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.createModalButton}
                onPress={handleCreatePlaylist}
              >
                <Text style={styles.createModalButtonText}>
                  {editingPlaylist ? 'Update' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Modal>
    </LinearGradient>
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
    paddingBottom: 100,
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
  playlistsContainer: {
    gap: 12,
  },
  playlistCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playlistContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playlistInfo: {
    marginLeft: 12,
    flex: 1,
  },
  playlistName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  playlistMeta: {
    color: '#666',
    fontSize: 12,
  },
  playlistActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginBottom: 12,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
