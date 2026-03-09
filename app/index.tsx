import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

type Mode = 'local' | 'online';
type OnlineFlow = 'menu' | 'create' | 'join';

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
            style={{ position: 'absolute', width: 44, height: 44, left: c * 44, top: r * 44, backgroundColor: 'rgba(212,175,55,0.022)' }}
          />
        );
      }
    }
  }
  return <View style={StyleSheet.absoluteFill} pointerEvents="none">{cells}</View>;
}

function LoadingDots() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    const anims = dots.map((dot, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 160),
        Animated.timing(dot, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(dot, { toValue: 0, duration: 380, useNativeDriver: true }),
      ]))
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, []);
  return (
    <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', paddingVertical: 14 }}>
      {dots.map((dot, i) => (
        <Animated.View key={i} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#d4af37', opacity: dot, transform: [{ scale: dot.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.2] }) }] }} />
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode | null>(null);
  const [onlineFlow, setOnlineFlow] = useState<OnlineFlow>('menu');

  // Shared
  const [username, setUsername] = useState('');
  // Local mode
  const [p2name, setP2name] = useState('');
  // Online join
  const [roomCode, setRoomCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const knightAnim = useRef(new Animated.Value(0)).current;
  const heroFade = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heroFade, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(knightAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      Animated.timing(knightAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  // Animate card in when mode changes
  useEffect(() => {
    if (mode) {
      cardAnim.setValue(0);
      Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 9 }).start();
    }
  }, [mode]);

  const resetMode = () => {
    setMode(null);
    setOnlineFlow('menu');
    setError(null);
    setUsername('');
    setP2name('');
    setRoomCode('');
  };

  const handleLocalPlay = () => {
    const p1 = username.trim();
    const p2 = p2name.trim();
    if (!p1) { setError('Enter Player 1 name.'); return; }
    if (!p2) { setError('Enter Player 2 name.'); return; }
    router.push({ pathname: '/local', params: { player1: p1, player2: p2 } });
  };

  const handleCreateGame = async () => {
    const name = username.trim();
    if (!name) { setError('Enter your name.'); return; }
    setError(null);
    setLoading(true);
    try {
      const uid = generateUID();
      const code = await createRoom(uid, name);
      router.push({ pathname: '/lobby', params: { roomCode: code, playerNumber: '1', username: name, uid } });
    } catch { setError('Failed to create. Check connection.'); }
    finally { setLoading(false); }
  };

  const handleJoinGame = async () => {
    const name = username.trim();
    const code = roomCode.trim().toUpperCase();
    if (!name) { setError('Enter your name.'); return; }
    if (code.length !== 4) { setError('Room code must be 4 characters.'); return; }
    setError(null);
    setLoading(true);
    try {
      const uid = generateUID();
      await joinRoom(code, uid, name);
      router.push({ pathname: '/game', params: { roomCode: code, playerNumber: '2', username: name, uid } });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      setError(msg === 'Room not found' ? 'Room not found.' : msg === 'Room is full' ? 'Room is full.' : 'Failed to join.');
    }
    finally { setLoading(false); }
  };

  const cardTranslate = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] });

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#060610', '#0a0a18', '#060610']} style={StyleSheet.absoluteFill} />
      <ChessBackground />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View style={[styles.hero, { opacity: heroFade }]}>
          <Animated.Text style={[styles.heroKnight, {
            opacity: knightAnim.interpolate({ inputRange: [0, 1], outputRange: [0.65, 1] }),
            transform: [{ scale: knightAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.07] }) }],
          }]}>♞</Animated.Text>
          <View style={styles.titleRow}>
            <Text style={styles.titleWhite}>KNIGHT</Text>
            <Text style={styles.titleGold}>CHASE</Text>
          </View>
          <Text style={styles.tagline}>OUTSMART · OUTLAST · WIN</Text>
        </Animated.View>

        {/* Mode selector */}
        {!mode && (
          <Animated.View style={[styles.modePicker, { opacity: heroFade }]}>
            <Text style={styles.modePickerLabel}>CHOOSE MODE</Text>
            <View style={styles.modeRow}>
              <TouchableOpacity onPress={() => setMode('local')} activeOpacity={0.8} style={styles.modeCardTouch}>
                <LinearGradient colors={['#1c1c35', '#13132a']} style={styles.modeCard}>
                  <View style={[styles.modeIconCircle, { backgroundColor: 'rgba(212,175,55,0.12)', borderColor: 'rgba(212,175,55,0.25)' }]}>
                    <Text style={styles.modeIconText}>⚔️</Text>
                  </View>
                  <Text style={[styles.modeTitle, { color: '#d4af37' }]}>LOCAL</Text>
                  <Text style={styles.modeSub}>Same Device</Text>
                  <Text style={styles.modeDesc}>2 players share one phone</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setMode('online')} activeOpacity={0.8} style={styles.modeCardTouch}>
                <LinearGradient colors={['#1c1c35', '#13132a']} style={styles.modeCard}>
                  <View style={[styles.modeIconCircle, { backgroundColor: 'rgba(58,111,223,0.12)', borderColor: 'rgba(58,111,223,0.25)' }]}>
                    <Text style={styles.modeIconText}>📡</Text>
                  </View>
                  <Text style={[styles.modeTitle, { color: '#5a8fff' }]}>ONLINE</Text>
                  <Text style={styles.modeSub}>Two Devices</Text>
                  <Text style={styles.modeDesc}>Play via room code</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/instructions')}
              activeOpacity={0.7}
              style={styles.howToBtn}
            >
              <Text style={styles.howToBtnText}>? HOW TO PLAY</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* LOCAL card */}
        {mode === 'local' && (
          <Animated.View style={[styles.card, { opacity: cardAnim, transform: [{ translateY: cardTranslate }] }]}>
            <LinearGradient colors={['#1c1c35', '#13132a', '#0f0f22']} style={styles.cardGradient}>
              <Corner />
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderIcon}>⚔️</Text>
                <View>
                  <Text style={styles.cardHeaderTitle}>LOCAL GAME</Text>
                  <Text style={styles.cardHeaderSub}>Same device · 2 players</Text>
                </View>
                <TouchableOpacity onPress={resetMode} style={styles.backBtn}>
                  <Text style={styles.backBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.playerInputRow}>
                <View style={[styles.playerInputCard, { borderColor: 'rgba(212,175,55,0.3)' }]}>
                  <View style={[styles.playerInputDot, { backgroundColor: '#f5f0e0' }]} />
                  <Text style={styles.playerInputLabel}>PLAYER 1</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Name"
                    placeholderTextColor="#666688"
                    value={username}
                    onChangeText={setUsername}
                    maxLength={16}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>
                <View style={[styles.vsChip]}>
                  <Text style={styles.vsText}>VS</Text>
                </View>
                <View style={[styles.playerInputCard, { borderColor: 'rgba(58,111,223,0.3)' }]}>
                  <View style={[styles.playerInputDot, { backgroundColor: '#d4af37' }]} />
                  <Text style={styles.playerInputLabel}>PLAYER 2</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Name"
                    placeholderTextColor="#666688"
                    value={p2name}
                    onChangeText={setP2name}
                    maxLength={16}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>
              </View>

              {error && <Text style={styles.error}>{error}</Text>}

              <TouchableOpacity onPress={handleLocalPlay} activeOpacity={0.85}>
                <LinearGradient colors={['#b8860b', '#d4af37', '#b8860b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
                  <Text style={styles.primaryBtnText}>START GAME</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        )}

        {/* ONLINE card */}
        {mode === 'online' && (
          <Animated.View style={[styles.card, { opacity: cardAnim, transform: [{ translateY: cardTranslate }] }]}>
            <LinearGradient colors={['#1c1c35', '#13132a', '#0f0f22']} style={styles.cardGradient}>
              <Corner />
              <View style={styles.cardHeader}>
                <Text style={styles.cardHeaderIcon}>📡</Text>
                <View>
                  <Text style={styles.cardHeaderTitle}>ONLINE GAME</Text>
                  <Text style={styles.cardHeaderSub}>Two devices · Room code</Text>
                </View>
                <TouchableOpacity onPress={resetMode} style={styles.backBtn}>
                  <Text style={styles.backBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>YOUR NAME</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter username"
                  placeholderTextColor="#666688"
                  value={username}
                  onChangeText={setUsername}
                  maxLength={16}
                  autoCapitalize="words"
                  editable={!loading}
                />
                <View style={styles.inputLine} />
              </View>

              {onlineFlow === 'join' && (
                <>
                  <Text style={[styles.inputLabel, { marginTop: 18 }]}>ROOM CODE</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={[styles.input, styles.codeInput]}
                      placeholder="A3F7"
                      placeholderTextColor="#666688"
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

              {error && <Text style={styles.error}>{error}</Text>}

              {loading ? <LoadingDots /> : (
                <View style={styles.btnGroup}>
                  {onlineFlow === 'menu' && (
                    <>
                      <TouchableOpacity onPress={handleCreateGame} activeOpacity={0.85}>
                        <LinearGradient colors={['#b8860b', '#d4af37', '#b8860b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
                          <Text style={styles.primaryBtnText}>CREATE GAME</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setOnlineFlow('join'); setError(null); }} activeOpacity={0.7}>
                        <Text style={styles.secondaryBtnText}>JOIN WITH CODE</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  {onlineFlow === 'join' && (
                    <>
                      <TouchableOpacity onPress={handleJoinGame} activeOpacity={0.85}>
                        <LinearGradient colors={['#b8860b', '#d4af37', '#b8860b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
                          <Text style={styles.primaryBtnText}>JOIN ROOM</Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setOnlineFlow('menu'); setRoomCode(''); setError(null); }} activeOpacity={0.7}>
                        <Text style={styles.secondaryBtnText}>← BACK</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
            </LinearGradient>
          </Animated.View>
        )}

        <Text style={styles.footerHint}>
          {mode === 'local' ? 'Pass the phone between turns' : mode === 'online' ? 'Share the room code with a friend' : 'Chess knights · Real-time · Free'}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Corner() {
  return (
    <>
      <View style={[cStyles.corner, cStyles.TL]} />
      <View style={[cStyles.corner, cStyles.TR]} />
      <View style={[cStyles.corner, cStyles.BL]} />
      <View style={[cStyles.corner, cStyles.BR]} />
    </>
  );
}
const cStyles = StyleSheet.create({
  corner: { position: 'absolute', width: 14, height: 14, borderColor: 'rgba(212,175,55,0.3)' },
  TL: { top: 8, left: 8, borderTopWidth: 1, borderLeftWidth: 1 },
  TR: { top: 8, right: 8, borderTopWidth: 1, borderRightWidth: 1 },
  BL: { bottom: 8, left: 8, borderBottomWidth: 1, borderLeftWidth: 1 },
  BR: { bottom: 8, right: 8, borderBottomWidth: 1, borderRightWidth: 1 },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#060610' },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 32 },
  hero: { alignItems: 'center', marginBottom: 28 },
  heroKnight: {
    fontSize: 72, color: '#d4af37',
    textShadowColor: 'rgba(212,175,55,0.45)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 18,
    marginBottom: 6,
  },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 5 },
  titleWhite: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 4 },
  titleGold: { fontSize: 32, fontWeight: '900', color: '#d4af37', letterSpacing: 4, textShadowColor: 'rgba(212,175,55,0.35)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  tagline: { fontSize: 10, color: '#9999bb', letterSpacing: 3, fontWeight: '700' },
  // Mode picker
  modePicker: { width: '100%', alignItems: 'center', gap: 12 },
  modePickerLabel: { color: '#9999bb', fontSize: 10, fontWeight: '700', letterSpacing: 3 },
  modeRow: { flexDirection: 'row', gap: 12, width: '100%' },
  modeCardTouch: { flex: 1, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  modeCard: { padding: 20, alignItems: 'center', gap: 6 },
  modeIconCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  modeIconText: { fontSize: 22 },
  modeTitle: { fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  modeSub: { color: '#ccccdd', fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  modeDesc: { color: '#9999bb', fontSize: 10, fontWeight: '600', textAlign: 'center' },
  // Card
  card: { width: '100%', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(212,175,55,0.22)', elevation: 16, shadowColor: '#d4af37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16 },
  cardGradient: { padding: 24 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 22 },
  cardHeaderIcon: { fontSize: 22 },
  cardHeaderTitle: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1.5 },
  cardHeaderSub: { color: '#8888aa', fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  backBtn: { marginLeft: 'auto', padding: 4 },
  backBtnText: { color: '#8888aa', fontSize: 16, fontWeight: '700' },
  // Local inputs
  playerInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 },
  playerInputCard: { flex: 1, borderRadius: 10, borderWidth: 1.5, padding: 14, backgroundColor: 'rgba(255,255,255,0.07)' },
  playerInputDot: { width: 9, height: 9, borderRadius: 5, marginBottom: 6 },
  playerInputLabel: { color: '#aaaacc', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  vsChip: { paddingHorizontal: 6, paddingVertical: 12 },
  vsText: { color: '#666688', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  // Online inputs
  inputLabel: { color: '#aaaacc', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  inputWrapper: { marginBottom: 4 },
  input: { color: '#ffffff', fontSize: 17, fontWeight: '600', paddingVertical: 6, paddingHorizontal: 2 },
  inputLine: { height: 1.5, backgroundColor: 'rgba(212,175,55,0.35)' },
  codeInput: { letterSpacing: 14, fontSize: 26, fontWeight: '800', textAlign: 'center' },
  error: { color: '#f87171', fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginTop: 8, marginBottom: 4 },
  btnGroup: { gap: 10, marginTop: 16 },
  primaryBtn: { borderRadius: 10, paddingVertical: 14, alignItems: 'center', elevation: 6, shadowColor: '#d4af37', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 8 },
  primaryBtnText: { color: '#060610', fontWeight: '900', fontSize: 13, letterSpacing: 2 },
  secondaryBtn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)' },
  secondaryBtnText: { color: '#8888aa', fontWeight: '700', fontSize: 12, letterSpacing: 1.5 },
  footerHint: { color: '#7777aa', fontSize: 10, marginTop: 24, letterSpacing: 1, fontWeight: '600' },
  howToBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)', alignSelf: 'center' },
  howToBtnText: { color: '#9999bb', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
});
