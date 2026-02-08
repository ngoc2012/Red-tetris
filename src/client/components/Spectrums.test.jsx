import React from 'react'
import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const socketListeners = {}
const mockEmit = vi.fn()
const mockOn = vi.fn((event, cb) => { socketListeners[event] = cb })
const mockOff = vi.fn((event) => { delete socketListeners[event] })

vi.mock('../socket', () => ({
  default: {
    emit: (...args) => mockEmit(...args),
    on: (...args) => mockOn(...args),
    off: (...args) => mockOff(...args),
  },
}))

vi.mock('./Spectrum', () => ({
  Spectrum: ({ info }) => <div data-testid="spectrum">{info.playerId}</div>,
}))

import { Spectrums } from './Spectrums.jsx'

describe('Spectrums component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.keys(socketListeners).forEach((k) => delete socketListeners[k])
  })

  it('emits spectrums request on mount', () => {
    render(<Spectrums />)
    expect(mockEmit).toHaveBeenCalledWith('spectrums', expect.any(Function))
  })

  it('registers spectrum and player_leave listeners', () => {
    render(<Spectrums />)
    expect(mockOn).toHaveBeenCalledWith('spectrum', expect.any(Function))
    expect(mockOn).toHaveBeenCalledWith('player_leave', expect.any(Function))
  })

  it('renders spectrums from initial fetch', () => {
    mockEmit.mockImplementation((event, callback) => {
      if (event === 'spectrums') {
        callback({
          p1: { playerId: 'Alice', score: 10, spec: [], penalty: 0 },
        })
      }
    })
    render(<Spectrums />)
    expect(screen.getByText('Alice')).toBeTruthy()
  })

  it('renders empty when spectrums response is null', () => {
    mockEmit.mockImplementation((event, callback) => {
      if (event === 'spectrums') callback(null)
    })
    const { container } = render(<Spectrums />)
    expect(container.querySelectorAll('[data-testid="spectrum"]').length).toBe(0)
  })

  it('wraps spectrums in div with class spectrum_list', () => {
    mockEmit.mockImplementation((event, callback) => {
      if (event === 'spectrums') callback(null)
    })
    const { container } = render(<Spectrums />)
    expect(container.querySelector('.spectrum_list')).toBeTruthy()
  })
})
