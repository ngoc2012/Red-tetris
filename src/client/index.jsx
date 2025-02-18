import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './components/App.jsx';
import { store } from './store.js';
import flyd from 'flyd';
import { BrowserRouter } from "react-router";

const root = createRoot(document.getElementById('tetris'));
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);

export const key$ = flyd.stream();
document.addEventListener('keydown', (event) => {key$(event.key)});