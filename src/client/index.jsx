import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "./components/App.jsx";
import { store } from "./store.js";
import flyd from "flyd";
import { BrowserRouter } from "react-router-dom";

const root = createRoot(document.getElementById("tetris"));
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);

export const key$ = flyd.stream();
export const pos$ = flyd.stream(0);
export const rot$ = flyd.stream(0);
export const piece$ = flyd.stream("");
export const next_pieces$ = flyd.stream([]);
