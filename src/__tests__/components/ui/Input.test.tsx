import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Input from '@/components/ui/Input'

describe('Input', () => {
  it('renders input element', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<Input id="email" label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('does not render label when not provided', () => {
    render(<Input id="email" />)
    expect(screen.queryByRole('label')).not.toBeInTheDocument()
  })

  it('renders error message when provided', () => {
    render(<Input error="Field wajib diisi" />)
    expect(screen.getByText('Field wajib diisi')).toBeInTheDocument()
  })

  it('does not render error message when not provided', () => {
    render(<Input />)
    expect(screen.queryByText('Field wajib diisi')).not.toBeInTheDocument()
  })

  it('applies error styling when error is provided', () => {
    render(<Input error="Ada error" />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('border-red-400')
  })

  it('applies normal styling when no error', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('border-gray-300')
  })

  it('calls onChange when user types', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<Input onChange={onChange} />)
    await user.type(screen.getByRole('textbox'), 'hello')

    expect(onChange).toHaveBeenCalled()
  })

  it('is disabled when disabled prop passed', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('renders password type correctly', () => {
    render(<Input type="password" />)
    const input = document.querySelector('input[type="password"]')
    expect(input).toBeInTheDocument()
  })
})