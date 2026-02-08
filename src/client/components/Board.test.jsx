import React from 'react'
import { render, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { BUFFER, WIDTH } from '../../common/constants.js'
import { Gamemode } from '../../common/enums.js'

vi.mock('../socket.js', () => ({
  default: { emit: vi.fn() },
}))

vi.mock('../utils/utils.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    board_to_spectrum: vi.fn(() => ({ spectrum: Array(10).fill(0), penalty: 0 })),
  }
})

vi.mock('../useFlyd.js', () => ({
  useFlyd: vi.fn((stream) => stream()),
}))

vi.mock('../streams.js', () => ({
  pos$: () => 3,
  rot$: () => 0,
  piece$: () => '',
}))

import socket from '../socket.js'
import { board_to_spectrum } from '../utils/utils.js'
import { Board } from './Board.jsx'

const LENGTH = 20

const makeStore = (boardState = {}) => {
  const defaultBoard = Array.from({ length: (LENGTH + BUFFER) * WIDTH }).fill('')
  return configureStore({
    reducer: {
      game_state: (state = {
        board: boardState.board ?? defaultBoard,
        gamemode: boardState.gamemode ?? Gamemode.NORMAL,
      }, action) => {
        if (action.type === 'game_state/setBoard') return { ...state, board: action.payload }
        return state
      },
      player: (state = { id: '', name: 'player' }) => state,
    },
  })
}

describe('Board component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a div with class "board"', () => {
    const store = makeStore()
    const { container } = render(
      <Provider store={store}>
        <Board />
      </Provider>
    )
    const board = container.querySelector('.board')
    expect(board).toBeTruthy()
  })

  it('renders Grid with correct number of cells', () => {
    const store = makeStore()
    const { container } = render(
      <Provider store={store}>
        <Board />
      </Provider>
    )
    const cells = container.querySelectorAll('.cell')
    expect(cells.length).toBe(WIDTH * LENGTH)
  })

  it('emits board_update on mount', () => {
    const store = makeStore()
    render(
      <Provider store={store}>
        <Board />
      </Provider>
    )
    expect(socket.emit).toHaveBeenCalledWith('board_update', board_to_spectrum())
  })

  it('emits board_update when board changes', () => {
    const store = makeStore()
    render(
      <Provider store={store}>
        <Board />
      </Provider>
    )
    vi.clearAllMocks()

    const newBoard = Array.from({ length: (LENGTH + BUFFER) * WIDTH }).fill('')
    newBoard[(LENGTH + BUFFER - 1) * WIDTH] = 'I'
    act(() => {
      store.dispatch({ type: 'game_state/setBoard', payload: newBoard })
    })

    expect(socket.emit).toHaveBeenCalledWith('board_update', board_to_spectrum())
  })

  it('renders filled cells when board has pieces', () => {
    const board = Array.from({ length: (LENGTH + BUFFER) * WIDTH }).fill('')
    board[(LENGTH + BUFFER - 1) * WIDTH + 0] = 'I'
    board[(LENGTH + BUFFER - 1) * WIDTH + 1] = 'I'
    const store = makeStore({ board })

    const { container } = render(
      <Provider store={store}>
        <Board />
      </Provider>
    )
    const filled = container.querySelectorAll('.filled')
    expect(filled.length).toBe(2)
  })

  it('renders blocked cells for penalty rows', () => {
    const board = Array.from({ length: (LENGTH + BUFFER) * WIDTH }).fill('')
    for (let i = (LENGTH + BUFFER - 1) * WIDTH; i < (LENGTH + BUFFER) * WIDTH; i++) {
      board[i] = 'X'
    }
    const store = makeStore({ board })

    const { container } = render(
      <Provider store={store}>
        <Board />
      </Provider>
    )
    const blocked = container.querySelectorAll('.blocked')
    expect(blocked.length).toBe(WIDTH)
  })
})
