import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ErrorMessage from '@/components/shared/ErrorMessage'

describe('ErrorMessage', () => {
  it('renders error message text', () => {
    render(<ErrorMessage message="Login gagal" />)
    expect(screen.getByText('Login gagal')).toBeInTheDocument()
  })

  it('renders error icon', () => {
    render(<ErrorMessage message="Error" />)
    const svg = document.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('applies red styling', () => {
    render(<ErrorMessage message="Error" />)
    const container = screen.getByText('Error').closest('div')
    expect(container?.className).toContain('bg-red-50')
  })
})