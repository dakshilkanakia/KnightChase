import { useEffect, useState, useCallback, useRef } from 'react';
import { GameState, LocalPlayer, Position, PlayerNumber, Board, CellState } from '../types';
import { getValidMoves, applyMove, checkGameOver } from '../lib/gameLogic';
import { subscribeToRoom, pushMove } from '../lib/roomManager';
import { INITIAL_PLAYER1_POS, INITIAL_PLAYER2_POS } from '../constants/game';
import { createInitialBoard } from '../lib/gameLogic';

function deserializeBoard(raw: unknown): Board {
  if (Array.isArray(raw)) {
    return (raw as unknown[][]).map((row) =>
      (row as unknown[]).map((cell) => cell as CellState)
    );
  }
  return createInitialBoard(INITIAL_PLAYER1_POS, INITIAL_PLAYER2_POS);
}

interface UseGameReturn {
  gameState: GameState | null;
  localPlayer: LocalPlayer;
  validMoves: Position[];
  makeMove: (to: Position) => void;
  isMyTurn: boolean;
  isLoading: boolean;
}

export function useGame(
  roomCode: string,
  localPlayer: LocalPlayer
): UseGameReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const gameStateRef = useRef<GameState | null>(null);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (!roomCode) return;

    const unsubscribe = subscribeToRoom(roomCode, (data: unknown) => {
      if (!data || typeof data !== 'object') {
        setIsLoading(false);
        return;
      }

      const room = data as Record<string, unknown>;
      const gs = room['gameState'] as Record<string, unknown> | undefined;

      if (!gs) {
        setIsLoading(false);
        return;
      }

      const board = deserializeBoard(gs['board']);

      const p1PosRaw = gs['player1Pos'] as { row: number; col: number } | undefined;
      const p2PosRaw = gs['player2Pos'] as { row: number; col: number } | undefined;

      const player1Pos: Position = p1PosRaw ?? INITIAL_PLAYER1_POS;
      const player2Pos: Position = p2PosRaw ?? INITIAL_PLAYER2_POS;

      const p1 = room['player1'] as { name: string; uid: string } | undefined;
      const p2 = room['player2'] as { name: string; uid: string } | null | undefined;

      const newState: GameState = {
        board,
        player1Pos,
        player2Pos,
        currentTurn: (gs['currentTurn'] as PlayerNumber) ?? 1,
        status: (room['status'] as GameState['status']) ?? 'waiting',
        winner: (gs['winner'] as PlayerNumber | null) ?? null,
        winReason: (gs['winReason'] as GameState['winReason']) ?? null,
        player1Name: p1?.name ?? 'Player 1',
        player2Name: p2?.name ?? 'Player 2',
        roomCode,
      };

      setGameState(newState);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [roomCode]);

  const isMyTurn =
    gameState !== null &&
    gameState.status === 'playing' &&
    gameState.currentTurn === localPlayer.playerNumber;

  const myPos =
    gameState !== null
      ? localPlayer.playerNumber === 1
        ? gameState.player1Pos
        : gameState.player2Pos
      : null;

  const opponentPos =
    gameState !== null
      ? localPlayer.playerNumber === 1
        ? gameState.player2Pos
        : gameState.player1Pos
      : null;

  const validMoves: Position[] =
    isMyTurn && myPos !== null && opponentPos !== null && gameState !== null
      ? getValidMoves(myPos, gameState.board, opponentPos)
      : [];

  const makeMove = useCallback(
    (to: Position) => {
      const current = gameStateRef.current;
      if (!current) return;
      if (current.status !== 'playing') return;
      if (current.currentTurn !== localPlayer.playerNumber) return;

      const from =
        localPlayer.playerNumber === 1 ? current.player1Pos : current.player2Pos;
      const opponent =
        localPlayer.playerNumber === 1 ? current.player2Pos : current.player1Pos;

      // Validate move
      const moves = getValidMoves(from, current.board, opponent);
      const isValid = moves.some((m) => m.row === to.row && m.col === to.col);
      if (!isValid) return;

      // Check if capture
      const capturedOpponent = to.row === opponent.row && to.col === opponent.col;

      // Apply move
      const { board: newBoard, p1Pos, p2Pos } = applyMove(
        current.board,
        localPlayer.playerNumber,
        from,
        to,
        current.player1Pos,
        current.player2Pos
      );

      // Check game over
      const { isOver, winner, reason } = checkGameOver(
        newBoard,
        p1Pos,
        p2Pos,
        localPlayer.playerNumber,
        capturedOpponent
      );

      const nextTurn: PlayerNumber = localPlayer.playerNumber === 1 ? 2 : 1;

      const update: Partial<GameState> = {
        board: newBoard,
        player1Pos: p1Pos,
        player2Pos: p2Pos,
        currentTurn: isOver ? current.currentTurn : nextTurn,
        winner: winner,
        winReason: reason,
        status: isOver ? 'finished' : 'playing',
      };

      pushMove(roomCode, update).catch(console.error);
    },
    [roomCode, localPlayer]
  );

  return { gameState, localPlayer, validMoves, makeMove, isMyTurn, isLoading };
}
