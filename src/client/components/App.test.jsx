import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { Gamemode, Mode } from '../../common/enums.js'
import { BUFFER, WIDTH } from '../../common/constants.js'

vi.mock('../socket.js', () => ({
  default: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
  initSocket: vi.fn(),
}))

vi.mock('./Lobby.jsx', () => ({
  Lobby: () => <div data-testid="lobby">Lobby</div>,
}))

vi.mock('./Game.jsx', () => ({
  Game: () => <div data-testid="game">Game</div>,
}))

vi.mock('./History.jsx', () => ({
  History: () => <div data-testid="history">History</div>,
}))

import App from './App.jsx'

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

const renderApp = (route = '/') => {
  const store = makeStore()
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    </Provider>
  )
}

describe('App component', () => {
  it('renders Lobby at root path', () => {
    renderApp('/')
    expect(screen.getByTestId('lobby')).toBeTruthy()
  })

  it('renders Game at /room/:roomid/:name', () => {
    renderApp('/room/0/player1')
    expect(screen.getByTestId('game')).toBeTruthy()
  })

  it('renders History at /history', () => {
    renderApp('/history')
    expect(screen.getByTestId('history')).toBeTruthy()
  })

  it('renders NotFound for unknown routes', () => {
    renderApp('/unknown/path')
    expect(screen.getByText('Page Not Found')).toBeTruthy()
  })
})
