import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SmallBoard } from './SmallBoard.jsx'
import { tetrominoes } from '../../common/tetrominoes.js'

describe('SmallBoard component', () => {
  it('renders 8 cells (2 rows x 4 cols)', () => {
    const { container } = render(<SmallBoard tetro="" />)
    const cells = container.querySelectorAll('.cell')
    expect(cells.length).toBe(8)
  })

  it('renders all cells as empty when tetro is empty string', () => {
    const { container } = render(<SmallBoard tetro="" />)
    const empty = container.querySelectorAll('.empty')
    expect(empty.length).toBe(8)
  })

  it('renders filled cells for an I piece', () => {
    const { container } = render(<SmallBoard tetro="I" />)
    const filled = container.querySelectorAll('.filled')
    // I piece rotation 0, rows 0-1: row 0 = [0,0,0,0], row 1 = [1,1,1,1]
    expect(filled.length).toBe(4)
  })

  it('applies correct color class for T piece', () => {
    const { container } = render(<SmallBoard tetro="T" />)
    const colored = container.querySelectorAll('.T')
    expect(colored.length).toBeGreaterThan(0)
  })

  it('renders filled cells for an O piece', () => {
    const { container } = render(<SmallBoard tetro="O" />)
    const filled = container.querySelectorAll('.filled')
    // O piece rotation 0, rows 0-1: [0,1,1,0], [0,1,1,0]
    expect(filled.length).toBe(4)
  })

  it('wraps cells in a div with class small_board', () => {
    const { container } = render(<SmallBoard tetro="" />)
    expect(container.querySelector('.small_board')).toBeTruthy()
  })
})
