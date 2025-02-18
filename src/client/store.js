import { configureStore, createSlice } from '@reduxjs/toolkit'
import { createLogger } from 'redux-logger'
import { thunk } from 'redux-thunk'

import { storeStateMiddleWare } from './storeStateMiddleWare.js'

const initialState = {
  player: {
    id: 0,
    name: "me",
  },
  game_state: {
    status: "game_over",
    board: [],
    current_piece: null,
    next_pieces: [],
    score: 0,
  },
};

const game_stateSlice = createSlice({
  name: "game_state",
  initialState: initialState.game_state,
  reducers: {
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    add_piece: (state, action) => {
      state.next_pieces += action.payload;
    },
    remove_piece: (state, action) => {
      state.next_pieces.slice(1);
    },
  },
});

const playerSlice = createSlice({
  name: "player",
  initialState: initialState.player,
  reducers: {
    setId: (state, action) => {
      state.id = action.payload;
    },
    setName: (state, action) => {
      state.name = action.payload;
    },
  },
});

export const store = configureStore({
  reducer: {
    game_state: game_stateSlice.reducer,
    player: playerSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(thunk, createLogger(), storeStateMiddleWare),
})

// Export actions
export const { setStatus, add_piece } = game_stateSlice.actions;
