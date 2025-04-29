import { configureStore, createSlice } from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";
import { thunk } from "redux-thunk";

import { storeStateMiddleWare } from "./storeStateMiddleWare.js";
import { BUFFER, LENGTH, WIDTH } from "../common/constants.js";
import { Mode, Gamemode } from "../common/enums.js";

const initialState = {
  player: {
    id: "",
    name: "player",
  },
  game_state: {
    room_id: -1,
    status: "waiting",
    mode: Mode.SINGLE,
    gamemode: Gamemode.NORMAL,
    board: Array.from({ length: (LENGTH + BUFFER) * WIDTH }).fill(""),
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
    setMode: (state, action) => {
      state.mode = action.payload;
    },
    setGamemode: (state, action) => {
      state.gamemode = action.payload;
    },
    setBoard: (state, action) => {
      state.board = action.payload;
    },
    resetBoard: (state) => {
      state.board = initialState.game_state.board;
    },
    setScore: (state, action) => {
      state.score = action.payload;
    },
    setRoomId: (state, action) => {
      state.room_id = action.payload;
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
});

// Export actions
export const {
  setStatus,
  setMode,
  setGamemode,
  setRoomId,
  setBoard,
  setScore,
  resetBoard,
} = game_stateSlice.actions;
export const { setId, setName } = playerSlice.actions;
