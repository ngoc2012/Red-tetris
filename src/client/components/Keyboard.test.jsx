import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RIGHT, LEFT, DOWN, ROT, FALL } from '../../common/constants.js'

let mockPiece = 'I'
let mockKeys = []
let mockTouche = { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } }

vi.mock('../streams.js', () => ({
  piece$: (v) => { if (v !== undefined) mockPiece = v; return mockPiece },
  keys$: (v) => { if (v !== undefined) mockKeys = v; return mockKeys },
  touche$: (v) => { if (v !== undefined) mockTouche = v; return mockTouche },
}))

import { useKeyboard } from './Keyboard.jsx'

describe('useKeyboard', () => {
  beforeEach(() => {
    mockPiece = 'I'
    mockKeys = []
    mockTouche = { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } }
  })

  it('adds keydown event listener on mount', () => {
    const spy = vi.spyOn(window, 'addEventListener')
    renderHook(() => useKeyboard())
    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function))
    spy.mockRestore()
  })

  it('removes event listeners on unmount', () => {
    const spy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useKeyboard())
    unmount()
    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(spy).toHaveBeenCalledWith('touchstart', expect.any(Function))
    expect(spy).toHaveBeenCalledWith('touchmove', expect.any(Function))
    expect(spy).toHaveBeenCalledWith('touchend', expect.any(Function))
    spy.mockRestore()
  })

  it('maps ArrowRight to RIGHT', () => {
    renderHook(() => useKeyboard())
    act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })) })
    expect(mockKeys).toContain(RIGHT)
  })

  it('maps ArrowLeft to LEFT', () => {
    renderHook(() => useKeyboard())
    act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' })) })
    expect(mockKeys).toContain(LEFT)
  })

  it('maps ArrowDown to DOWN', () => {
    renderHook(() => useKeyboard())
    act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' })) })
    expect(mockKeys).toContain(DOWN)
  })

  it('maps ArrowUp to ROT', () => {
    renderHook(() => useKeyboard())
    act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' })) })
    expect(mockKeys).toContain(ROT)
  })

  it('maps Space to FALL', () => {
    renderHook(() => useKeyboard())
    act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' })) })
    expect(mockKeys).toContain(FALL)
  })

  it('does not add keys when piece is empty', () => {
    mockPiece = ''
    renderHook(() => useKeyboard())
    act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' })) })
    expect(mockKeys.length).toBe(0)
  })
})
