import { describe, it, expect, vi } from 'vitest'
import { storeStateMiddleWare } from './storeStateMiddleWare.js'

describe('storeStateMiddleWare', () => {
  it('calls next with the action', () => {
    const getState = vi.fn(() => ({ some: 'state' }))
    const next = vi.fn((action) => action)
    const action = { type: 'TEST_ACTION' }

    const middleware = storeStateMiddleWare({ getState })(next)
    middleware(action)

    expect(next).toHaveBeenCalledWith(action)
  })

  it('stores state on window.top.state after dispatch', () => {
    const state = { game_state: { score: 42 } }
    const getState = vi.fn(() => state)
    const next = vi.fn((action) => action)

    const middleware = storeStateMiddleWare({ getState })(next)
    middleware({ type: 'ANY' })

    expect(window.top.state).toEqual(state)
  })

  it('returns the value from next', () => {
    const getState = vi.fn(() => ({}))
    const next = vi.fn(() => 'result')

    const middleware = storeStateMiddleWare({ getState })(next)
    const result = middleware({ type: 'ANY' })

    expect(result).toBe('result')
  })
})
