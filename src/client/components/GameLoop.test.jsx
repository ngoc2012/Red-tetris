import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { Gamemode, Mode, Status } from '../../common/enums.js'
import { BUFFER, WIDTH } from '../../common/constants.js'

const mockEmit = vi.fn()
vi.mock('../socket.js', () => ({
  default: { emit: (...args) => mockEmit(...args), on: vi.fn(), off: vi.fn() },
}))

vi.mock('../store.js', () => ({
  store: {
    dispatch: vi.fn(),
    getState: () => ({
      game_state: { status: 'waiting', room_id: 0, level: 0 },
    }),
  },
}))

vi.mock('../streams.js', () => ({
  pos$: (v) => v !== undefined ? v : 3,
  rot$: (v) => v !== undefined ? v : 0,
  keys$: (v) => v !== undefined ? v : [],
  state$: (v) => v !== undefined ? v : 'falling',
  fall_count$: (v) => v !== undefined ? v : 0,
  lock_count$: (v) => v !== undefined ? v : 0,
}))

vi.mock('../utils/move_piece.js', () => ({
  can_move: vi.fn(() => true),
  place_piece: vi.fn(),
  init_new_piece: vi.fn(),
  rotate_piece: vi.fn(),
}))

vi.mock('../utils/gamepad.js', () => ({
  pollGamepads: vi.fn(),
}))

import { init_new_piece } from '../utils/move_piece.js'
import { useGameLoop } from './GameLoop.jsx'

const makeStore = (status = 'waiting') => {
  return configureStore({
    reducer: {
      game_state: (state = {
        room_id: 0, status, mode: Mode.SINGLE,
        gamemode: Gamemode.NORMAL, level: 0,
        board: Array.from({ length: (20 + BUFFER) * WIDTH }).fill(''),
        score: 0,
      }, action) => {
        if (action.type === 'game_state/setStatus') return { ...state, status: action.payload }
        return state
      },
      player: (state = { id: '', name: 'player' }) => state,
    },
  })
}

const wrapper = (store) => ({ children }) => (
  <Provider store={store}>{children}</Provider>
)

describe('useGameLoop', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1)
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  })

  it('does not start animation frame when status is waiting', () => {
    const store = makeStore('waiting')
    renderHook(() => useGameLoop(), { wrapper: wrapper(store) })
    expect(window.requestAnimationFrame).not.toHaveBeenCalled()
  })

  it('starts animation frame when status changes to playing', () => {
    const store = makeStore('playing')
    renderHook(() => useGameLoop(), { wrapper: wrapper(store) })
    expect(init_new_piece).toHaveBeenCalled()
    expect(window.requestAnimationFrame).toHaveBeenCalled()
  })

  it('emits game_over when status is game_over', () => {
    const store = makeStore('game_over')
    renderHook(() => useGameLoop(), { wrapper: wrapper(store) })
    expect(mockEmit).toHaveBeenCalledWith('game_over', 0)
  })

  it('cancels animation frame on unmount', () => {
    const store = makeStore('playing')
    const { unmount } = renderHook(() => useGameLoop(), { wrapper: wrapper(store) })
    unmount()
    expect(window.cancelAnimationFrame).toHaveBeenCalled()
  })
})
