import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Grid } from './Grid.jsx'
import { WIDTH, LENGTH, BUFFER } from '../../common/constants.js'
import { Gamemode } from '../../common/enums.js'

const emptyBoard = Array.from({ length: WIDTH * (LENGTH + BUFFER) }).fill('')

describe('Grid component', () => {
  it('renders LENGTH * WIDTH cells (buffer rows excluded)', () => {
    const { container } = render(
      <Grid board={emptyBoard} gamemode={Gamemode.NORMAL} piece="" pos={3} rot={0} />
    )
    const cells = container.querySelectorAll('.cell')
    expect(cells.length).toBe(WIDTH * LENGTH)
  })

  it('renders all cells as empty for an empty board with no piece', () => {
    const { container } = render(
      <Grid board={emptyBoard} gamemode={Gamemode.NORMAL} piece="" pos={3} rot={0} />
    )
    const empty = container.querySelectorAll('.empty')
    expect(empty.length).toBe(WIDTH * LENGTH)
  })

  it('renders filled cells for board content', () => {
    const board = [...emptyBoard]
    board[(LENGTH + BUFFER - 1) * WIDTH] = 'I'
    board[(LENGTH + BUFFER - 1) * WIDTH + 1] = 'I'
    const { container } = render(
      <Grid board={board} gamemode={Gamemode.NORMAL} piece="" pos={3} rot={0} />
    )
    const filled = container.querySelectorAll('.filled')
    expect(filled.length).toBe(2)
  })

  it('renders blocked cells for penalty (X) blocks', () => {
    const board = [...emptyBoard]
    for (let i = (LENGTH + BUFFER - 1) * WIDTH; i < (LENGTH + BUFFER) * WIDTH; i++) {
      board[i] = 'X'
    }
    const { container } = render(
      <Grid board={board} gamemode={Gamemode.NORMAL} piece="" pos={3} rot={0} />
    )
    const blocked = container.querySelectorAll('.blocked')
    expect(blocked.length).toBe(WIDTH)
  })

  it('hides filled cells in INVIS gamemode', () => {
    const board = [...emptyBoard]
    board[(LENGTH + BUFFER - 1) * WIDTH] = 'T'
    board[(LENGTH + BUFFER - 1) * WIDTH + 1] = 'T'
    const { container } = render(
      <Grid board={board} gamemode={Gamemode.INVIS} piece="" pos={3} rot={0} />
    )
    const filled = container.querySelectorAll('.filled')
    expect(filled.length).toBe(0)
  })

  it('renders active piece overlay on the board', () => {
    // pos = BUFFER * WIDTH + 3 = 23 places O piece at visible row 0, col 3
    const { container } = render(
      <Grid board={emptyBoard} gamemode={Gamemode.NORMAL} piece="O" pos={BUFFER * WIDTH + 3} rot={0} />
    )
    const filled = container.querySelectorAll('.filled')
    // O piece has 4 filled cells in its rotation 0
    expect(filled.length).toBe(4)
  })
})
