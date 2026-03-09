import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { subscribeToRoom, deleteRoom } from '../lib/roomManager';

function CodeChar({ char, index }: { char: string; index: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
      delay: index * 80,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.codeBox,
        {
          transform: [
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
          ],
          opacity: anim,
        },
      ]}
    >
      <LinearGradient
        colors={['#1c1c35', '#13132a']}
        style={styles.codeBoxGradient}
      >
        <Text style={styles.codeChar}>{char}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

function WaitingDots() {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.spring(dot, { toValue: 1, useNativeDriver: true, tension: 120, friction: 4 }),
          Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.delay(400),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.dotsRow}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.2, 1] }),
              transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }],
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function LobbyScreen() {
  const router = useRouter();
  const { roomCode, playerNumber, username, uid } = useLocalSearchParams<{
    roomCode: string;
    playerNumber: string;
    username: string;
    uid: string;
  }>();

  const navigatedRef = useRef(false);
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (!roomCode) return;
    const unsubscribe = subscribeToRoom(roomCode, (data: unknown) => {
      if (!data || typeof data !== 'object') return;
      const room = data as Record<string, unknown>;
      if (room['status'] === 'playing' && !navigatedRef.current) {
        navigatedRef.current = true;
        router.replace({ pathname: '/game', params: { roomCode, playerNumber, username, uid } });
      }
    });
    return () => unsubscribe();
  }, [roomCode]);

  const handleCancel = async () => {
    if (roomCode) await deleteRoom(roomCode).catch(console.error);
    router.replace('/');
  };

  const chars = (roomCode ?? '    ').split('');

  return (
    <LinearGradient colors={['#060610', '#0a0a18', '#060610']} style={styles.container}>
      {/* Background chess pattern */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: 6 }).map((_, r) =>
          Array.from({ length: 6 }).map((_, c) =>
            (r + c) % 2 === 0 ? (
              <View key={`${r}-${c}`} style={{ position: 'absolute', width: 70, height: 70, left: c * 70, top: r * 70, backgroundColor: 'rgba(212,175,55,0.02)' }} />
            ) : null
          )
        )}
      </View>

      <Animated.View style={[styles.inner, { opacity: fadeIn }]}>
        <Text style={styles.title}>
          <Text style={{ color: '#fff' }}>KNIGHT</Text>
          <Text style={{ color: '#d4af37' }}>CHASE</Text>
        </Text>

        <View style={styles.card}>
          <LinearGradient
            colors={['#1c1c35', '#13132a', '#0f0f22']}
            style={styles.cardGradient}
          >
            {/* Corner decorations */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            <Text style={styles.shareLabel}>SHARE THIS CODE</Text>

            <View style={styles.codeRow}>
              {chars.map((char, i) => (
                <CodeChar key={i} char={char} index={i} />
              ))}
            </View>

            <View style={styles.divider}>
              <LinearGradient
                colors={['transparent', 'rgba(212,175,55,0.3)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: 1, flex: 1 }}
              />
            </View>

            <WaitingDots />
            <Text style={styles.waitingText}>Waiting for opponent to join</Text>
          </LinearGradient>
        </View>

        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.7}>
          <Text style={styles.cancelText}>CANCEL</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 36,
    textShadowColor: 'rgba(212,175,55,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.15)',
    elevation: 20,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
  },
  cardGradient: {
    padding: 32,
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: 'rgba(212,175,55,0.35)',
  },
  cornerTL: { top: 10, left: 10, borderTopWidth: 1, borderLeftWidth: 1 },
  cornerTR: { top: 10, right: 10, borderTopWidth: 1, borderRightWidth: 1 },
  cornerBL: { bottom: 10, left: 10, borderBottomWidth: 1, borderLeftWidth: 1 },
  cornerBR: { bottom: 10, right: 10, borderBottomWidth: 1, borderRightWidth: 1 },
  shareLabel: {
    color: '#3a3a5a',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 20,
  },
  codeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  codeBox: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    elevation: 4,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  codeBoxGradient: {
    width: 56,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeChar: {
    fontSize: 32,
    fontWeight: '900',
    color: '#d4af37',
    textShadowColor: 'rgba(212,175,55,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 1,
  },
  divider: {
    width: '80%',
    marginBottom: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d4af37',
  },
  waitingText: {
    color: '#3a3a5a',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  cancelBtn: {
    marginTop: 32,
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cancelText: {
    color: '#333355',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
  },
});
