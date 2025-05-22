import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./components/App.jsx";
import { store } from "./store.js";
import flyd from "flyd";
import { BrowserRouter } from "react-router-dom";
import { PieceState } from "../common/enums.js";

const container = document.getElementById("tetris");
if (container) {
  const root = createRoot(container);
  root.render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );
} else
  console.error("❌ Failed to find root container #tetris. App not rendered.");



export const pos$ = flyd.stream(3);
export const rot$ = flyd.stream(0);
export const fall_count$ = flyd.stream(0);
export const lock_count$ = flyd.stream(0);
export const state$ = flyd.stream(PieceState.FALLING);
export const piece$ = flyd.stream("");
export const next_pieces$ = flyd.stream([]);
export const keys$ = flyd.stream([]);
