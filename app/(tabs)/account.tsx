import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LogOut, CreditCard, Shield } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

const CREDIT_PLANS = [
  { id: '5_credits', name: '5 Credits', credits: 5, price: 5, description: '5 song downloads' },
  { id: '25_credits', name: '25 Credits', credits: 25, price: 25, description: '25 song downloads' },
  { id: '50_credits', name: '50 Credits', credits: 50, price: 50, description: '50 song downloads' },
];

export default function AccountScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: signOut, style: 'destructive' },
      ]
    );
  };

  const handlePurchaseCredits = (plan: typeof CREDIT_PLANS[0]) => {
    Alert.alert(
      'Purchase Credits',
      `Purchase ${plan.credits} credits for $${plan.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Purchase', 
          onPress: () => {
            // This will be implemented with Stripe
            Alert.alert('Coming Soon', 'Stripe integration will be added for credit purchases');
          }
        },
      ]
    );
  };

  if (!user) return null;

  return (
    <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Account</Text>
      </View>

      <View style={styles.content}>
        {/* User Info */}
        <View style={styles.section}>
          <View style={styles.userInfo}>
            <Text style={styles.email}>{user.email}</Text>
            <View style={styles.creditsContainer}>
              <CreditCard size={20} color="#1DB954" />
              <Text style={styles.creditsText}>
                {user.credits} credit{user.credits !== 1 ? 's' : ''} available
              </Text>
            </View>
            {user.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Shield size={16} color="#ff6b35" />
                <Text style={styles.adminText}>Admin</Text>
              </View>
            )}
          </View>
        </View>

        {/* Credit Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Purchase Credits</Text>
          <Text style={styles.sectionDescription}>
            Credits are used to download songs for offline listening. No free trial available.
          </Text>
          
          {CREDIT_PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={styles.planCard}
              onPress={() => handlePurchaseCredits(plan)}
            >
              <View style={styles.planInfo}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planDescription}>{plan.description}</Text>
              </View>
              <Text style={styles.planPrice}>${plan.price}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Admin Panel */}
        {user.role === 'admin' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Admin Panel</Text>
            <TouchableOpacity 
              style={styles.adminButton}
              onPress={() => Alert.alert('Coming Soon', 'Admin panel will be implemented')}
            >
              <Text style={styles.adminButtonText}>Manage Songs & Users</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color="#fff" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  userInfo: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 12,
  },
  email: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creditsText: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: '600',
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  adminText: {
    color: '#ff6b35',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    color: '#b3b3b3',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  planCard: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  planDescription: {
    color: '#b3b3b3',
    fontSize: 14,
  },
  planPrice: {
    color: '#1DB954',
    fontSize: 18,
    fontWeight: 'bold',
  },
  adminButton: {
    backgroundColor: '#ff6b35',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});