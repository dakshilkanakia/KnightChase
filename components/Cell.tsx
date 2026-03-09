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

// Coordinate helpers
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

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
  const lightSq = '#f0d9b5';
  const darkSq  = '#8b6340';
  const bgColor = isLight ? lightSq : darkSq;

  const validOpacity = useRef(new Animated.Value(0.35)).current;
  const badgeScale   = useRef(new Animated.Value(1)).current;
  const glowOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isValidMove) { validOpacity.setValue(0.35); return; }
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(validOpacity, { toValue: 0.65, duration: 520, useNativeDriver: true }),
      Animated.timing(validOpacity, { toValue: 0.22, duration: 520, useNativeDriver: true }),
    ]));
    loop.start();
    return () => { loop.stop(); validOpacity.setValue(0.35); };
  }, [isValidMove]);

  useEffect(() => {
    if (!isSelected) { badgeScale.setValue(1); glowOpacity.setValue(0); return; }
    Animated.spring(badgeScale, { toValue: 1.14, useNativeDriver: true, tension: 220, friction: 5 }).start();
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(glowOpacity, { toValue: 1,   duration: 850, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 0.3, duration: 850, useNativeDriver: true }),
    ]));
    loop.start();
    return () => { loop.stop(); badgeScale.setValue(1); glowOpacity.setValue(0); };
  }, [isSelected]);

  const isKnight = state === 'player1' || state === 'player2';
  const isP1     = state === 'player1';

  const badgeSize = size * 0.84;
  const fontSize  = size * 0.54;

  // P1 = creamy white piece with dark knight
  // P2 = dark espresso piece with gold knight
  const badgeBg     = isP1 ? '#f5f0e0' : '#1e0e04';
  const pieceColor  = isP1 ? '#110800' : '#d4af37';
  const badgeBorder = isP1 ? 'rgba(50,25,0,0.25)' : 'rgba(212,175,55,0.5)';
  const shadowClr   = isP1 ? 'rgba(0,0,0,0.7)' : 'rgba(212,175,55,0.55)';

  // Show coordinate label in border cells
  const showFile = row === 7;
  const showRank = col === 0;
  const coordColor = isLight ? 'rgba(139,99,64,0.85)' : 'rgba(240,217,181,0.7)';
  const coordSize  = Math.max(size * 0.19, 9);

  return (
    <TouchableOpacity
      style={[styles.cell, { width: size, height: size, backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={isValidMove ? 0.75 : 1}
      disabled={!isValidMove}
    >
      {/* Subtle inner vignette for depth */}
      <View style={[styles.vignette, { borderRadius: 1 }]} />

      {/* Valid move: full-cell pulsing overlay */}
      {isValidMove && (
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: '#22c55e', opacity: Animated.multiply(validOpacity, 0.55) }]}
        />
      )}

      {/* Valid move: centre dot (only when no piece) */}
      {isValidMove && !isKnight && (
        <View style={[styles.validDot, { width: size * 0.28, height: size * 0.28, borderRadius: size * 0.14 }]} />
      )}

      {/* Visited: dark overlay + crossed lines */}
      {state === 'visited' && (
        <View style={[styles.visitedOverlay, { opacity: isLight ? 0.55 : 0.45 }]}>
          <View style={styles.crossLine1} />
          <View style={styles.crossLine2} />
        </View>
      )}

      {/* Selected: animated gold border */}
      {isSelected && (
        <Animated.View style={[StyleSheet.absoluteFill, styles.selectedBorder, { opacity: glowOpacity }]} />
      )}

      {/* Knight badge */}
      {isKnight && (
        <Animated.View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: badgeBg,
              borderColor: badgeBorder,
              shadowColor: shadowClr,
              elevation: isSelected ? 12 : 6,
              transform: [{ scale: badgeScale }],
            },
          ]}
        >
          <Text style={{ fontSize, color: pieceColor, fontWeight: '900', includeFontPadding: false, lineHeight: fontSize * 1.15 }}>
            ♞
          </Text>
        </Animated.View>
      )}

      {/* Coordinate labels — file (a-h) bottom-right of bottom row */}
      {showFile && (
        <Text style={[styles.coordFile, { fontSize: coordSize, color: coordColor }]}>
          {FILES[col]}
        </Text>
      )}
      {/* Rank (8-1) top-left of left column */}
      {showRank && (
        <Text style={[styles.coordRank, { fontSize: coordSize, color: coordColor }]}>
          {8 - row}
        </Text>
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
  vignette: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 5,
    zIndex: 2,
  },
  validDot: {
    backgroundColor: '#15803d',
    opacity: 0.9,
    zIndex: 1,
  },
  visitedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  crossLine1: {
    position: 'absolute',
    width: '75%',
    height: 2,
    backgroundColor: 'rgba(248,60,60,0.8)',
    transform: [{ rotate: '45deg' }],
    borderRadius: 1,
  },
  crossLine2: {
    position: 'absolute',
    width: '75%',
    height: 2,
    backgroundColor: 'rgba(248,60,60,0.8)',
    transform: [{ rotate: '-45deg' }],
    borderRadius: 1,
  },
  selectedBorder: {
    borderWidth: 3,
    borderColor: '#d4af37',
    shadowColor: '#d4af37',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    zIndex: 3,
  },
  coordFile: {
    position: 'absolute',
    bottom: 2,
    right: 3,
    fontWeight: '700',
  },
  coordRank: {
    position: 'absolute',
    top: 2,
    left: 3,
    fontWeight: '700',
  },
});
