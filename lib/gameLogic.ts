import { Board, CellState, PlayerNumber, Position } from '../types';
import { BOARD_SIZE, KNIGHT_MOVES } from '../constants/game';

export function createInitialBoard(p1: Position, p2: Position): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill('empty') as CellState[]
  );
  board[p1.row][p1.col] = 'player1';
  board[p2.row][p2.col] = 'player2';
  return board;
}

export function isInBounds(pos: Position): boolean {
  return pos.row >= 0 && pos.row < BOARD_SIZE && pos.col >= 0 && pos.col < BOARD_SIZE;
}

export function getValidMoves(
  pos: Position,
  board: Board,
  opponentPos: Position
): Position[] {
  return KNIGHT_MOVES
    .map(([dr, dc]) => ({ row: pos.row + dr, col: pos.col + dc }))
    .filter((target) => {
      if (!isInBounds(target)) return false;
      const cell = board[target.row][target.col];
      // Can't move to visited cells
      if (cell === 'visited') return false;
      // Can move to own position? No (can't stay — but this covers the player's own cell which is already player1/player2)
      // Can't move to own current position (same pos)
      if (target.row === pos.row && target.col === pos.col) return false;
      // Can move to opponent's position (capture)
      // opponent cell is 'player1' or 'player2' — allowed
      return true;
    });
}

export function applyMove(
  board: Board,
  movingPlayer: PlayerNumber,
  from: Position,
  to: Position,
  p1Pos: Position,
  p2Pos: Position
): { board: Board; p1Pos: Position; p2Pos: Position } {
  // Deep clone the board
  const newBoard: Board = board.map((row) => [...row] as CellState[]);

  // Mark old position as visited
  newBoard[from.row][from.col] = 'visited';

  // Move knight to new position
  newBoard[to.row][to.col] = movingPlayer === 1 ? 'player1' : 'player2';

  const newP1Pos = movingPlayer === 1 ? to : p1Pos;
  const newP2Pos = movingPlayer === 2 ? to : p2Pos;

  // If moving onto opponent's cell (capture), mark opponent's old cell state is already overwritten above
  // We just need positions to be consistent
  return { board: newBoard, p1Pos: newP1Pos, p2Pos: newP2Pos };
}

export function checkGameOver(
  board: Board,
  p1Pos: Position,
  p2Pos: Position,
  justMoved: PlayerNumber,
  capturedOpponent: boolean
): { isOver: boolean; winner: PlayerNumber | null; reason: 'no_moves' | 'captured' | null } {
  // Check if move was a capture
  if (capturedOpponent) {
    return { isOver: true, winner: justMoved, reason: 'captured' };
  }

  // Check if the OTHER player has valid moves
  const otherPlayer: PlayerNumber = justMoved === 1 ? 2 : 1;
  const otherPos = otherPlayer === 1 ? p1Pos : p2Pos;
  const otherOpponentPos = otherPlayer === 1 ? p2Pos : p1Pos;

  const validMoves = getValidMoves(otherPos, board, otherOpponentPos);

  if (validMoves.length === 0) {
    return { isOver: true, winner: justMoved, reason: 'no_moves' };
  }

  return { isOver: false, winner: null, reason: null };
}
