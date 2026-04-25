import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Select from '@/components/ui/Select'

const options = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'PAID', label: 'Lunas' },
  { value: 'EXPIRED', label: 'Kedaluwarsa' },
]

describe('Select', () => {
  it('renders all options', () => {
    render(<Select options={options} />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
    expect(screen.getByText('Lunas')).toBeInTheDocument()
    expect(screen.getByText('Kedaluwarsa')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<Select id="status" label="Status" options={options} />)
    expect(screen.getByLabelText('Status')).toBeInTheDocument()
  })

  it('renders placeholder option when provided', () => {
    render(<Select options={options} placeholder="Pilih status" />)
    expect(screen.getByText('Pilih status')).toBeInTheDocument()
  })

  it('renders error message when provided', () => {
    render(<Select options={options} error="Wajib dipilih" />)
    expect(screen.getByText('Wajib dipilih')).toBeInTheDocument()
  })

  it('calls onChange when option selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<Select options={options} onChange={onChange} />)
    await user.selectOptions(screen.getByRole('combobox'), 'PAID')

    expect(onChange).toHaveBeenCalled()
  })

  it('is disabled when disabled prop passed', () => {
    render(<Select options={options} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })
})