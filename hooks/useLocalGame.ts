import { useCallback, useState } from 'react';
import { GameState, PlayerNumber, Position } from '../types';
import { createInitialBoard, getValidMoves, applyMove, checkGameOver } from '../lib/gameLogic';
import { INITIAL_PLAYER1_POS, INITIAL_PLAYER2_POS } from '../constants/game';

function makeInitialState(player1Name: string, player2Name: string): GameState {
  return {
    board: createInitialBoard(INITIAL_PLAYER1_POS, INITIAL_PLAYER2_POS),
    player1Pos: INITIAL_PLAYER1_POS,
    player2Pos: INITIAL_PLAYER2_POS,
    currentTurn: 1,
    status: 'playing',
    winner: null,
    winReason: null,
    player1Name,
    player2Name,
    roomCode: 'LOCAL',
  };
}

export function useLocalGame(player1Name: string, player2Name: string) {
  const [gameState, setGameState] = useState<GameState>(() =>
    makeInitialState(player1Name, player2Name)
  );

  const currentPos =
    gameState.currentTurn === 1 ? gameState.player1Pos : gameState.player2Pos;
  const opponentPos =
    gameState.currentTurn === 1 ? gameState.player2Pos : gameState.player1Pos;

  const validMoves: Position[] =
    gameState.status === 'playing'
      ? getValidMoves(currentPos, gameState.board, opponentPos)
      : [];

  const makeMove = useCallback((to: Position) => {
    setGameState((prev) => {
      if (prev.status !== 'playing') return prev;

      const from = prev.currentTurn === 1 ? prev.player1Pos : prev.player2Pos;
      const opponent = prev.currentTurn === 1 ? prev.player2Pos : prev.player1Pos;

      const moves = getValidMoves(from, prev.board, opponent);
      if (!moves.some((m) => m.row === to.row && m.col === to.col)) return prev;

      const capturedOpponent = to.row === opponent.row && to.col === opponent.col;

      const { board: newBoard, p1Pos, p2Pos } = applyMove(
        prev.board,
        prev.currentTurn,
        from,
        to,
        prev.player1Pos,
        prev.player2Pos
      );

      const { isOver, winner, reason } = checkGameOver(
        newBoard,
        p1Pos,
        p2Pos,
        prev.currentTurn,
        capturedOpponent
      );

      const nextTurn: PlayerNumber = prev.currentTurn === 1 ? 2 : 1;

      return {
        ...prev,
        board: newBoard,
        player1Pos: p1Pos,
        player2Pos: p2Pos,
        currentTurn: isOver ? prev.currentTurn : nextTurn,
        status: isOver ? 'finished' : 'playing',
        winner,
        winReason: reason,
      };
    });
  }, []);

  const resetGame = useCallback(() => {
    setGameState(makeInitialState(player1Name, player2Name));
  }, [player1Name, player2Name]);

  return { gameState, validMoves, makeMove, resetGame };
}
