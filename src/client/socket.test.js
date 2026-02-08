import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockOn = vi.fn()

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: (...args) => mockOn(...args),
    id: 'mock-socket-id',
  })),
}))

vi.mock('./store.js', () => ({
  setId: (v) => ({ type: 'player/setId', payload: v }),
  setScore: (v) => ({ type: 'game_state/setScore', payload: v }),
}))

import { initSocket } from './socket.js'
import socket from './socket.js'

describe('socket', () => {
  let dispatch

  beforeEach(() => {
    vi.clearAllMocks()
    dispatch = vi.fn()
  })

  it('exports a socket object', () => {
    expect(socket).toBeTruthy()
    expect(socket.on).toBeDefined()
  })

  describe('initSocket', () => {
    it('registers connected and score_update listeners', () => {
      initSocket(dispatch)
      const events = mockOn.mock.calls.map((c) => c[0])
      expect(events).toContain('connected')
      expect(events).toContain('score_update')
    })

    it('dispatches setId on connected event', () => {
      initSocket(dispatch)
      const connectedHandler = mockOn.mock.calls.find((c) => c[0] === 'connected')[1]
      connectedHandler({ id: 'abc123' })
      expect(dispatch).toHaveBeenCalledWith({ type: 'player/setId', payload: 'abc123' })
    })

    it('dispatches setScore on score_update when id matches', () => {
      initSocket(dispatch)
      const scoreHandler = mockOn.mock.calls.find((c) => c[0] === 'score_update')[1]
      scoreHandler({ id: 'mock-socket-id', score: 42 })
      expect(dispatch).toHaveBeenCalledWith({ type: 'game_state/setScore', payload: 42 })
    })

    it('does not dispatch setScore when id does not match', () => {
      initSocket(dispatch)
      const scoreHandler = mockOn.mock.calls.find((c) => c[0] === 'score_update')[1]
      scoreHandler({ id: 'other-id', score: 99 })
      expect(dispatch).not.toHaveBeenCalledWith({ type: 'game_state/setScore', payload: 99 })
    })
  })
})
