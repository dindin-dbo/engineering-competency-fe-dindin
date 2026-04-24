import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadingSpinner from '@/components/shared/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders default message', () => {
    render(<LoadingSpinner />)
    expect(screen.getByText('Memuat...')).toBeInTheDocument()
  })

  it('renders custom message', () => {
    render(<LoadingSpinner message="Memuat dashboard..." />)
    expect(screen.getByText('Memuat dashboard...')).toBeInTheDocument()
  })

  it('renders spinner svg', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.querySelector('svg.animate-spin')).toBeInTheDocument()
  })
})