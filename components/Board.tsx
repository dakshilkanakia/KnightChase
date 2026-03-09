import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Board as BoardType, Position } from '../types';
import { Cell } from './Cell';
import { BOARD_SIZE } from '../constants/game';

interface BoardProps {
  board: BoardType;
  validMoves: Position[];
  myPos: Position | null;
  playerNumber: 1 | 2;
  onCellPress: (pos: Position) => void;
}

export function Board({ board, validMoves, myPos, playerNumber, onCellPress }: BoardProps) {
  const { width } = useWindowDimensions();
  const FRAME = 8;
  const cellSize = Math.floor((width - FRAME * 2) / BOARD_SIZE);
  const boardSize = cellSize * BOARD_SIZE;

  const isValidMove = (row: number, col: number): boolean =>
    validMoves.some((m) => m.row === row && m.col === col);

  const isSelected = (row: number, col: number): boolean =>
    myPos !== null && myPos.row === row && myPos.col === col;

  return (
    <View style={styles.outerFrame}>
      {/* Wood frame gradient */}
      <LinearGradient
        colors={['#6b4423', '#3d2009', '#4a2c10', '#3d2009', '#6b4423']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.frame,
          { padding: FRAME, borderRadius: 8 },
        ]}
      >
        <View
          style={[
            styles.board,
            { width: boardSize, height: boardSize },
          ]}
        >
          {board.map((rowArr, row) => (
            <View key={row} style={styles.row}>
              {rowArr.map((cellState, col) => {
                const valid = isValidMove(row, col);
                const selected = isSelected(row, col);
                return (
                  <Cell
                    key={col}
                    state={cellState}
                    isValidMove={valid}
                    isSelected={selected}
                    isPlayer1={playerNumber === 1}
                    row={row}
                    col={col}
                    size={cellSize}
                    onPress={valid ? () => onCellPress({ row, col }) : undefined}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Shadow beneath board */}
      <View style={[styles.boardShadow, { width: boardSize + FRAME * 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  outerFrame: {
    alignItems: 'center',
  },
  frame: {
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
  },
  board: {
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
  boardShadow: {
    height: 10,
    marginTop: -6,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 0,
  },
});
