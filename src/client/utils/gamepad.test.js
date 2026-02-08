import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DOWN, RIGHT, LEFT, ROT, FALL } from '../../common/constants.js'

let mockKeys = []

vi.mock('../streams.js', () => ({
  keys$: (v) => { if (v !== undefined) mockKeys = v; return mockKeys },
}))

const mockEmit = vi.fn()
vi.mock('../socket.js', () => ({
  default: { emit: (...args) => mockEmit(...args) },
}))

vi.mock('../store.js', () => ({
  setStatus: (v) => ({ type: 'game_state/setStatus', payload: v }),
}))

import { pollGamepads } from './gamepad.js'

const makeGamepad = ({ buttons = [], axes = [0, 0] } = {}) => {
  const defaultButtons = Array.from({ length: 4 }).map(() => ({ pressed: false, value: 0 }))
  buttons.forEach(({ index, pressed }) => {
    defaultButtons[index] = { pressed, value: pressed ? 1 : 0 }
  })
  return { buttons: defaultButtons, axes }
}

describe('pollGamepads', () => {
  let gamepadRef
  let lastGamepadInputTimeRef
  let dispatch

  beforeEach(() => {
    vi.clearAllMocks()
    mockKeys = []
    gamepadRef = { current: -1 }
    lastGamepadInputTimeRef = { current: 0 }
    dispatch = vi.fn()
    // Reset module-level state by calling with no gamepad first
    navigator.getGamepads = vi.fn(() => [null])
    pollGamepads(gamepadRef, 0, lastGamepadInputTimeRef, dispatch, 0)
  })

  it('does nothing when no gamepad is connected', () => {
    navigator.getGamepads = vi.fn(() => [null])
    pollGamepads(gamepadRef, 100, lastGamepadInputTimeRef, dispatch, 0)
    expect(mockKeys.length).toBe(0)
  })

  it('adds ROT key when button 1 is pressed', () => {
    const gp = makeGamepad({ buttons: [{ index: 1, pressed: true }] })
    navigator.getGamepads = vi.fn(() => [gp])
    pollGamepads(gamepadRef, 100, lastGamepadInputTimeRef, dispatch, 0)
    expect(mockKeys).toContain(ROT)
  })

  it('adds FALL key when button 0 is pressed', () => {
    const gp = makeGamepad({ buttons: [{ index: 0, pressed: true }] })
    navigator.getGamepads = vi.fn(() => [gp])
    pollGamepads(gamepadRef, 100, lastGamepadInputTimeRef, dispatch, 0)
    expect(mockKeys).toContain(FALL)
  })

  it('adds FALL key when button 3 is pressed', () => {
    const gp = makeGamepad({ buttons: [{ index: 3, pressed: true }] })
    navigator.getGamepads = vi.fn(() => [gp])
    pollGamepads(gamepadRef, 100, lastGamepadInputTimeRef, dispatch, 0)
    expect(mockKeys).toContain(FALL)
  })

  it('emits game_start when button 2 is pressed', () => {
    const gp = makeGamepad({ buttons: [{ index: 2, pressed: true }] })
    navigator.getGamepads = vi.fn(() => [gp])
    pollGamepads(gamepadRef, 100, lastGamepadInputTimeRef, dispatch, 5)
    expect(mockEmit).toHaveBeenCalledWith('game_start', 5, expect.any(Function))
  })

  it('adds LEFT key for negative X axis', () => {
    const gp = makeGamepad({ axes: [-1, 0] })
    navigator.getGamepads = vi.fn(() => [gp])
    pollGamepads(gamepadRef, 100, lastGamepadInputTimeRef, dispatch, 0)
    expect(mockKeys).toContain(LEFT)
  })

  it('adds RIGHT key for positive X axis', () => {
    const gp = makeGamepad({ axes: [1, 0] })
    navigator.getGamepads = vi.fn(() => [gp])
    pollGamepads(gamepadRef, 100, lastGamepadInputTimeRef, dispatch, 0)
    expect(mockKeys).toContain(RIGHT)
  })

  it('adds DOWN key for positive Y axis', () => {
    const gp = makeGamepad({ axes: [0, 1] })
    navigator.getGamepads = vi.fn(() => [gp])
    pollGamepads(gamepadRef, 100, lastGamepadInputTimeRef, dispatch, 0)
    expect(mockKeys).toContain(DOWN)
  })
})
