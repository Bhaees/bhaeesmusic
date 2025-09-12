import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Music } from 'lucide-react-native';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  style?: any;
}

export default function Logo({ size = 'medium', showText = true, style }: LogoProps) {
  const dimensions = {
    small: { container: 40, icon: 20, text: 16 },
    medium: { container: 60, icon: 30, text: 24 },
    large: { container: 120, icon: 60, text: 32 }
  };

  const currentSize = dimensions[size];

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={['#1DB954', '#1ed760', '#00d4aa']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.iconContainer,
          {
            width: currentSize.container,
            height: currentSize.container,
            borderRadius: currentSize.container / 2,
          }
        ]}
      >
        <View style={styles.iconBackground}>
          <Music 
            size={currentSize.icon} 
            color="#fff" 
            strokeWidth={2.5}
          />
        </View>
        
        {/* Decorative elements */}
        <View style={[styles.decorativeCircle, styles.circle1]} />
        <View style={[styles.decorativeCircle, styles.circle2]} />
        <View style={[styles.decorativeCircle, styles.circle3]} />
      </LinearGradient>
      
      {showText && (
        <Text style={[styles.logoText, { fontSize: currentSize.text }]}>
          BhaeBeats
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#1DB954',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  iconBackground: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  decorativeCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
  },
  circle1: {
    width: 8,
    height: 8,
    top: '20%',
    right: '15%',
  },
  circle2: {
    width: 4,
    height: 4,
    bottom: '25%',
    left: '20%',
  },
  circle3: {
    width: 6,
    height: 6,
    top: '60%',
    right: '25%',
  },
  logoText: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 12,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});