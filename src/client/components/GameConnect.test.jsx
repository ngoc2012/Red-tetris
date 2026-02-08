import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Gamemode, Mode } from '../../common/enums.js'

const socketListeners = {}
const mockOn = vi.fn((event, cb) => { socketListeners[event] = cb })
const mockOff = vi.fn((event) => { delete socketListeners[event] })

vi.mock('../socket.js', () => ({
  default: {
    on: (...args) => mockOn(...args),
    off: (...args) => mockOff(...args),
  },
}))

const mockDispatch = vi.fn()
vi.mock('../store.js', () => ({
  store: { dispatch: (...args) => mockDispatch(...args) },
  setStatus: (v) => ({ type: 'game_state/setStatus', payload: v }),
  setMode: (v) => ({ type: 'game_state/setMode', payload: v }),
  setGamemode: (v) => ({ type: 'game_state/setGamemode', payload: v }),
  setLevel: (v) => ({ type: 'game_state/setLevel', payload: v }),
}))

const mockReset = vi.fn()
const mockAddPenalty = vi.fn()
vi.mock('../utils/utils.js', () => ({
  reset: (...args) => mockReset(...args),
  add_penalty: (...args) => mockAddPenalty(...args),
}))

let mockNextPiecesValue = []
const mockNextPieces$ = vi.fn((v) => {
  if (v !== undefined) mockNextPiecesValue = v
  return mockNextPiecesValue
})
vi.mock('../streams.js', () => ({
  next_pieces$: (...args) => mockNextPieces$(...args),
}))

import { useGameConnect } from './GameConnect.jsx'

describe('useGameConnect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.keys(socketListeners).forEach((k) => delete socketListeners[k])
    mockNextPiecesValue = []
  })

  it('registers all socket listeners on mount', () => {
    renderHook(() => useGameConnect())
    const events = ['game_prep', 'game_start', 'game_over', 'game_win', 'next_piece', 'penalty', 'level', 'gamemode']
    events.forEach((event) => {
      expect(mockOn).toHaveBeenCalledWith(event, expect.any(Function))
    })
  })

  it('unregisters all socket listeners on unmount', () => {
    const { unmount } = renderHook(() => useGameConnect())
    unmount()
    const events = ['game_prep', 'game_start', 'game_over', 'game_win', 'next_piece', 'penalty', 'level', 'gamemode']
    events.forEach((event) => {
      expect(mockOff).toHaveBeenCalledWith(event, expect.any(Function))
    })
  })

  it('game_prep calls reset and dispatches setStatus("starting")', () => {
    renderHook(() => useGameConnect())
    act(() => { socketListeners['game_prep']() })
    expect(mockReset).toHaveBeenCalled()
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'game_state/setStatus', payload: 'starting' })
  })

  it('game_start dispatches mode, gamemode, level, and status', () => {
    renderHook(() => useGameConnect())
    act(() => {
      socketListeners['game_start']({
        mode: Mode.MULTI,
        gamemode: Gamemode.ACCEL,
        level: 3,
      })
    })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'game_state/setMode', payload: Mode.MULTI })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'game_state/setGamemode', payload: Gamemode.ACCEL })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'game_state/setLevel', payload: 3 })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'game_state/setStatus', payload: 'playing' })
  })

  it('game_win dispatches setStatus("game_win")', () => {
    renderHook(() => useGameConnect())
    act(() => { socketListeners['game_win']() })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'game_state/setStatus', payload: 'game_win' })
  })

  it('next_piece appends piece to next_pieces$ stream', () => {
    mockNextPiecesValue = ['I']
    renderHook(() => useGameConnect())
    act(() => { socketListeners['next_piece']('T') })
    expect(mockNextPieces$).toHaveBeenCalledWith(['I', 'T'])
  })

  it('gamemode dispatches setGamemode', () => {
    renderHook(() => useGameConnect())
    act(() => { socketListeners['gamemode'](Gamemode.INVIS) })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'game_state/setGamemode', payload: Gamemode.INVIS })
  })

  it('level dispatches setLevel', () => {
    renderHook(() => useGameConnect())
    act(() => { socketListeners['level'](7) })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'game_state/setLevel', payload: 7 })
  })

  it('penalty calls add_penalty', () => {
    renderHook(() => useGameConnect())
    act(() => { socketListeners['penalty'](2) })
    expect(mockAddPenalty).toHaveBeenCalledWith(2)
  })
})
