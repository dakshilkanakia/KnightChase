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
  // Richer, more saturated board colors
  const bgColor = isLight ? '#f0d9b5' : '#a97a56';

  const validOverlay = useRef(new Animated.Value(0.4)).current;
  const badgeScale = useRef(new Animated.Value(1)).current;
  const badgeShadow = useRef(new Animated.Value(0)).current;

  // Pulsing green overlay on valid moves
  useEffect(() => {
    if (!isValidMove) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(validOverlay, { toValue: 0.7, duration: 550, useNativeDriver: true }),
        Animated.timing(validOverlay, { toValue: 0.25, duration: 550, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => { loop.stop(); validOverlay.setValue(0.4); };
  }, [isValidMove]);

  // Selected piece: bounce in + breathing glow
  useEffect(() => {
    if (!isSelected) return;
    Animated.spring(badgeScale, {
      toValue: 1.12,
      useNativeDriver: true,
      tension: 200,
      friction: 5,
    }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(badgeShadow, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(badgeShadow, { toValue: 0.3, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => {
      loop.stop();
      badgeScale.setValue(1);
      badgeShadow.setValue(0);
    };
  }, [isSelected]);

  const isKnight = state === 'player1' || state === 'player2';
  const isP1Piece = state === 'player1';

  const badgeSize = size * 0.78;
  const fontSize = size * 0.5;

  // Badge colors
  const badgeBg = isP1Piece ? '#f5f0e0' : '#1c0c02';
  const pieceColor = isP1Piece ? '#0d0500' : '#d4af37';
  const badgeShadowColor = isP1Piece ? 'rgba(0,0,0,0.55)' : 'rgba(212,175,55,0.5)';
  const badgeBorderColor = isP1Piece ? 'rgba(0,0,0,0.15)' : 'rgba(212,175,55,0.4)';

  return (
    <TouchableOpacity
      style={[styles.cell, { width: size, height: size, backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={isValidMove ? 0.75 : 1}
      disabled={!isValidMove}
    >
      {/* Valid move: full-cell green overlay */}
      {isValidMove && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: '#4ade80', opacity: Animated.multiply(validOverlay, 0.38) },
          ]}
        />
      )}

      {/* Valid move: center dot */}
      {isValidMove && !isKnight && (
        <View
          style={[
            styles.validDot,
            { width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15 },
          ]}
        />
      )}

      {/* Visited: dark cross-hatch overlay */}
      {state === 'visited' && (
        <View style={[styles.visitedOverlay, { opacity: isLight ? 0.52 : 0.42 }]}>
          {/* Diagonal lines via rotated views */}
          <View style={styles.visitedLine1} />
          <View style={styles.visitedLine2} />
        </View>
      )}

      {/* Selected: gold border */}
      {isSelected && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.selectedBorder,
            { opacity: badgeShadow },
          ]}
        />
      )}

      {/* Knight badge */}
      {isKnight && (
        <Animated.View
          style={[
            styles.pieceBadge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: badgeBg,
              borderColor: badgeBorderColor,
              shadowColor: badgeShadowColor,
              shadowRadius: isSelected ? 10 : 5,
              elevation: isSelected ? 10 : 5,
              transform: [{ scale: badgeScale }],
            },
          ]}
        >
          <Text
            style={[
              styles.knightText,
              {
                fontSize,
                color: pieceColor,
              },
            ]}
          >
            ♞
          </Text>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  pieceBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    zIndex: 2,
  },
  knightText: {
    fontWeight: '900',
    lineHeight: undefined,
    includeFontPadding: false,
  },
  validDot: {
    backgroundColor: '#16a34a',
    opacity: 0.85,
    zIndex: 1,
  },
  visitedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  visitedLine1: {
    position: 'absolute',
    width: '130%',
    height: 1.5,
    backgroundColor: 'rgba(255,60,60,0.7)',
    transform: [{ rotate: '45deg' }],
  },
  visitedLine2: {
    position: 'absolute',
    width: '130%',
    height: 1.5,
    backgroundColor: 'rgba(255,60,60,0.7)',
    transform: [{ rotate: '-45deg' }],
  },
  selectedBorder: {
    borderWidth: 3,
    borderColor: '#d4af37',
    zIndex: 3,
  },
});
