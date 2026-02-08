import React from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { Gamemode, Mode, Status } from '../../common/enums.js'
import { BUFFER, WIDTH } from '../../common/constants.js'

// Pieces is used in Info.jsx without an import — define it globally so JSX can resolve it
globalThis.Pieces = () => <div data-testid="pieces">Pieces</div>

const mockEmit = vi.fn()
vi.mock('../socket.js', () => ({
  default: { emit: (...args) => mockEmit(...args), on: vi.fn(), off: vi.fn() },
}))

vi.mock('./Spectrums.jsx', () => ({
  Spectrums: () => <div data-testid="spectrums">Spectrums</div>,
}))

import { Info } from './Info.jsx'

const makeStore = (overrides = {}) => {
  const defaultBoard = Array.from({ length: (20 + BUFFER) * WIDTH }).fill('')
  return configureStore({
    reducer: {
      game_state: (state = {
        room_id: 0, status: 'waiting', mode: Mode.SINGLE,
        gamemode: Gamemode.NORMAL, level: 0, board: defaultBoard, score: 100,
        ...overrides,
      }, action) => {
        if (action.type === 'game_state/setStatus') return { ...state, status: action.payload }
        return state
      },
      player: (state = { id: '', name: 'player' }) => state,
    },
  })
}

describe('Info component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders score and level', () => {
    const store = makeStore({ score: 250, level: 3 })
    render(<Provider store={store}><Info /></Provider>)
    expect(screen.getByTitle('score').textContent).toContain('250')
    expect(screen.getByTitle('score').textContent).toContain('3')
  })

  it('renders status', () => {
    const store = makeStore({ status: 'waiting' })
    render(<Provider store={store}><Info /></Provider>)
    expect(screen.getByTitle('status').textContent).toBe('waiting')
  })

  it('renders Start game button', () => {
    const store = makeStore()
    render(<Provider store={store}><Info /></Provider>)
    expect(screen.getByText('Start game')).toBeTruthy()
  })

  it('disables Start game button when status is playing', () => {
    const store = makeStore({ status: 'playing' })
    render(<Provider store={store}><Info /></Provider>)
    const button = screen.getByText('Start game')
    expect(button.disabled).toBe(true)
  })

  it('enables Start game button when status is waiting', () => {
    const store = makeStore({ status: 'waiting' })
    render(<Provider store={store}><Info /></Provider>)
    const button = screen.getByText('Start game')
    expect(button.disabled).toBe(false)
  })

  it('emits game_start on button click', () => {
    const store = makeStore({ room_id: 5 })
    render(<Provider store={store}><Info /></Provider>)
    fireEvent.click(screen.getByText('Start game'))
    expect(mockEmit).toHaveBeenCalledWith('game_start', 5, expect.any(Function))
  })

  it('renders gamemode select with all options', () => {
    const store = makeStore()
    render(<Provider store={store}><Info /></Provider>)
    const options = screen.getAllByRole('option')
    const values = options.map((o) => o.value)
    expect(values).toContain(Gamemode.NORMAL)
    expect(values).toContain(Gamemode.INVIS)
    expect(values).toContain(Gamemode.ACCEL)
  })

  it('emits gamemode change on select', () => {
    const store = makeStore({ room_id: 2 })
    render(<Provider store={store}><Info /></Provider>)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: Gamemode.INVIS } })
    expect(mockEmit).toHaveBeenCalledWith('gamemode', Gamemode.INVIS, 2)
  })

  it('renders Pieces and Spectrums child components', () => {
    const store = makeStore()
    render(<Provider store={store}><Info /></Provider>)
    expect(screen.getByTestId('pieces')).toBeTruthy()
    expect(screen.getByTestId('spectrums')).toBeTruthy()
  })
})
