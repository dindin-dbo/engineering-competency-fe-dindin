import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import EmptyState from '@/components/shared/EmptyState'

describe('EmptyState', () => {
  it('renders message', () => {
    render(<EmptyState message="Belum ada invoice" />)
    expect(screen.getByText('Belum ada invoice')).toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(<EmptyState message="Kosong" description="Buat invoice pertama" />)
    expect(screen.getByTestId('empty-description')).toHaveTextContent('Buat invoice pertama')
  })

  it('does not render description when not provided', () => {
    render(<EmptyState message="Kosong" />)
    expect(screen.queryByTestId('empty-description')).not.toBeInTheDocument()
  })

  it('renders action when provided', () => {
    render(
      <EmptyState
        message="Kosong"
        action={<button>Buat Invoice</button>}
      />
    )
    expect(screen.getByRole('button', { name: 'Buat Invoice' })).toBeInTheDocument()
  })

  it('does not render action when not provided', () => {
    render(<EmptyState message="Kosong" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders icon', () => {
    const { container } = render(<EmptyState message="Kosong" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})