import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './containers/app.jsx'
import { store } from './store.js'
import flyd from 'flyd'

// var number = flyd.stream(5);
// console.log(number());
// console.log(number(7));
// console.log(number());

// function setVh() {
//   // Calculate 1% of the viewport height
//   let vh = window.innerHeight * 0.01;
//   // Set the value in the --vh custom property on the root
//   document.documentElement.style.setProperty('--vh', `${vh}px`);
// }

// // Initial execution
// setVh();
// // Update the value on resize to handle orientation changes
// window.addEventListener('resize', setVh);

const root = createRoot(document.getElementById('tetris'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

export const key$ = flyd.stream();
document.addEventListener('keydown', (event) => {key$(event.key)});
// store.dispatch(alert('Soon, will be here a fantastic Tetris ...'))
