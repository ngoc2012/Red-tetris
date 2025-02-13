import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './containers/app.jsx'
import { store } from './store.js'
// import flyd from 'flyd'

// var number = flyd.stream(5);
// console.log(number());
// console.log(number(7));
// console.log(number());

const root = createRoot(document.getElementById('tetris'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

// store.dispatch(alert('Soon, will be here a fantastic Tetris ...'))
