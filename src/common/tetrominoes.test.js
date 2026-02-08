import { describe, it, expect } from 'vitest'
import { tetrominoes } from './tetrominoes.js'

describe('tetrominoes', () => {
  it('has all 7 piece types', () => {
    expect(Object.keys(tetrominoes)).toEqual(['I', 'J', 'L', 'O', 'S', 'T', 'Z'])
  })

  it('each piece has at least 1 rotation', () => {
    for (const key of Object.keys(tetrominoes)) {
      expect(tetrominoes[key].length).toBeGreaterThanOrEqual(1)
    }
  })

  it('O piece has exactly 1 rotation', () => {
    expect(tetrominoes.O).toHaveLength(1)
  })

  it('non-O pieces have 4 rotations', () => {
    for (const key of ['I', 'J', 'L', 'S', 'T', 'Z']) {
      expect(tetrominoes[key]).toHaveLength(4)
    }
  })

  it('I and O pieces use 4x4 grids', () => {
    for (const rot of tetrominoes.I) {
      expect(rot).toHaveLength(4)
      rot.forEach((row) => expect(row).toHaveLength(4))
    }
    for (const rot of tetrominoes.O) {
      expect(rot).toHaveLength(4)
      rot.forEach((row) => expect(row).toHaveLength(4))
    }
  })

  it('J, L, S, T, Z pieces use 3x3 grids', () => {
    for (const key of ['J', 'L', 'S', 'T', 'Z']) {
      for (const rot of tetrominoes[key]) {
        expect(rot).toHaveLength(3)
        rot.forEach((row) => expect(row).toHaveLength(3))
      }
    }
  })

  it('grids contain only 0s and 1s', () => {
    for (const key of Object.keys(tetrominoes)) {
      for (const rot of tetrominoes[key]) {
        for (const row of rot) {
          for (const cell of row) {
            expect(cell === 0 || cell === 1).toBe(true)
          }
        }
      }
    }
  })

  it('each rotation has the correct number of filled cells', () => {
    const expectedCells = { I: 4, J: 4, L: 4, O: 4, S: 4, T: 4, Z: 4 }
    for (const [key, rotations] of Object.entries(tetrominoes)) {
      for (const rot of rotations) {
        const count = rot.flat().filter((c) => c === 1).length
        expect(count).toBe(expectedCells[key])
      }
    }
  })
})
