// src/client/components/__tests__/Square.test.jsx
import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Square } from './Square'

describe('Square component', () => {
  it('renders blocked cell', () => {
    const { container } = render(<Square blocked={true} />)
    const div = container.querySelector('.cell')

    expect(div).toBeTruthy()
    expect(div.classList.contains('blocked')).toBe(true)
  })

  it('renders filled cell with color', () => {
    const { container } = render(<Square filled={true} color="red" />)
    const div = container.querySelector('.cell')

    expect(div).toBeTruthy()
    expect(div.classList.contains('filled')).toBe(true)
    expect(div.classList.contains('red')).toBe(true)
  })

  it('renders empty cell when not blocked and not filled', () => {
    const { container } = render(<Square />)
    const div = container.querySelector('.cell')

    expect(div).toBeTruthy()
    expect(div.classList.contains('empty')).toBe(true)
  })
})
