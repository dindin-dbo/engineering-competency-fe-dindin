import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Button from '@/components/ui/Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Masuk</Button>)
    expect(screen.getByRole('button', { name: 'Masuk' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Button onClick={onClick}>Klik</Button>)
    await user.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>Masuk</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows spinner when isLoading is true', () => {
    render(<Button isLoading>Masuk</Button>)
    const svg = document.querySelector('svg.animate-spin')
    expect(svg).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Masuk</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Button disabled onClick={onClick}>Masuk</Button>)
    await user.click(screen.getByRole('button'))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('applies fullWidth class when fullWidth is true', () => {
    render(<Button fullWidth>Masuk</Button>)
    expect(screen.getByRole('button').className).toContain('w-full')
  })

  it('applies primary variant styles by default', () => {
    render(<Button>Masuk</Button>)
    expect(screen.getByRole('button').className).toContain('bg-blue-600')
  })

  it('applies danger variant styles', () => {
    render(<Button variant="danger">Hapus</Button>)
    expect(screen.getByRole('button').className).toContain('bg-red-600')
  })

  it('applies secondary variant styles', () => {
    render(<Button variant="secondary">Batal</Button>)
    expect(screen.getByRole('button').className).toContain('bg-gray-100')
  })
})