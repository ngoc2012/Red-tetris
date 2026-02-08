import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { Gamemode, Mode } from '../../common/enums.js'
import { BUFFER, WIDTH } from '../../common/constants.js'

let mockParams = { roomid: '0', name: 'testplayer' }

vi.mock('react-router-dom', () => ({
  useParams: () => mockParams,
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}))

const mockEmit = vi.fn()
vi.mock('../socket', () => ({
  default: { emit: (...args) => mockEmit(...args), on: vi.fn(), off: vi.fn() },
}))

const mockDispatch = vi.fn()
vi.mock('../store.js', () => ({
  store: { dispatch: (...args) => mockDispatch(...args), getState: () => ({}) },
  setRoomId: (v) => ({ type: 'game_state/setRoomId', payload: v }),
  setStatus: (v) => ({ type: 'game_state/setStatus', payload: v }),
  setGamemode: (v) => ({ type: 'game_state/setGamemode', payload: v }),
  setMode: (v) => ({ type: 'game_state/setMode', payload: v }),
  setLevel: (v) => ({ type: 'game_state/setLevel', payload: v }),
}))

vi.mock('../utils/utils.js', () => ({
  reset: vi.fn(),
}))

vi.mock('./GameConnect.jsx', () => ({
  useGameConnect: vi.fn(),
}))

vi.mock('./GameLoop.jsx', () => ({
  useGameLoop: vi.fn(),
}))

vi.mock('./Keyboard.jsx', () => ({
  useKeyboard: vi.fn(),
}))

vi.mock('./Board.jsx', () => ({
  Board: () => <div data-testid="board">Board</div>,
}))

vi.mock('./Info.jsx', () => ({
  Info: () => <div data-testid="info">Info</div>,
}))

import { reset } from '../utils/utils.js'
import { useGameConnect } from './GameConnect.jsx'
import { useGameLoop } from './GameLoop.jsx'
import { useKeyboard } from './Keyboard.jsx'
import { Game } from './Game.jsx'

const makeStore = () => {
  const defaultBoard = Array.from({ length: (20 + BUFFER) * WIDTH }).fill('')
  return configureStore({
    reducer: {
      game_state: (state = {
        room_id: -1, status: 'waiting', mode: Mode.SINGLE,
        gamemode: Gamemode.NORMAL, level: 0, board: defaultBoard, score: 0,
      }) => state,
      player: (state = { id: '', name: 'player' }) => state,
    },
  })
}

describe('Game component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockParams = { roomid: '0', name: 'testplayer' }
  })

  it('shows loading state initially', () => {
    mockEmit.mockImplementation(() => {})
    const store = makeStore()
    render(
      <Provider store={store}>
        <Game />
      </Provider>
    )
    expect(screen.getByText('Loading')).toBeTruthy()
  })

  it('renders Board and Info after successful join_room', () => {
    mockEmit.mockImplementation((event, roomid, callback) => {
      if (event === 'join_room') {
        callback({
          success: true,
          room: { status: 'waiting', gamemode: Gamemode.NORMAL, mode: Mode.SINGLE, level: 0 },
        })
      }
    })
    const store = makeStore()
    render(
      <Provider store={store}>
        <Game />
      </Provider>
    )
    expect(screen.getByTestId('board')).toBeTruthy()
    expect(screen.getByTestId('info')).toBeTruthy()
  })

  it('renders NotFound after failed join_room', () => {
    mockEmit.mockImplementation((event, roomid, callback) => {
      if (event === 'join_room') {
        callback({ success: false })
      }
    })
    const store = makeStore()
    render(
      <Provider store={store}>
        <Game />
      </Provider>
    )
    expect(screen.getByText('Page Not Found')).toBeTruthy()
  })

  it('dispatches store actions on successful join', () => {
    mockEmit.mockImplementation((event, roomid, callback) => {
      if (event === 'join_room') {
        callback({
          success: true,
          room: { status: 'waiting', gamemode: Gamemode.ACCEL, mode: Mode.MULTI, level: 5 },
        })
      }
    })
    const store = makeStore()
    render(
      <Provider store={store}>
        <Game />
      </Provider>
    )
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'game_state/setRoomId', payload: '0' })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'game_state/setStatus', payload: 'waiting' })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'game_state/setGamemode', payload: Gamemode.ACCEL })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'game_state/setMode', payload: Mode.MULTI })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'game_state/setLevel', payload: 5 })
  })

  it('calls reset and emits leave_room on unmount', () => {
    mockEmit.mockImplementation((event, roomid, callback) => {
      if (event === 'join_room') {
        callback({
          success: true,
          room: { status: 'waiting', gamemode: Gamemode.NORMAL, mode: Mode.SINGLE, level: 0 },
        })
      }
    })
    const store = makeStore()
    const { unmount } = render(
      <Provider store={store}>
        <Game />
      </Provider>
    )
    vi.clearAllMocks()
    unmount()
    expect(reset).toHaveBeenCalled()
    expect(mockEmit).toHaveBeenCalledWith('leave_room', '0')
  })

  it('calls useGameConnect, useKeyboard, and useGameLoop hooks', () => {
    mockEmit.mockImplementation(() => {})
    const store = makeStore()
    render(
      <Provider store={store}>
        <Game />
      </Provider>
    )
    expect(useGameConnect).toHaveBeenCalled()
    expect(useKeyboard).toHaveBeenCalled()
    expect(useGameLoop).toHaveBeenCalled()
  })

  it('wraps Board and Info in a div with class "main"', () => {
    mockEmit.mockImplementation((event, roomid, callback) => {
      if (event === 'join_room') {
        callback({
          success: true,
          room: { status: 'waiting', gamemode: Gamemode.NORMAL, mode: Mode.SINGLE, level: 0 },
        })
      }
    })
    const store = makeStore()
    const { container } = render(
      <Provider store={store}>
        <Game />
      </Provider>
    )
    const main = container.querySelector('.main')
    expect(main).toBeTruthy()
    expect(main.querySelector('[data-testid="board"]')).toBeTruthy()
    expect(main.querySelector('[data-testid="info"]')).toBeTruthy()
  })
})
