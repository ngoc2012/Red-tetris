import { describe, it, expect } from 'vitest'
import {
  WIDTH, LENGTH, BUFFER,
  RIGHT, LEFT, DOWN, FALL, ROT,
  LEVEL_UP, MAX_LEVEL, LOCK,
  tetrisGravityFrames,
} from './constants.js'

describe('constants', () => {
  it('has correct board dimensions', () => {
    expect(WIDTH).toBe(10)
    expect(LENGTH).toBe(20)
    expect(BUFFER).toBe(2)
  })

  it('has correct movement constants', () => {
    expect(RIGHT).toBe(1)
    expect(LEFT).toBe(2)
    expect(DOWN).toBe(4)
    expect(FALL).toBe(5)
    expect(ROT).toBe(8)
  })

  it('has correct game constants', () => {
    expect(LEVEL_UP).toBe(3)
    expect(MAX_LEVEL).toBe(29)
    expect(LOCK).toBe(60)
  })

  it('tetrisGravityFrames has entries for levels 0 through 29', () => {
    for (let i = 0; i <= 29; i++) {
      expect(tetrisGravityFrames[i]).toBeDefined()
    }
  })

  it('tetrisGravityFrames decreases or stays the same as level increases', () => {
    for (let i = 1; i <= 29; i++) {
      expect(tetrisGravityFrames[i]).toBeLessThanOrEqual(tetrisGravityFrames[i - 1])
    }
  })

  it('tetrisGravityFrames level 0 is 48 and level 29 is 1', () => {
    expect(tetrisGravityFrames[0]).toBe(48)
    expect(tetrisGravityFrames[29]).toBe(1)
  })
})
