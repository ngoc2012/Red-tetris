// import React from 'react';
// import { render, screen } from '@testing-library/react';
// import { Provider } from 'react-redux';
// import { configureStore } from '@reduxjs/toolkit';
// // import gameStateReducer from '../../src/store/gameStateSlice'; // Adjust the import path as necessary
// import { Board } from '../../src/client/components/Board.jsx'; // Adjust the import path as necessary

// // // Mock flyd streams
// // jest.mock('../../src/index.jsx', () => ({
// //   pos$: () => [0, 0],
// //   rot$: () => 0,
// //   piece$: () => 'T',
// // }));

// // // Mock socket
// // jest.mock('../../src/socket.js', () => ({
// //   default: {
// //     emit: jest.fn(),
// //   },
// // }));

// // describe('Board Component', () => {
// //   let store;

// //   beforeEach(() => {
// //     store = configureStore({
// //       reducer: {
// //         game_state: gameStateReducer,
// //       },
// //       preloadedState: {
// //         game_state: {
// //           board: Array(220).fill(''), // WIDTH * (LENGTH + BUFFER)
// //           gamemode: 'NORMAL',
// //         },
// //       },
// //     });
// //   });

// //   it('renders the board with correct number of squares', () => {
// //     const { container } = render(
// //       <Provider store={store}>
// //         <Board />
// //       </Provider>
// //     );

// //     const cells = container.querySelectorAll('.cell');
// //     expect(cells.length).toBe(200); // BUFFER is not rendered
// //   });
// // });
