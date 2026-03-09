import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CellState } from '../types';

interface CellProps {
  state: CellState;
  isValidMove: boolean;
  isSelected: boolean;
  isPlayer1: boolean;
  row: number;
  col: number;
  size: number;
  onPress?: () => void;
}

export function Cell({
  state,
  isValidMove,
  isSelected,
  isPlayer1,
  row,
  col,
  size,
  onPress,
}: CellProps) {
  const isLight = (row + col) % 2 === 0;
  const bgColor = isLight ? '#f0d9b5' : '#b58863';

  const pulseScale = useRef(new Animated.Value(0.3)).current;
  const pulseOpacity = useRef(new Animated.Value(0.7)).current;
  const knightScale = useRef(new Animated.Value(1)).current;
  const selectedGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isValidMove) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseScale, { toValue: 0.85, duration: 700, useNativeDriver: true }),
            Animated.timing(pulseOpacity, { toValue: 0.15, duration: 700, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(pulseScale, { toValue: 0.3, duration: 700, useNativeDriver: true }),
            Animated.timing(pulseOpacity, { toValue: 0.7, duration: 700, useNativeDriver: true }),
          ]),
        ])
      );
      loop.start();
      return () => {
        loop.stop();
        pulseScale.setValue(0.3);
        pulseOpacity.setValue(0.7);
      };
    }
  }, [isValidMove]);

  useEffect(() => {
    if (isSelected) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(selectedGlow, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(selectedGlow, { toValue: 0.4, duration: 900, useNativeDriver: true }),
        ])
      );
      loop.start();
      Animated.spring(knightScale, { toValue: 1.1, useNativeDriver: true, friction: 4 }).start();
      return () => {
        loop.stop();
        selectedGlow.setValue(0);
        knightScale.setValue(1);
      };
    }
  }, [isSelected]);

  const isKnight = state === 'player1' || state === 'player2';
  const knightColor = state === 'player1' ? '#ffffff' : '#1a0a00';
  const knightShadowColor = state === 'player1' ? '#000' : '#d4af37';
  const ringSize = size * 0.82;

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          backgroundColor: bgColor,
        },
      ]}
      onPress={onPress}
      activeOpacity={isValidMove ? 0.6 : 1}
      disabled={!isValidMove}
    >
      {/* Visited overlay */}
      {state === 'visited' && (
        <View style={[styles.visitedOverlay, { backgroundColor: isLight ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.35)' }]}>
          <Text style={[styles.visitedX, { fontSize: size * 0.38 }]}>✕</Text>
        </View>
      )}

      {/* Valid move ring */}
      {isValidMove && (
        <Animated.View
          style={[
            styles.validRingOuter,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            },
          ]}
        />
      )}
      {isValidMove && (
        <View
          style={[
            styles.validDotCenter,
            {
              width: size * 0.22,
              height: size * 0.22,
              borderRadius: size * 0.11,
            },
          ]}
        />
      )}

      {/* Selected glow overlay */}
      {isSelected && (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: '#d4af37',
              opacity: Animated.multiply(selectedGlow, 0.18),
              borderRadius: 2,
            },
          ]}
        />
      )}

      {/* Selected border */}
      {isSelected && (
        <View style={[styles.selectedBorder, { borderRadius: 3 }]} />
      )}

      {/* Knight piece */}
      {isKnight && (
        <Animated.Text
          style={[
            styles.knight,
            {
              fontSize: size * 0.6,
              color: knightColor,
              textShadowColor: knightShadowColor,
              textShadowOffset: { width: 1, height: 2 },
              textShadowRadius: 4,
              transform: [{ scale: knightScale }],
            },
          ]}
        >
          ♞
        </Animated.Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  visitedOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitedX: {
    color: 'rgba(255,80,80,0.75)',
    fontWeight: '900',
  },
  validRingOuter: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#4ade80',
    backgroundColor: 'rgba(74,222,128,0.12)',
  },
  validDotCenter: {
    position: 'absolute',
    backgroundColor: 'rgba(74,222,128,0.55)',
  },
  selectedBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: '#d4af37',
  },
  knight: {
    fontWeight: 'bold',
  },
});
