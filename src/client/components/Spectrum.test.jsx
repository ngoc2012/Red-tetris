// src/client/components/__tests__/Spectrum.test.jsx
import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Spectrum } from './Spectrum'

describe('Spectrum component', () => {
  const mockInfo = {
    playerId: "Player1",
    score: 123,
    penalty: 3,          // bottom 3 rows are blocked
    spec: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]  // heights per column
  }

  it('renders playerId and score', () => {
    const { getByText } = render(<Spectrum info={mockInfo} />)

    expect(getByText('Player1')).toBeTruthy()
    expect(getByText('123')).toBeTruthy()
  })

  it('renders exactly 200 cells', () => {
    const { container } = render(<Spectrum info={mockInfo} />)
    const cells = container.querySelectorAll('.spec_cell')

    expect(cells.length).toBe(200)
  })

  it('applies "blocked" class to bottom penalty rows', () => {
    const { container } = render(<Spectrum info={mockInfo} />)
    const cells = container.querySelectorAll('.spec_cell')

    const rows = 20
    const cols = 10

    // bottom 3 rows → row index 17,18,19
    const blockedStart = (rows - mockInfo.penalty) * cols  // 17*10 = 170

    for (let i = blockedStart; i < 200; i++) {
      expect(cells[i].classList.contains('blocked')).toBe(true)
    }
  })

  it('applies "filled" class correctly based on column spec', () => {
    const { container } = render(<Spectrum info={mockInfo} />)
    const cells = container.querySelectorAll('.spec_cell')

    for (let i = 0; i < 200; i++) {
      const row = Math.floor(i / 10)
      const col = i % 10

      const isBlocked = row >= 20 - mockInfo.penalty
      const isFilled = !isBlocked && row >= 20 - mockInfo.spec[col]

      if (isBlocked) {
        expect(cells[i].classList.contains('blocked')).toBe(true)
      } else if (isFilled) {
        expect(cells[i].classList.contains('filled')).toBe(true)
      } else {
        expect(cells[i].classList.contains('empty')).toBe(true)
      }
    }
  })
})
