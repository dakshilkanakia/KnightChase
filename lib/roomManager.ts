import {
  ref,
  set,
  get,
  update,
  onValue,
  remove,
  serverTimestamp,
} from 'firebase/database';
import { db } from '../config/firebase';
import { GameState } from '../types';
import { BOARD_SIZE, INITIAL_PLAYER1_POS, INITIAL_PLAYER2_POS } from '../constants/game';
import { createInitialBoard } from './gameLogic';

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function createRoom(uid: string, username: string): Promise<string> {
  let roomCode = generateRoomCode();

  // Ensure unique room code
  let attempts = 0;
  while (attempts < 10) {
    const snapshot = await get(ref(db, `rooms/${roomCode}`));
    if (!snapshot.exists()) break;
    roomCode = generateRoomCode();
    attempts++;
  }

  const initialBoard = createInitialBoard(INITIAL_PLAYER1_POS, INITIAL_PLAYER2_POS);

  const roomData = {
    roomCode,
    status: 'waiting',
    player1: { uid, name: username },
    player2: null,
    gameState: {
      board: initialBoard,
      player1Pos: INITIAL_PLAYER1_POS,
      player2Pos: INITIAL_PLAYER2_POS,
      currentTurn: 1,
      winner: null,
      winReason: null,
    },
    createdAt: Date.now(),
  };

  await set(ref(db, `rooms/${roomCode}`), roomData);
  return roomCode;
}

export async function joinRoom(
  roomCode: string,
  uid: string,
  username: string
): Promise<void> {
  const roomRef = ref(db, `rooms/${roomCode}`);
  const snapshot = await get(roomRef);

  if (!snapshot.exists()) {
    throw new Error('Room not found');
  }

  const room = snapshot.val();
  if (room.player2 !== null && room.player2 !== undefined) {
    throw new Error('Room is full');
  }

  if (room.status !== 'waiting') {
    throw new Error('Room is not available');
  }

  await update(roomRef, {
    'player2/uid': uid,
    'player2/name': username,
    status: 'playing',
  });
}

export function subscribeToRoom(
  roomCode: string,
  callback: (data: unknown) => void
): () => void {
  const roomRef = ref(db, `rooms/${roomCode}`);
  const unsubscribe = onValue(roomRef, (snapshot) => {
    callback(snapshot.val());
  });
  return unsubscribe;
}

export async function pushMove(
  roomCode: string,
  newGameState: Partial<GameState>
): Promise<void> {
  const roomRef = ref(db, `rooms/${roomCode}`);
  const updates: Record<string, unknown> = {};

  if (newGameState.board !== undefined) updates['gameState/board'] = newGameState.board;
  if (newGameState.player1Pos !== undefined) updates['gameState/player1Pos'] = newGameState.player1Pos;
  if (newGameState.player2Pos !== undefined) updates['gameState/player2Pos'] = newGameState.player2Pos;
  if (newGameState.currentTurn !== undefined) updates['gameState/currentTurn'] = newGameState.currentTurn;
  if (newGameState.winner !== undefined) updates['gameState/winner'] = newGameState.winner;
  if (newGameState.winReason !== undefined) updates['gameState/winReason'] = newGameState.winReason;
  if (newGameState.status !== undefined) updates['status'] = newGameState.status;

  await update(roomRef, updates);
}

export async function deleteRoom(roomCode: string): Promise<void> {
  await remove(ref(db, `rooms/${roomCode}`));
}
