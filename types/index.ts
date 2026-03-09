export type Position = { row: number; col: number };

export type CellState = 'empty' | 'visited' | 'player1' | 'player2';

export type Board = CellState[][];

export type PlayerNumber = 1 | 2;

export type GameStatus =
  | 'waiting'
  | 'playing'
  | 'finished';

export type GameState = {
  board: Board;
  player1Pos: Position;
  player2Pos: Position;
  currentTurn: PlayerNumber;
  status: GameStatus;
  winner: PlayerNumber | null;
  winReason: 'no_moves' | 'captured' | null;
  player1Name: string;
  player2Name: string;
  roomCode: string;
};

export type LocalPlayer = {
  playerNumber: PlayerNumber;
  username: string;
  uid: string;
};
