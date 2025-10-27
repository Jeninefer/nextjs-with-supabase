import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import App from '../App'

describe('App slides navigation', () => {
  it('renders initial slide and navigates via buttons', async () => {
    render(<App />)
    // Initial
    expect(screen.getByText(/Slide 1 of 5/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Objetivos/i })).toBeInTheDocument()
    const prev = screen.getByRole('button', { name: /Anterior/i })
    const next = screen.getByRole('button', { name: /Siguiente/i })
    expect(prev).toBeDisabled()
    expect(next).not.toBeDisabled()

    // Go to slide 3 (KAM)
    await userEvent.click(screen.getByRole('button', { name: '3' }))
    expect(screen.getByRole('heading', { name: /Estrategia KAM/i })).toBeInTheDocument()

    // Go last and verify disabled state
    await userEvent.click(screen.getByRole('button', { name: '5' }))
    expect(screen.getByText(/Slide 5 of 5/i)).toBeInTheDocument()
    expect(next).toBeDisabled()
  })
})