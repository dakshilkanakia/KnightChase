import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { generateUID } from '../config/firebase';
import { createRoom, joinRoom } from '../lib/roomManager';

function ChessBackground() {
  const { width, height } = useWindowDimensions();
  const cols = Math.ceil(width / 44) + 1;
  const rows = Math.ceil(height / 44) + 1;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 2 === 0) {
        cells.push(
          <View
            key={`${r}-${c}`}
            style={{
              position: 'absolute',
              width: 44,
              height: 44,
              left: c * 44,
              top: r * 44,
              backgroundColor: 'rgba(212,175,55,0.025)',
            }}
          />
        );
      }
    }
  }
  return <View style={StyleSheet.absoluteFill}>{cells}</View>;
}

export default function HomeScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const knightAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(cardSlide, { toValue: 0, useNativeDriver: true, tension: 50, friction: 9 }),
    ]).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(knightAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(knightAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const trimmedUsername = username.trim();
  const trimmedCode = roomCode.trim().toUpperCase();

  const handleCreateGame = async () => {
    if (!trimmedUsername) { setError('Enter your name first.'); return; }
    setError(null);
    setLoading(true);
    try {
      const uid = generateUID();
      const code = await createRoom(uid, trimmedUsername);
      router.push({ pathname: '/lobby', params: { roomCode: code, playerNumber: '1', username: trimmedUsername, uid } });
    } catch {
      setError('Failed to create game. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!trimmedUsername) { setError('Enter your name first.'); return; }
    if (trimmedCode.length !== 4) { setError('Room code must be 4 characters.'); return; }
    setError(null);
    setLoading(true);
    try {
      const uid = generateUID();
      await joinRoom(trimmedCode, uid, trimmedUsername);
      router.push({ pathname: '/game', params: { roomCode: trimmedCode, playerNumber: '2', username: trimmedUsername, uid } });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      if (msg === 'Room not found') setError('Room not found.');
      else if (msg === 'Room is full') setError('Room is full.');
      else setError('Failed to join. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ChessBackground />

      <Animated.View style={[styles.inner, { opacity: fadeIn }]}>
        {/* Hero */}
        <Animated.Text
          style={[
            styles.heroKnight,
            {
              opacity: knightAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }),
              transform: [{
                scale: knightAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }),
              }],
            },
          ]}
        >
          ♞
        </Animated.Text>

        <View style={styles.titleRow}>
          <Text style={styles.titleWhite}>KNIGHT</Text>
          <Text style={styles.titleGold}>CHASE</Text>
        </View>
        <Text style={styles.tagline}>OUTSMART · OUTLAST · WIN</Text>

        {/* Card */}
        <Animated.View style={[styles.card, { transform: [{ translateY: cardSlide }] }]}>
          <LinearGradient
            colors={['#1c1c35', '#13132a', '#0f0f22']}
            style={styles.cardGradient}
          >
            {/* Decorative corner lines */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            <Text style={styles.inputLabel}>YOUR NAME</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter username"
                placeholderTextColor="#383858"
                value={username}
                onChangeText={setUsername}
                maxLength={16}
                autoCapitalize="words"
                editable={!loading}
              />
              <View style={styles.inputLine} />
            </View>

            {showJoin && (
              <>
                <Text style={[styles.inputLabel, { marginTop: 20 }]}>ROOM CODE</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[styles.input, styles.codeInput]}
                    placeholder="A3F7"
                    placeholderTextColor="#383858"
                    value={roomCode}
                    onChangeText={(t) => setRoomCode(t.toUpperCase())}
                    maxLength={4}
                    autoCapitalize="characters"
                    editable={!loading}
                  />
                  <View style={styles.inputLine} />
                </View>
              </>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : <View style={{ height: 16 }} />}

            {loading ? (
              <View style={styles.loadingRow}>
                <LoadingDots />
              </View>
            ) : (
              <View style={styles.btnGroup}>
                {!showJoin ? (
                  <>
                    <TouchableOpacity onPress={handleCreateGame} activeOpacity={0.85}>
                      <LinearGradient
                        colors={['#b8860b', '#d4af37', '#b8860b']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.primaryBtn}
                      >
                        <Text style={styles.primaryBtnText}>CREATE GAME</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.secondaryBtn}
                      onPress={() => { setShowJoin(true); setError(null); }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.secondaryBtnText}>JOIN GAME</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity onPress={handleJoinGame} activeOpacity={0.85}>
                      <LinearGradient
                        colors={['#b8860b', '#d4af37', '#b8860b']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.primaryBtn}
                      >
                        <Text style={styles.primaryBtnText}>JOIN ROOM</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.secondaryBtn}
                      onPress={() => { setShowJoin(false); setRoomCode(''); setError(null); }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.secondaryBtnText}>← BACK</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        <Text style={styles.footerHint}>Two players · Same room code · Real-time</Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

function LoadingDots() {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);

  return (
    <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', paddingVertical: 16 }}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#d4af37',
            opacity: dot,
            transform: [{ scale: dot.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.2] }) }],
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#060610',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  heroKnight: {
    fontSize: 80,
    color: '#d4af37',
    textShadowColor: 'rgba(212,175,55,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 6,
  },
  titleWhite: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
  },
  titleGold: {
    fontSize: 36,
    fontWeight: '900',
    color: '#d4af37',
    letterSpacing: 4,
    textShadowColor: 'rgba(212,175,55,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  tagline: {
    fontSize: 10,
    color: '#3a3a5a',
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 32,
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
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  cardGradient: {
    padding: 28,
  },
  corner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderColor: 'rgba(212,175,55,0.35)',
  },
  cornerTL: { top: 8, left: 8, borderTopWidth: 1, borderLeftWidth: 1 },
  cornerTR: { top: 8, right: 8, borderTopWidth: 1, borderRightWidth: 1 },
  cornerBL: { bottom: 8, left: 8, borderBottomWidth: 1, borderLeftWidth: 1 },
  cornerBR: { bottom: 8, right: 8, borderBottomWidth: 1, borderRightWidth: 1 },
  inputLabel: {
    color: '#3a3a5a',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 8,
  },
  inputWrapper: {
    marginBottom: 4,
  },
  input: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  inputLine: {
    height: 1,
    backgroundColor: 'rgba(212,175,55,0.25)',
  },
  codeInput: {
    letterSpacing: 14,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  error: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 10,
    marginBottom: 2,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loadingRow: {
    marginTop: 8,
  },
  btnGroup: {
    gap: 10,
    marginTop: 4,
  },
  primaryBtn: {
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  primaryBtnText: {
    color: '#060610',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 2,
  },
  secondaryBtn: {
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
  },
  secondaryBtnText: {
    color: '#555',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 1.5,
  },
  footerHint: {
    color: '#252540',
    fontSize: 11,
    marginTop: 28,
    letterSpacing: 1,
    fontWeight: '600',
  },
});
