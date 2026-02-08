import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('./socket.js', () => ({
  socket_init: vi.fn(),
}))
vi.mock('./log.js', () => ({
  loginfo: vi.fn(),
}))

import { create } from './index.js'
import { socket_init } from './socket.js'

describe('index', () => {
  let server

  afterEach(async () => {
    if (server) {
      await server.stop()
      server = null
    }
  })

  it('creates a server that can be stopped', async () => {
    server = await create({ host: '127.0.0.1', port: 0 })
    expect(server).toBeDefined()
    expect(typeof server.stop).toBe('function')
  })

  it('initializes socket.io', async () => {
    server = await create({ host: '127.0.0.1', port: 0 })
    expect(socket_init).toHaveBeenCalled()
  })

  it('stop shuts down cleanly', async () => {
    server = await create({ host: '127.0.0.1', port: 0 })
    await expect(server.stop()).resolves.toBeUndefined()
    server = null
  })
})
