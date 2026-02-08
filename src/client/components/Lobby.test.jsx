import React from 'react'
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', () => ({
  Link: ({ children, to, className, onClick }) => (
    <a href={to} className={className} onClick={onClick}>{children}</a>
  ),
  useNavigate: () => mockNavigate,
}))

const mockEmit = vi.fn()
const mockOn = vi.fn()
const mockOff = vi.fn()
vi.mock('../socket.js', () => ({
  default: {
    emit: (...args) => mockEmit(...args),
    on: (...args) => mockOn(...args),
    off: (...args) => mockOff(...args),
  },
}))

vi.mock('../store', () => ({
  setName: (v) => ({ type: 'player/setName', payload: v }),
}))

import { Lobby } from './Lobby.jsx'

const makeStore = (name = 'player') => {
  return configureStore({
    reducer: {
      player: (state = { id: '', name }, action) => {
        if (action.type === 'player/setName') return { ...state, name: action.payload }
        return state
      },
      game_state: (state = {}) => state,
    },
  })
}

describe('Lobby component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEmit.mockImplementation((event, ...args) => {
      if (event === 'room_list') {
        const callback = args[0]
        callback([])
      }
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('renders lobby with player name', () => {
    const store = makeStore('Alice')
    render(<Provider store={store}><Lobby /></Provider>)
    expect(screen.getByText('Hi Alice!')).toBeTruthy()
  })

  it('renders New room button', () => {
    const store = makeStore()
    render(<Provider store={store}><Lobby /></Provider>)
    expect(screen.getByText('New room')).toBeTruthy()
  })

  it('renders History button', () => {
    const store = makeStore()
    render(<Provider store={store}><Lobby /></Provider>)
    expect(screen.getByText('History')).toBeTruthy()
  })

  it('navigates to /history when History button clicked', () => {
    const store = makeStore()
    render(<Provider store={store}><Lobby /></Provider>)
    fireEvent.click(screen.getByText('History'))
    expect(mockNavigate).toHaveBeenCalledWith('/history')
  })

  it('emits room_list on mount', () => {
    const store = makeStore()
    render(<Provider store={store}><Lobby /></Provider>)
    expect(mockEmit).toHaveBeenCalledWith('room_list', expect.any(Function))
  })

  it('registers room_update listener on mount', () => {
    const store = makeStore()
    render(<Provider store={store}><Lobby /></Provider>)
    expect(mockOn).toHaveBeenCalledWith('room_update', expect.any(Function))
  })

  it('unregisters room_update listener on unmount', () => {
    const store = makeStore()
    const { unmount } = render(<Provider store={store}><Lobby /></Provider>)
    unmount()
    expect(mockOff).toHaveBeenCalledWith('room_update', expect.any(Function))
  })

  it('renders waiting rooms as links', () => {
    mockEmit.mockImplementation((event, ...args) => {
      if (event === 'room_list') {
        args[0]([{ id: 0, status: 'waiting' }, { id: 1, status: 'playing' }])
      }
    })
    const store = makeStore('Bob')
    const { container } = render(<Provider store={store}><Lobby /></Provider>)
    const waiting = container.querySelectorAll('.waiting')
    const playing = container.querySelectorAll('.playing')
    expect(waiting.length).toBe(1)
    expect(playing.length).toBe(1)
  })

  it('emits new_room and navigates on success', () => {
    mockEmit.mockImplementation((event, ...args) => {
      if (event === 'room_list') args[0]([])
      if (event === 'new_room') args[0]({ success: true, room_id: 42 })
    })
    const store = makeStore('player')
    render(<Provider store={store}><Lobby /></Provider>)
    fireEvent.click(screen.getByText('New room'))
    expect(mockNavigate).toHaveBeenCalledWith('/room/42/player')
  })

  it('shows input field when name is clicked', () => {
    const store = makeStore('player')
    render(<Provider store={store}><Lobby /></Provider>)
    fireEvent.click(screen.getByText('Hi player!'))
    expect(screen.getByRole('textbox')).toBeTruthy()
  })

  it('submits rename on Enter key', () => {
    mockEmit.mockImplementation((event, ...args) => {
      if (event === 'room_list') args[0]([])
      if (event === 'rename') args[1]({ success: true })
    })
    const store = makeStore('player')
    render(<Provider store={store}><Lobby /></Provider>)
    fireEvent.click(screen.getByText('Hi player!'))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'NewName' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(mockEmit).toHaveBeenCalledWith('rename', { new_name: 'NewName' }, expect.any(Function))
  })

  it('cancels rename on Escape key', () => {
    const store = makeStore('player')
    render(<Provider store={store}><Lobby /></Provider>)
    fireEvent.click(screen.getByText('Hi player!'))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'temp' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.getByText('Hi player!')).toBeTruthy()
  })
})
