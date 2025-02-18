import { configureStore, createSlice } from '@reduxjs/toolkit'
import { createLogger } from 'redux-logger'
import { thunk } from 'redux-thunk'

import { storeStateMiddleWare } from './middleware/storeStateMiddleWare.js'

const initialState = {
  messages: [],
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
  },
});

export const store = configureStore({
  reducer: {
    game_state: game_stateSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(thunk, createLogger(), storeStateMiddleWare),
})

// Export actions
export const { setStatus } = game_stateSlice.actions;