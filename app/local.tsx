import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalGame } from '../hooks/useLocalGame';
import { Board } from '../components/Board';
import { Position } from '../types';

function TurnBanner({ name, playerNumber }: { name: string; playerNumber: 1 | 2 }) {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    slideAnim.setValue(30);
    fadeAnim.setValue(0);
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [name, playerNumber]);

  const isP1 = playerNumber === 1;

  return (
    <Animated.View style={[styles.bannerWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <LinearGradient
        colors={isP1 ? ['#1c1c05', '#1a1a08', '#1c1c05'] : ['#05051c', '#08081a', '#05051c']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.banner}
      >
        <View style={[styles.bannerDot, { backgroundColor: isP1 ? '#f5f0e0' : '#d4af37' }]} />
        <Text style={styles.bannerLabel}>PLAYER {playerNumber}</Text>
        <Text style={styles.bannerName}>{name}</Text>
        <View style={styles.bannerSpacer} />
        <LinearGradient
          colors={isP1 ? ['#b8860b', '#d4af37'] : ['#1a3a8f', '#3a6fdf']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.turnPill}
        >
          <Text style={[styles.turnPillText, { color: isP1 ? '#060610' : '#fff' }]}>YOUR TURN</Text>
        </LinearGradient>
      </LinearGradient>
      {/* Bottom accent */}
      <LinearGradient
        colors={isP1 ? ['transparent', '#d4af37', 'transparent'] : ['transparent', '#3a6fdf', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ height: 1.5, opacity: 0.6 }}
      />
    </Animated.View>
  );
}

function GameOverOverlay({
  winner,
  winnerName,
  reason,
  onPlayAgain,
  onHome,
}: {
  winner: 1 | 2;
  winnerName: string;
  reason: string | null;
  onPlayAgain: () => void;
  onHome: () => void;
}) {
  const slideAnim = useRef(new Animated.Value(80)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 55, friction: 10 }),
    ]).start();
  }, []);

  const isP1 = winner === 1;
  const reasonText =
    reason === 'captured'
      ? `${winnerName} captured the opponent!`
      : `${winnerName} trapped the opponent!`;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.gameOverCard, { transform: [{ translateY: slideAnim }] }]}>
        <LinearGradient
          colors={isP1 ? ['#1c1c0a', '#0f0f00'] : ['#0a0a1c', '#00000f']}
          style={styles.gameOverGradient}
        >
          <View style={[styles.corner, styles.cTL, { borderColor: isP1 ? 'rgba(212,175,55,0.4)' : 'rgba(58,111,223,0.4)' }]} />
          <View style={[styles.corner, styles.cTR, { borderColor: isP1 ? 'rgba(212,175,55,0.4)' : 'rgba(58,111,223,0.4)' }]} />
          <View style={[styles.corner, styles.cBL, { borderColor: isP1 ? 'rgba(212,175,55,0.4)' : 'rgba(58,111,223,0.4)' }]} />
          <View style={[styles.corner, styles.cBR, { borderColor: isP1 ? 'rgba(212,175,55,0.4)' : 'rgba(58,111,223,0.4)' }]} />

          <Text style={[styles.crownIcon, { color: isP1 ? '#d4af37' : '#3a6fdf' }]}>♛</Text>
          <Text style={[styles.victoryText, { color: isP1 ? '#d4af37' : '#5a8fff' }]}>VICTORY</Text>

          <View style={[styles.winnerBadge, { backgroundColor: isP1 ? 'rgba(212,175,55,0.12)' : 'rgba(58,111,223,0.12)', borderColor: isP1 ? 'rgba(212,175,55,0.3)' : 'rgba(58,111,223,0.3)' }]}>
            <View style={[styles.winnerDot, { backgroundColor: isP1 ? '#f5f0e0' : '#d4af37' }]} />
            <Text style={styles.winnerLabel}>PLAYER {winner}</Text>
            <Text style={[styles.winnerName, { color: isP1 ? '#d4af37' : '#5a8fff' }]}>{winnerName}</Text>
          </View>

          <Text style={styles.reasonText}>{reasonText}</Text>

          <TouchableOpacity onPress={onPlayAgain} activeOpacity={0.85} style={{ width: '100%' }}>
            <LinearGradient
              colors={isP1 ? ['#b8860b', '#d4af37', '#b8860b'] : ['#1a3a8f', '#3a6fdf', '#1a3a8f']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.playAgainBtn}
            >
              <Text style={[styles.playAgainText, { color: isP1 ? '#060610' : '#fff' }]}>PLAY AGAIN</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={onHome} style={styles.homeBtn} activeOpacity={0.7}>
            <Text style={styles.homeBtnText}>← MAIN MENU</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
}

export default function LocalGameScreen() {
  const router = useRouter();
  const { player1, player2 } = useLocalSearchParams<{ player1: string; player2: string }>();

  const p1Name = player1 ?? 'Player 1';
  const p2Name = player2 ?? 'Player 2';

  const { gameState, validMoves, makeMove, resetGame } = useLocalGame(p1Name, p2Name);
  const [moveCount, setMoveCount] = useState(0);

  const currentPlayer = gameState.currentTurn;
  const currentName = currentPlayer === 1 ? p1Name : p2Name;

  const myPos =
    currentPlayer === 1 ? gameState.player1Pos : gameState.player2Pos;

  const handleCellPress = (pos: Position) => {
    makeMove(pos);
    setMoveCount((c) => c + 1);
  };

  const handlePlayAgain = () => {
    resetGame();
    setMoveCount(0);
  };

  const isFinished = gameState.status === 'finished';
  const winnerName = gameState.winner === 1 ? p1Name : p2Name;

  return (
    <LinearGradient colors={['#060610', '#080814', '#060610']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>

        {/* Turn banner */}
        {!isFinished && (
          <TurnBanner name={currentName} playerNumber={currentPlayer} />
        )}

        {/* Board */}
        <View style={styles.boardContainer}>
          {/* Player indicators flanking the board */}
          <View style={styles.sideInfo}>
            <View style={[styles.sidePlayer, gameState.currentTurn === 1 && styles.sidePlayerActive]}>
              <View style={[styles.sideDot, { backgroundColor: '#f5f0e0' }]} />
              <Text style={styles.sideName} numberOfLines={1}>{p1Name}</Text>
            </View>
            <Text style={styles.sideMove}>#{moveCount}</Text>
            <View style={[styles.sidePlayer, styles.sidePlayerRight, gameState.currentTurn === 2 && styles.sidePlayerActive]}>
              <Text style={styles.sideName} numberOfLines={1}>{p2Name}</Text>
              <View style={[styles.sideDot, { backgroundColor: '#d4af37' }]} />
            </View>
          </View>

          <Board
            board={gameState.board}
            validMoves={validMoves}
            myPos={myPos}
            playerNumber={currentPlayer}
            onCellPress={handleCellPress}
          />
        </View>

        {isFinished && gameState.winner !== null && (
          <GameOverOverlay
            winner={gameState.winner}
            winnerName={winnerName}
            reason={gameState.winReason}
            onPlayAgain={handlePlayAgain}
            onHome={() => router.replace('/')}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  bannerWrap: { overflow: 'hidden' },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  bannerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  bannerLabel: {
    color: '#3a3a5a',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  bannerName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerSpacer: { flex: 1 },
  turnPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  turnPillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  sideInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
  },
  sidePlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    opacity: 0.35,
  },
  sidePlayerRight: {
    justifyContent: 'flex-end',
  },
  sidePlayerActive: {
    opacity: 1,
  },
  sideDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sideName: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '700',
    maxWidth: 100,
    letterSpacing: 0.5,
  },
  sideMove: {
    flex: 1,
    textAlign: 'center',
    color: '#252540',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4,4,12,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  gameOverCard: {
    width: '82%',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    elevation: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  gameOverGradient: {
    padding: 32,
    alignItems: 'center',
    gap: 0,
  },
  corner: { position: 'absolute', width: 16, height: 16 },
  cTL: { top: 10, left: 10, borderTopWidth: 1, borderLeftWidth: 1 },
  cTR: { top: 10, right: 10, borderTopWidth: 1, borderRightWidth: 1 },
  cBL: { bottom: 10, left: 10, borderBottomWidth: 1, borderLeftWidth: 1 },
  cBR: { bottom: 10, right: 10, borderBottomWidth: 1, borderRightWidth: 1 },
  crownIcon: {
    fontSize: 52,
    marginBottom: 8,
    textShadowColor: 'rgba(212,175,55,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  victoryText: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 5,
    marginBottom: 20,
  },
  winnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  winnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  winnerLabel: {
    color: '#444',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  winnerName: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  reasonText: {
    color: '#444466',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 24,
    letterSpacing: 0.3,
  },
  playAgainBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 6,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  playAgainText: {
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 2,
  },
  homeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  homeBtnText: {
    color: '#333355',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
});
