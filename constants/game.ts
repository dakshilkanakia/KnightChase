import { Position } from '../types';

export const BOARD_SIZE = 8;

export const KNIGHT_MOVES: [number, number][] = [
  [-2, -1], [-2, 1],
  [-1, -2], [-1, 2],
  [1, -2],  [1, 2],
  [2, -1],  [2, 1],
];

export const INITIAL_PLAYER1_POS: Position = { row: 0, col: 0 };
export const INITIAL_PLAYER2_POS: Position = { row: 7, col: 7 };
