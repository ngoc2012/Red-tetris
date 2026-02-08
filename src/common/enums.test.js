import { describe, it, expect } from 'vitest'
import { Status, Gamemode, Mode, PieceState } from './enums.js'

describe('enums', () => {
  describe('Status', () => {
    it('has PLAYING and WAITING values', () => {
      expect(Status.PLAYING).toBe('playing')
      expect(Status.WAITING).toBe('waiting')
    })

    it('is frozen', () => {
      expect(Object.isFrozen(Status)).toBe(true)
    })
  })

  describe('Gamemode', () => {
    it('has NORMAL, INVIS, and ACCEL values', () => {
      expect(Gamemode.NORMAL).toBe('normal')
      expect(Gamemode.INVIS).toBe('invis')
      expect(Gamemode.ACCEL).toBe('accel')
    })

    it('is frozen', () => {
      expect(Object.isFrozen(Gamemode)).toBe(true)
    })
  })

  describe('Mode', () => {
    it('has SINGLE and MULTI values', () => {
      expect(Mode.SINGLE).toBe('single')
      expect(Mode.MULTI).toBe('multi')
    })

    it('is frozen', () => {
      expect(Object.isFrozen(Mode)).toBe(true)
    })
  })

  describe('PieceState', () => {
    it('has FALLING and LOCKED values', () => {
      expect(PieceState.FALLING).toBe('falling')
      expect(PieceState.LOCKED).toBe('locked')
    })

    it('is frozen', () => {
      expect(Object.isFrozen(PieceState)).toBe(true)
    })
  })
})
