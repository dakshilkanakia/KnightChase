import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GameState, PlayerNumber } from '../types';

interface GameStatusBarProps {
  gameState: GameState;
  localPlayerNumber: PlayerNumber;
  isMyTurn: boolean;
  moveCount: number;
}

export function GameStatusBar({
  gameState,
  localPlayerNumber,
  isMyTurn,
  moveCount,
}: GameStatusBarProps) {
  const glowAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  }, []);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
      ])
    );
    if (isMyTurn) loop.start();
    else {
      loop.stop();
      glowAnim.setValue(0);
    }
    return () => loop.stop();
  }, [isMyTurn]);

  const p1Active = gameState.currentTurn === 1;
  const p2Active = gameState.currentTurn === 2;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [-60, 0] }) }] }]}>
      <LinearGradient
        colors={['#1a1a3a', '#0f0f22', '#1a1a3a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {/* Player 1 */}
        <View style={[styles.playerSection, styles.playerLeft]}>
          <View style={[styles.playerCard, p1Active && styles.playerCardActive]}>
            {p1Active && (
              <View style={styles.activeIndicatorBar} />
            )}
            <Text style={[styles.knightIcon, { color: '#f0d9b5' }]}>♞</Text>
            <View>
              <Text style={styles.playerLabel}>PLAYER 1</Text>
              <Text style={[styles.playerName, p1Active && styles.playerNameActive]} numberOfLines={1}>
                {gameState.player1Name}
              </Text>
            </View>
          </View>
        </View>

        {/* Center turn indicator */}
        <View style={styles.center}>
          {isMyTurn ? (
            <Animated.View style={[styles.yourTurnBadge, { opacity: glowAnim.interpolate({ inputRange: [0.3, 1], outputRange: [0.7, 1] }) }]}>
              <LinearGradient
                colors={['#b8860b', '#d4af37', '#b8860b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.yourTurnGradient}
              >
                <Text style={styles.yourTurnText}>YOUR{'\n'}TURN</Text>
              </LinearGradient>
            </Animated.View>
          ) : (
            <View style={styles.waitingBadge}>
              <Text style={styles.waitingText}>WAIT</Text>
              <Text style={styles.moveCountText}>#{moveCount}</Text>
            </View>
          )}
        </View>

        {/* Player 2 */}
        <View style={[styles.playerSection, styles.playerRight]}>
          <View style={[styles.playerCard, styles.playerCardRight, p2Active && styles.playerCardActive]}>
            {p2Active && (
              <View style={[styles.activeIndicatorBar, styles.activeIndicatorRight]} />
            )}
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.playerLabel}>PLAYER 2</Text>
              <Text style={[styles.playerName, p2Active && styles.playerNameActive]} numberOfLines={1}>
                {gameState.player2Name}
              </Text>
            </View>
            <Text style={[styles.knightIcon, { color: '#3d2009' }]}>♞</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Bottom accent line */}
      <LinearGradient
        colors={['transparent', '#d4af37', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accentLine}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 72,
  },
  playerSection: {
    flex: 1,
  },
  playerLeft: {
    alignItems: 'flex-start',
  },
  playerRight: {
    alignItems: 'flex-end',
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    position: 'relative',
  },
  playerCardRight: {
    flexDirection: 'row-reverse',
  },
  playerCardActive: {
    backgroundColor: 'rgba(212,175,55,0.1)',
  },
  activeIndicatorBar: {
    position: 'absolute',
    left: 0,
    top: 4,
    bottom: 4,
    width: 3,
    backgroundColor: '#d4af37',
    borderRadius: 2,
  },
  activeIndicatorRight: {
    left: undefined,
    right: 0,
  },
  knightIcon: {
    fontSize: 28,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  playerLabel: {
    color: '#555',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  playerName: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
    maxWidth: 90,
  },
  playerNameActive: {
    color: '#fff',
    fontWeight: '800',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 72,
  },
  yourTurnBadge: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  yourTurnGradient: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignItems: 'center',
  },
  yourTurnText: {
    color: '#0a0a14',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  waitingBadge: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a3a',
  },
  waitingText: {
    color: '#444',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  moveCountText: {
    color: '#555',
    fontSize: 11,
    fontWeight: '600',
  },
  accentLine: {
    height: 1,
    opacity: 0.4,
  },
});
