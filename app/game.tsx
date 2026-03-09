import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../hooks/useGame';
import { Board } from '../components/Board';
import { GameStatusBar } from '../components/GameStatusBar';
import { LocalPlayer, PlayerNumber, Position } from '../types';

function GameOverOverlay({
  iWon,
  reason,
  winnerName,
  onPlayAgain,
}: {
  iWon: boolean;
  reason: string | null;
  winnerName: string;
  onPlayAgain: () => void;
}) {
  const slideAnim = useRef(new Animated.Value(80)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 55, friction: 10 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 55, friction: 10 }),
    ]).start();
  }, []);

  const reasonText = reason === 'captured'
    ? (iWon ? 'You captured the opponent!' : 'You were captured!')
    : (iWon ? 'Opponent had no moves left!' : 'You ran out of moves!');

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <Animated.View
        style={[
          styles.gameOverCard,
          {
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={iWon ? ['#1c1c0a', '#1a1a05', '#0f0f00'] : ['#1a0808', '#1a0505', '#0f0000']}
          style={styles.gameOverGradient}
        >
          {/* Corner decorations */}
          <View style={[styles.corner, styles.cornerTL, { borderColor: iWon ? 'rgba(212,175,55,0.4)' : 'rgba(200,50,50,0.3)' }]} />
          <View style={[styles.corner, styles.cornerTR, { borderColor: iWon ? 'rgba(212,175,55,0.4)' : 'rgba(200,50,50,0.3)' }]} />
          <View style={[styles.corner, styles.cornerBL, { borderColor: iWon ? 'rgba(212,175,55,0.4)' : 'rgba(200,50,50,0.3)' }]} />
          <View style={[styles.corner, styles.cornerBR, { borderColor: iWon ? 'rgba(212,175,55,0.4)' : 'rgba(200,50,50,0.3)' }]} />

          <Text style={styles.gameOverEmoji}>{iWon ? '♛' : '♟'}</Text>

          <Text style={[styles.gameOverTitle, { color: iWon ? '#d4af37' : '#ef4444' }]}>
            {iWon ? 'VICTORY' : 'DEFEATED'}
          </Text>

          <View style={[styles.dividerLine, { backgroundColor: iWon ? 'rgba(212,175,55,0.3)' : 'rgba(239,68,68,0.3)' }]} />

          <Text style={styles.reasonText}>{reasonText}</Text>

          <View style={styles.winnerRow}>
            <Text style={styles.winnerLabel}>WINNER</Text>
            <Text style={[styles.winnerName, { color: iWon ? '#d4af37' : '#ef4444' }]}>
              {winnerName}
            </Text>
          </View>

          <TouchableOpacity onPress={onPlayAgain} activeOpacity={0.85}>
            <LinearGradient
              colors={iWon ? ['#b8860b', '#d4af37', '#b8860b'] : ['#7f1d1d', '#dc2626', '#7f1d1d']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.playAgainBtn}
            >
              <Text style={[styles.playAgainText, { color: iWon ? '#060610' : '#fff' }]}>
                PLAY AGAIN
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
}

export default function GameScreen() {
  const router = useRouter();
  const { roomCode, playerNumber, username, uid } = useLocalSearchParams<{
    roomCode: string;
    playerNumber: string;
    username: string;
    uid: string;
  }>();

  const localPlayer: LocalPlayer = useMemo(
    () => ({
      playerNumber: parseInt(playerNumber ?? '1', 10) as PlayerNumber,
      username: username ?? 'Player',
      uid: uid ?? '',
    }),
    [playerNumber, username, uid]
  );

  const { gameState, validMoves, makeMove, isMyTurn, isLoading } = useGame(
    roomCode ?? '',
    localPlayer
  );

  const [moveCount, setMoveCount] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isLoading && gameState) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
  }, [isLoading, gameState]);

  const handleCellPress = (pos: Position) => {
    if (!isMyTurn) return;
    makeMove(pos);
    setMoveCount((c) => c + 1);
  };

  if (isLoading || !gameState) {
    return (
      <LinearGradient colors={['#060610', '#0a0a18']} style={styles.loadingContainer}>
        <Text style={styles.loadingKnight}>♞</Text>
        <Text style={styles.loadingText}>CONNECTING</Text>
        <View style={styles.loadingDots}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.loadingDot} />
          ))}
        </View>
      </LinearGradient>
    );
  }

  const myPos = localPlayer.playerNumber === 1 ? gameState.player1Pos : gameState.player2Pos;
  const isFinished = gameState.status === 'finished';
  const iWon = isFinished && gameState.winner === localPlayer.playerNumber;
  const winnerName = gameState.winner === 1 ? gameState.player1Name : gameState.player2Name;

  return (
    <LinearGradient colors={['#060610', '#080814', '#060610']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <GameStatusBar
          gameState={gameState}
          localPlayerNumber={localPlayer.playerNumber}
          isMyTurn={isMyTurn}
          moveCount={moveCount}
        />

        <Animated.View style={[styles.boardContainer, { opacity: fadeAnim }]}>
          <Board
            board={gameState.board}
            validMoves={isMyTurn ? validMoves : []}
            myPos={myPos}
            playerNumber={localPlayer.playerNumber}
            onCellPress={handleCellPress}
          />
        </Animated.View>

        {/* Bottom player info */}
        <View style={styles.bottomBar}>
          <View style={styles.youIndicator}>
            <Text style={styles.youKnight}>
              {localPlayer.playerNumber === 1 ? '♞' : '♞'}
            </Text>
            <Text style={styles.youLabel}>YOU · </Text>
            <Text style={styles.youName}>{localPlayer.username}</Text>
          </View>
          <Text style={styles.turnCount}>MOVE {moveCount + 1}</Text>
        </View>

        {isFinished && (
          <GameOverOverlay
            iWon={iWon}
            reason={gameState.winReason}
            winnerName={winnerName}
            onPlayAgain={() => router.replace('/')}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingKnight: {
    fontSize: 48,
    color: '#d4af37',
    opacity: 0.6,
  },
  loadingText: {
    color: '#3a3a5a',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 6,
  },
  loadingDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#d4af37',
    opacity: 0.4,
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
  },
  youIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  youKnight: {
    fontSize: 18,
    color: '#d4af37',
    marginRight: 6,
  },
  youLabel: {
    color: '#333355',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  youName: {
    color: '#555577',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  turnCount: {
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
    padding: 36,
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 16,
    height: 16,
  },
  cornerTL: { top: 10, left: 10, borderTopWidth: 1, borderLeftWidth: 1 },
  cornerTR: { top: 10, right: 10, borderTopWidth: 1, borderRightWidth: 1 },
  cornerBL: { bottom: 10, left: 10, borderBottomWidth: 1, borderLeftWidth: 1 },
  cornerBR: { bottom: 10, right: 10, borderBottomWidth: 1, borderRightWidth: 1 },
  gameOverEmoji: {
    fontSize: 56,
    color: '#d4af37',
    marginBottom: 12,
    textShadowColor: 'rgba(212,175,55,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  gameOverTitle: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 5,
    marginBottom: 16,
  },
  dividerLine: {
    width: '60%',
    height: 1,
    marginBottom: 16,
  },
  reasonText: {
    color: '#555577',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 20,
  },
  winnerRow: {
    alignItems: 'center',
    marginBottom: 28,
  },
  winnerLabel: {
    color: '#333355',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  winnerName: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  playAgainBtn: {
    paddingHorizontal: 44,
    paddingVertical: 14,
    borderRadius: 10,
    elevation: 6,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  playAgainText: {
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 2,
  },
});
