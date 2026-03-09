import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Mini knight-move diagram (5×5 grid) ─────────────────────────────────────
const KNIGHT_OFFSETS = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];

function KnightDiagram() {
  const GRID = 5;
  const CELL = 52;
  const CENTER = { r: 2, c: 2 };
  const validSet = new Set(
    KNIGHT_OFFSETS
      .map(([dr, dc]) => ({ r: CENTER.r + dr, c: CENTER.c + dc }))
      .filter(({ r, c }) => r >= 0 && r < GRID && c >= 0 && c < GRID)
      .map(({ r, c }) => `${r}-${c}`)
  );

  const pulseAnims = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0.4))
  ).current;

  useEffect(() => {
    const loops = pulseAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 80),
          Animated.timing(anim, { toValue: 1,   duration: 600, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0.4, duration: 600, useNativeDriver: true }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);

  let validIdx = 0;

  return (
    <View style={{ alignItems: 'center', marginVertical: 8 }}>
      {Array.from({ length: GRID }, (_, r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {Array.from({ length: GRID }, (_, c) => {
            const isCenter = r === CENTER.r && c === CENTER.c;
            const isValid  = validSet.has(`${r}-${c}`);
            const isLight  = (r + c) % 2 === 0;
            const bg       = isLight ? '#f0d9b5' : '#8b6340';
            const anim     = isValid ? pulseAnims[validIdx++] : null;

            return (
              <View
                key={c}
                style={[
                  diag.cell,
                  { width: CELL, height: CELL, backgroundColor: bg },
                ]}
              >
                {isCenter && (
                  <View style={diag.knightBadge}>
                    <Text style={diag.knightChar}>♞</Text>
                  </View>
                )}
                {isValid && anim && (
                  <Animated.View
                    style={[
                      diag.moveDot,
                      {
                        opacity: anim,
                        transform: [{ scale: anim.interpolate({ inputRange: [0.4, 1], outputRange: [0.7, 1.1] }) }],
                      },
                    ]}
                  />
                )}
                {/* Draw L-shape lines via connecting arrows? Too complex — dots are enough */}
              </View>
            );
          })}
        </View>
      ))}
      <Text style={diag.caption}>Green dots = all 8 possible knight moves</Text>
    </View>
  );
}

const diag = StyleSheet.create({
  cell:       { justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.15)' },
  knightBadge:{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#f5f0e0', borderWidth: 1.5, borderColor: 'rgba(50,25,0,0.25)', justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: 'rgba(0,0,0,0.7)', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 1, shadowRadius: 4 },
  knightChar: { fontSize: 22, color: '#110800', fontWeight: '900' },
  moveDot:    { width: 18, height: 18, borderRadius: 9, backgroundColor: '#22c55e' },
  caption:    { color: '#7777aa', fontSize: 11, marginTop: 10, fontWeight: '600', letterSpacing: 0.3 },
});

// ─── Starting positions mini board (8×8 tiny) ─────────────────────────────────
function StartingBoard() {
  const CELL = 28;
  const rows = Array.from({ length: 8 }, (_, r) => r);
  const cols = Array.from({ length: 8 }, (_, c) => c);
  return (
    <View style={{ alignSelf: 'center', borderWidth: 3, borderColor: '#5c3d1e', borderRadius: 4, marginVertical: 8, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.5, shadowRadius: 6 }}>
      {rows.map((r) => (
        <View key={r} style={{ flexDirection: 'row' }}>
          {cols.map((c) => {
            const isLight = (r + c) % 2 === 0;
            const isP1    = r === 0 && c === 0;
            const isP2    = r === 7 && c === 7;
            return (
              <View key={c} style={{ width: CELL, height: CELL, backgroundColor: isLight ? '#f0d9b5' : '#8b6340', justifyContent: 'center', alignItems: 'center' }}>
                {isP1 && <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#f5f0e0', borderWidth: 1, borderColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 12, color: '#110800', fontWeight: '900' }}>♞</Text></View>}
                {isP2 && <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#1e0e04', borderWidth: 1, borderColor: 'rgba(212,175,55,0.4)', justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontSize: 12, color: '#d4af37', fontWeight: '900' }}>♞</Text></View>}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ─── Section component ────────────────────────────────────────────────────────
function Section({
  number,
  title,
  accent,
  children,
  delay = 0,
}: {
  number: string;
  title: string;
  accent: string;
  children: React.ReactNode;
  delay?: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 400, delay, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View
      style={[
        s.section,
        {
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
        },
      ]}
    >
      <LinearGradient colors={['#1c1c35', '#13132a']} style={s.sectionGrad}>
        {/* Accent bar */}
        <View style={[s.accentBar, { backgroundColor: accent }]} />
        <View style={s.sectionHeader}>
          <View style={[s.numberBadge, { backgroundColor: accent + '22', borderColor: accent + '55' }]}>
            <Text style={[s.numberText, { color: accent }]}>{number}</Text>
          </View>
          <Text style={s.sectionTitle}>{title}</Text>
        </View>
        <View style={s.sectionBody}>{children}</View>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Rule row ─────────────────────────────────────────────────────────────────
function Rule({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={s.ruleRow}>
      <Text style={s.ruleIcon}>{icon}</Text>
      <Text style={s.ruleText}>{text}</Text>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function InstructionsScreen() {
  const router = useRouter();
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  return (
    <LinearGradient colors={['#060610', '#080814', '#060610']} style={s.root}>
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>

        {/* Header */}
        <Animated.View style={[s.header, { opacity: headerAnim }]}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <Text style={s.headerTitle}>HOW TO PLAY</Text>
            <Text style={s.headerSub}>KnightChase</Text>
          </View>
          <View style={{ width: 44 }} />
        </Animated.View>

        <LinearGradient
          colors={['transparent', '#d4af37', 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={s.headerLine}
        />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Intro blurb */}
          <Animated.View style={[s.intro, { opacity: headerAnim }]}>
            <Text style={s.introKnight}>♞</Text>
            <Text style={s.introText}>
              A two-player strategy game. Move your knight across the board, block your opponent's path, and force them into a corner — or capture them outright.
            </Text>
          </Animated.View>

          {/* Section 1 — The Board */}
          <Section number="01" title="THE BOARD" accent="#d4af37" delay={100}>
            <Text style={s.bodyText}>
              The game is played on a standard <Text style={s.highlight}>8×8 chess board</Text>. Each player starts with one knight in opposite corners.
            </Text>
            <StartingBoard />
            <View style={s.legendRow}>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: '#f5f0e0', borderColor: 'rgba(0,0,0,0.2)' }]}><Text style={{ fontSize: 9, color: '#110800' }}>♞</Text></View>
                <Text style={s.legendLabel}>Player 1 — top-left</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: '#1e0e04', borderColor: 'rgba(212,175,55,0.4)' }]}><Text style={{ fontSize: 9, color: '#d4af37' }}>♞</Text></View>
                <Text style={s.legendLabel}>Player 2 — bottom-right</Text>
              </View>
            </View>
          </Section>

          {/* Section 2 — Knight Movement */}
          <Section number="02" title="KNIGHT MOVEMENT" accent="#5a8fff" delay={200}>
            <Text style={s.bodyText}>
              Knights move in an <Text style={s.highlight}>L-shape</Text>: 2 squares in one direction, then 1 square perpendicular. Up to <Text style={s.highlight}>8 possible moves</Text> from any position.
            </Text>
            <KnightDiagram />
            <Rule icon="✓" text="Knights can jump over other pieces and visited cells." />
            <Rule icon="✓" text="Valid moves are shown as green highlights on your turn." />
          </Section>

          {/* Section 3 — The Twist */}
          <Section number="03" title="LEAVE NO TRACE" accent="#f97316" delay={300}>
            <Text style={s.bodyText}>
              Every cell your knight <Text style={s.highlight}>leaves behind</Text> is permanently marked with{' '}
              <Text style={{ color: '#ef4444', fontWeight: '800' }}>✕</Text> and becomes <Text style={s.highlight}>blocked forever</Text>. Neither player can land on it again.
            </Text>
            <View style={s.visitedExample}>
              <View style={s.visitedCell}>
                <View style={s.visitedOverlaySmall}>
                  <View style={s.crossL1} /><View style={s.crossL2} />
                </View>
              </View>
              <View style={[s.visitedCell, { backgroundColor: '#8b6340' }]}>
                <View style={s.visitedOverlaySmall}>
                  <View style={s.crossL1} /><View style={s.crossL2} />
                </View>
              </View>
              <View style={{ flex: 1, justifyContent: 'center', paddingLeft: 12 }}>
                <Text style={s.visitedCaption}>Blocked cells — your knight cannot land here</Text>
              </View>
            </View>
            <Rule icon="⚠" text="As the game progresses, fewer and fewer squares are available." />
            <Rule icon="⚠" text="Plan ahead — you'll run out of room faster than you think." />
          </Section>

          {/* Section 4 — How to Win */}
          <Section number="04" title="HOW TO WIN" accent="#22c55e" delay={400}>
            <Text style={s.bodyText}>There are two ways to win:</Text>
            <View style={s.winCard}>
              <LinearGradient colors={['rgba(212,175,55,0.12)', 'rgba(212,175,55,0.06)']} style={s.winCardGrad}>
                <Text style={s.winCardIcon}>⚔️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.winCardTitle, { color: '#d4af37' }]}>CAPTURE</Text>
                  <Text style={s.winCardDesc}>Move your knight onto the same square as your opponent. They're eliminated instantly.</Text>
                </View>
              </LinearGradient>
            </View>
            <View style={[s.winCard, { marginTop: 8 }]}>
              <LinearGradient colors={['rgba(34,197,94,0.12)', 'rgba(34,197,94,0.06)']} style={s.winCardGrad}>
                <Text style={s.winCardIcon}>🪤</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.winCardTitle, { color: '#22c55e' }]}>TRAP</Text>
                  <Text style={s.winCardDesc}>Leave your opponent with no valid moves on their turn. They have nowhere to go — you win.</Text>
                </View>
              </LinearGradient>
            </View>
          </Section>

          {/* Section 5 — Turn Order */}
          <Section number="05" title="TURN ORDER" accent="#a78bfa" delay={500}>
            <Rule icon="1️⃣" text="Player 1 (white knight) always moves first." />
            <Rule icon="2️⃣" text="Players alternate turns — you cannot skip your turn." />
            <Rule icon="📱" text="Online mode: the board updates in real-time on both devices." />
            <Rule icon="⚔️" text="Local mode: pass the phone after each move." />
          </Section>

          {/* Section 6 — Tips */}
          <Section number="06" title="TIPS & STRATEGY" accent="#f472b6" delay={600}>
            <Rule icon="🎯" text="Corner traps are deadly — drive your opponent towards the edges." />
            <Rule icon="🔄" text="Knights in the centre control more squares. Fight for the middle." />
            <Rule icon="👁" text="Always look two moves ahead — a good move now can be a dead end later." />
            <Rule icon="⚡" text="Capturing is faster than trapping, but harder to set up. Mix both threats." />
          </Section>

          {/* CTA */}
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.85} style={{ marginTop: 8, marginBottom: 8 }}>
            <LinearGradient
              colors={['#b8860b', '#d4af37', '#b8860b']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.playBtn}
            >
              <Text style={s.playBtnText}>LET'S PLAY  ♞</Text>
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  backArrow: { color: '#d4af37', fontSize: 22, fontWeight: '700' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 3 },
  headerSub: { color: '#d4af37', fontSize: 10, fontWeight: '700', letterSpacing: 2, marginTop: 1 },
  headerLine: { height: 1, opacity: 0.35, marginBottom: 4 },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  // Intro
  intro: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: 'rgba(212,175,55,0.07)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.18)', padding: 16, marginBottom: 4 },
  introKnight: { fontSize: 36, color: '#d4af37' },
  introText: { flex: 1, color: '#ccccdd', fontSize: 13, lineHeight: 20, fontWeight: '500' },
  // Section
  section: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 6 },
  sectionGrad: { padding: 18, paddingLeft: 22 },
  accentBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderTopLeftRadius: 14, borderBottomLeftRadius: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  numberBadge: { width: 28, height: 28, borderRadius: 7, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  numberText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  sectionBody: { gap: 10 },
  // Body
  bodyText: { color: '#bbbbcc', fontSize: 13, lineHeight: 20, fontWeight: '500' },
  highlight: { color: '#fff', fontWeight: '800' },
  // Legend
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legendDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  legendLabel: { color: '#9999bb', fontSize: 11, fontWeight: '600' },
  // Rules
  ruleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  ruleIcon: { fontSize: 14, width: 20, textAlign: 'center', marginTop: 1 },
  ruleText: { flex: 1, color: '#bbbbcc', fontSize: 13, lineHeight: 19, fontWeight: '500' },
  // Visited example
  visitedExample: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  visitedCell: { width: 44, height: 44, backgroundColor: '#f0d9b5', justifyContent: 'center', alignItems: 'center', marginRight: 4, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.15)' },
  visitedOverlaySmall: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.52)', justifyContent: 'center', alignItems: 'center' },
  crossL1: { position: 'absolute', width: '70%', height: 2, backgroundColor: 'rgba(248,60,60,0.85)', transform: [{ rotate: '45deg' }], borderRadius: 1 },
  crossL2: { position: 'absolute', width: '70%', height: 2, backgroundColor: 'rgba(248,60,60,0.85)', transform: [{ rotate: '-45deg' }], borderRadius: 1 },
  visitedCaption: { color: '#9999bb', fontSize: 12, fontWeight: '600' },
  // Win cards
  winCard: { borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  winCardGrad: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14 },
  winCardIcon: { fontSize: 26, marginTop: 2 },
  winCardTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 4 },
  winCardDesc: { color: '#9999bb', fontSize: 12, lineHeight: 18, fontWeight: '500' },
  // Play button
  playBtn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center', elevation: 8, shadowColor: '#d4af37', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10 },
  playBtnText: { color: '#060610', fontWeight: '900', fontSize: 15, letterSpacing: 3 },
});
