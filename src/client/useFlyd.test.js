import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import flyd from 'flyd'
import { useFlyd } from './useFlyd.js'

describe('useFlyd', () => {
  it('returns the initial value of the stream', () => {
    const stream = flyd.stream(42)
    const { result } = renderHook(() => useFlyd(stream))
    expect(result.current).toBe(42)
  })

  it('updates when stream value changes', () => {
    const stream = flyd.stream('hello')
    const { result } = renderHook(() => useFlyd(stream))
    expect(result.current).toBe('hello')

    act(() => { stream('world') })
    expect(result.current).toBe('world')
  })

  it('calls callback when stream updates', () => {
    const stream = flyd.stream(0)
    const callback = vi.fn()
    renderHook(() => useFlyd(stream, callback))

    act(() => { stream(10) })
    expect(callback).toHaveBeenCalledWith(10)
  })

  it('does not call callback if none provided', () => {
    const stream = flyd.stream(0)
    // Should not throw
    const { result } = renderHook(() => useFlyd(stream))
    act(() => { stream(5) })
    expect(result.current).toBe(5)
  })

  it('cleans up subscription on unmount', () => {
    const stream = flyd.stream(0)
    const { result, unmount } = renderHook(() => useFlyd(stream))

    act(() => { stream(1) })
    expect(result.current).toBe(1)

    unmount()
    // After unmount, updating the stream should not throw
    stream(2)
  })

  it('re-subscribes when stream reference changes', () => {
    const stream1 = flyd.stream('a')
    const stream2 = flyd.stream('b')
    let currentStream = stream1

    const { result, rerender } = renderHook(() => useFlyd(currentStream))
    expect(result.current).toBe('a')

    currentStream = stream2
    rerender()
    expect(result.current).toBe('b')
  })
})
