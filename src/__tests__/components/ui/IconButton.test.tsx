import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import IconButton from '@/components/ui/IconButton'

const mockIcon = <svg data-testid="mock-icon" />

describe('IconButton', () => {
  it('renders icon', () => {
    render(<IconButton icon={mockIcon} tooltip="Test action" />)
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
  })

  it('has correct aria-label from tooltip', () => {
    render(<IconButton icon={mockIcon} tooltip="Approve" />)
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<IconButton icon={mockIcon} tooltip="Click me" onClick={onClick} />)

    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop passed', () => {
    render(<IconButton icon={mockIcon} tooltip="Disabled" disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<IconButton icon={mockIcon} tooltip="Disabled" disabled onClick={onClick} />)

    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('shows tooltip on hover', async () => {
    const user = userEvent.setup()
    render(<IconButton icon={mockIcon} tooltip="Approve Refund" />)

    await user.hover(screen.getByRole('button'))
    expect(screen.getByText('Approve Refund')).toBeInTheDocument()
  })

  it('hides tooltip when mouse leaves', async () => {
    const user = userEvent.setup()
    render(<IconButton icon={mockIcon} tooltip="Approve Refund" />)

    await user.hover(screen.getByRole('button'))
    expect(screen.getByText('Approve Refund')).toBeInTheDocument()

    await user.unhover(screen.getByRole('button'))
    expect(screen.queryByText('Approve Refund')).not.toBeInTheDocument()
  })

  it('shows tooltip on focus', async () => {
    const user = userEvent.setup()
    render(<IconButton icon={mockIcon} tooltip="Focus tooltip" />)

    await user.tab()
    expect(screen.getByText('Focus tooltip')).toBeInTheDocument()
  })

  it('does not show tooltip when disabled and hovered', async () => {
    const user = userEvent.setup()
    render(<IconButton icon={mockIcon} tooltip="Hidden tooltip" disabled />)

    await user.hover(screen.getByRole('button'))
    expect(screen.queryByText('Hidden tooltip')).not.toBeInTheDocument()
  })

  it('applies success variant styles', () => {
    render(<IconButton icon={mockIcon} tooltip="Test" variant="success" />)
    expect(screen.getByRole('button').className).toContain('text-green-600')
  })

  it('applies danger variant styles', () => {
    render(<IconButton icon={mockIcon} tooltip="Test" variant="danger" />)
    expect(screen.getByRole('button').className).toContain('text-red-500')
  })

  it('applies sm size styles', () => {
    render(<IconButton icon={mockIcon} tooltip="Test" size="sm" />)
    expect(screen.getByRole('button').className).toContain('w-7')
  })

  it('applies md size styles by default', () => {
    render(<IconButton icon={mockIcon} tooltip="Test" />)
    expect(screen.getByRole('button').className).toContain('w-8')
  })
})