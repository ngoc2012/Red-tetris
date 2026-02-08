import React from 'react'
import { render, screen, waitFor, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../streams', () => ({
  basename$: () => '/',
}))

import { History } from './History.jsx'

describe('History component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('shows loading state initially', () => {
    global.fetch = vi.fn(() => new Promise(() => {}))
    render(<History />)
    expect(screen.getByText('Loading...')).toBeTruthy()
  })

  it('renders history table after fetch', async () => {
    const data = [
      { time: '12:00', room: '1', name: 'alice', score: 100, result: 'win' },
      { time: '12:05', room: '2', name: 'bob', score: 50, result: 'loss' },
    ]
    global.fetch = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve(data) })
    )
    render(<History />)
    await waitFor(() => {
      expect(screen.getByText('alice')).toBeTruthy()
      expect(screen.getByText('bob')).toBeTruthy()
    })
    expect(screen.getByText('100')).toBeTruthy()
    expect(screen.getByText('win')).toBeTruthy()
  })

  it('shows "No history available." when data is empty', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve([]) })
    )
    render(<History />)
    await waitFor(() => {
      expect(screen.getByText('No history available.')).toBeTruthy()
    })
  })

  it('shows "No history available." on fetch error', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('fail')))
    render(<History />)
    await waitFor(() => {
      expect(screen.getByText('No history available.')).toBeTruthy()
    })
  })

  it('renders table headers', async () => {
    const data = [{ time: '1', room: '1', name: 'a', score: 1, result: 'w' }]
    global.fetch = vi.fn(() =>
      Promise.resolve({ json: () => Promise.resolve(data) })
    )
    render(<History />)
    await waitFor(() => {
      expect(screen.getByText('#')).toBeTruthy()
    })
    expect(screen.getByText('Time')).toBeTruthy()
    expect(screen.getByText('Room')).toBeTruthy()
    expect(screen.getByText('Name')).toBeTruthy()
    expect(screen.getByText('Score')).toBeTruthy()
    expect(screen.getByText('Result')).toBeTruthy()
  })

  it('fetches from correct API endpoint', () => {
    global.fetch = vi.fn(() => new Promise(() => {}))
    render(<History />)
    expect(global.fetch).toHaveBeenCalledWith('/api/history')
  })
})
