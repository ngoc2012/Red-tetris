import { describe, it, expect } from 'vitest'
import { PieceState } from '../common/enums.js'
import {
  pos$, rot$, fall_count$, lock_count$,
  state$, piece$, next_pieces$, keys$,
  touche$, basename$,
} from './streams.js'

describe('streams', () => {
  it('pos$ has initial value 3', () => {
    expect(pos$()).toBe(3)
  })

  it('rot$ has initial value 0', () => {
    expect(rot$()).toBe(0)
  })

  it('fall_count$ has initial value 0', () => {
    expect(fall_count$()).toBe(0)
  })

  it('lock_count$ has initial value 0', () => {
    expect(lock_count$()).toBe(0)
  })

  it('state$ has initial value PieceState.FALLING', () => {
    expect(state$()).toBe(PieceState.FALLING)
  })

  it('piece$ has initial value empty string', () => {
    expect(piece$()).toBe('')
  })

  it('next_pieces$ has initial value empty array', () => {
    expect(next_pieces$()).toEqual([])
  })

  it('keys$ has initial value empty array', () => {
    expect(keys$()).toEqual([])
  })

  it('touche$ has initial value with zero coordinates', () => {
    expect(touche$()).toEqual({ start: { x: 0, y: 0 }, end: { x: 0, y: 0 } })
  })

  it('basename$ has initial value "/"', () => {
    expect(basename$()).toBe('/')
  })

  it('streams are writable and readable', () => {
    const original = pos$()
    pos$(99)
    expect(pos$()).toBe(99)
    pos$(original)
  })
})
