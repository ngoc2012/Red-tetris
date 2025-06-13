import React from 'react';
import { renderHook } from '@testing-library/react';
import { useGameLoop } from './GameLoop';
import { useSelector, useDispatch } from 'react-redux';
import { store, setRoomId, setStatus, setGamemode, setMode, setLevel } from '../store';
import socket from '../socket';
// import { pollGamepads } from '../utils/gamepad';
import { Status, PieceState } from '../../common/enums';
// import { next_pieces$ } from '../streams';

// Mock the external modules
jest.mock('react-redux');
jest.mock('../socket');
jest.mock('../utils/gamepad');
jest.mock("../store.js", () => ({
  store: { getState: jest.fn(), dispatch: jest.fn() },
  setRoomId: jest.fn((id) => ({ type: "SET_ROOM_ID", payload: id })),
  setStatus: jest.fn((s) => ({ type: "SET_STATUS", payload: s })),
  setGamemode: jest.fn((gm) => ({ type: "SET_GAMEMODE", payload: gm })),
  setMode: jest.fn((m) => ({ type: "SET_MODE", payload: m })),
  setLevel: jest.fn((l) => ({ type: "SET_LEVEL", payload: l })),
}));

jest.mock("../streams.js", () => ({
  pos$: jest.fn((value) => value),
  rot$: jest.fn((value) => value),
  keys$: jest.fn((value) => value),
  state$: jest.fn((value) => value),
  fall_count$: jest.fn((value) => value),
  lock_count$: jest.fn((value) => value),
  piece$: jest.fn(() => "T"),
  next_pieces$: jest.fn(() => ["T", "I", "O"]),
}));


import {
  pos$,
  rot$,
  keys$,
  state$,
  fall_count$,
  lock_count$,
  piece$,
  next_pieces$,
} from '../streams';

describe('useGameLoop', () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    useDispatch.mockReturnValue(mockDispatch);
    useSelector.mockImplementation((selector) => selector(store.getState()));

    store.getState.mockReturnValue({
      game_state: {
        status: Status.PLAYING,
        room_id: 'room1',
        level: 1,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // it('should initialize the game loop when status is PLAYING', () => {
  //   const { unmount } = renderHook(() => useGameLoop());

  //   expect(requestAnimationFrame).toHaveBeenCalled();
  //   unmount();
  // });

  // it('should cancel the game loop when status is not PLAYING', () => {
  //   store.getState.mockReturnValue({
  //     game_state: {
  //       status: 'game_over',
  //       room_id: 'room1',
  //       level: 1,
  //     },
  //   });

  //   const { unmount } = renderHook(() => useGameLoop());

  //   expect(cancelAnimationFrame).toHaveBeenCalled();
  //   unmount();
  // });

  it('should handle key presses correctly', () => {
    keys$( [39] ); // Simulate RIGHT key press

    renderHook(() => useGameLoop());

    // Assuming apply_key is called within the game loop
    expect(pos$).toHaveBeenCalled();
  });

  it('should transition to LOCKED state after LOCK frames', () => {
    const LOCK = 10; // Example lock frame count
    state$(PieceState.LOCKED);
    lock_count$(LOCK - 1);

    renderHook(() => useGameLoop());

    // Simulate the lock state transition
    // expect(lock_count$ - 1).toHaveBeenCalledWith(LOCK);
    expect(state$).toHaveBeenCalledWith(PieceState.FALLING);
  });

  it('should emit game_over on socket when status is game_over', () => {
    store.getState.mockReturnValue({
      game_state: {
        status: 'game_over',
        room_id: 'room1',
        level: 1,
      },
    });

    renderHook(() => useGameLoop());

    expect(socket.emit).toHaveBeenCalledWith('game_over', 'room1');
  });
});


import { apply_key } from './GameLoop';
import { WIDTH, RIGHT, DOWN, ROT, FALL } from '../../common/constants';