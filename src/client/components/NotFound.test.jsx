// src/client/components/__tests__/NotFound.test.jsx
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NotFound } from './NotFound'

describe('NotFound component', () => {
  it('renders the title and message', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )

    expect(screen.getByText('Page Not Found')).toBeTruthy()
    expect(
      screen.getByText(/The page you're looking for/i)
    ).toBeTruthy()
  })

  it('renders a link to the home page', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    )

    const links = screen.getAllByRole('link', { name: /home page/i })

    expect(links.length).toBeGreaterThan(0)
    expect(links[0].getAttribute('href')).toBe('/')
  })
})
