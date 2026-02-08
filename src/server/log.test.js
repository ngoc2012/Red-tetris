import { describe, it, expect, vi } from 'vitest'

vi.mock('debug', () => ({
  default: vi.fn((namespace) => {
    const fn = vi.fn()
    fn.namespace = namespace
    return fn
  }),
}))

import { logerror, loginfo } from './log.js'

describe('log', () => {
  it('exports logerror as a function', () => {
    expect(typeof logerror).toBe('function')
  })

  it('exports loginfo as a function', () => {
    expect(typeof loginfo).toBe('function')
  })

  it('logerror has correct namespace', () => {
    expect(logerror.namespace).toBe('tetris:error')
  })

  it('loginfo has correct namespace', () => {
    expect(loginfo.namespace).toBe('tetris:info')
  })

  it('logerror is callable', () => {
    logerror('test error')
    expect(logerror).toHaveBeenCalledWith('test error')
  })

  it('loginfo is callable', () => {
    loginfo('test info')
    expect(loginfo).toHaveBeenCalledWith('test info')
  })
})
