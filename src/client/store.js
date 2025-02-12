import { configureStore, createSlice } from '@reduxjs/toolkit'
import { createLogger } from 'redux-logger'
import { thunk } from 'redux-thunk'

import { storeStateMiddleWare } from './middleware/storeStateMiddleWare.js'
// import reducer from './reducers/index.js'
// import { alert } from './actions/alert.js'

const initialState = {
  messages: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
});

export const store = configureStore({
  reducer: {
    chat: chatSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(thunk, createLogger(), storeStateMiddleWare),
})

// Export actions
export const { addMessage } = chatSlice.actions;