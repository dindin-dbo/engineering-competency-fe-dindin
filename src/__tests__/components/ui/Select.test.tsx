import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Select from '@/components/ui/Select'

const options = [
  { value: 'inv-1', label: 'INV-001 — Andi — Rp 150.000' },
  { value: 'inv-2', label: 'INV-002 — Siti — Rp 300.000' },
]

describe('Select', () => {
  it('renders all options', () => {
    render(<Select options={options} />)
    expect(screen.getByText('INV-001 — Andi — Rp 150.000')).toBeInTheDocument()
    expect(screen.getByText('INV-002 — Siti — Rp 300.000')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<Select id="invoice" label="Pilih Invoice" options={options} />)
    expect(screen.getByLabelText('Pilih Invoice')).toBeInTheDocument()
  })

  it('renders placeholder option when provided', () => {
    render(<Select options={options} placeholder="-- Pilih invoice --" />)
    expect(screen.getByText('-- Pilih invoice --')).toBeInTheDocument()
  })

  it('renders error message when provided', () => {
    render(<Select options={options} error="Wajib dipilih" />)
    expect(screen.getByText('Wajib dipilih')).toBeInTheDocument()
  })

  it('renders hint when provided and no error', () => {
    render(<Select options={options} hint="Tidak ada invoice PAID" />)
    expect(screen.getByText('Tidak ada invoice PAID')).toBeInTheDocument()
  })

  it('does not render hint when error exists', () => {
    render(<Select options={options} hint="Hint text" error="Ada error" />)
    expect(screen.queryByText('Hint text')).not.toBeInTheDocument()
  })

  it('renders dropdown icon', () => {
    const { container } = render(<Select options={options} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('calls onChange when option selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Select options={options} onChange={onChange} />)

    await user.selectOptions(screen.getByRole('combobox'), 'inv-1')
    expect(onChange).toHaveBeenCalled()
  })

  it('is disabled when disabled prop passed', () => {
    render(<Select options={options} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('applies error styling when error provided', () => {
    render(<Select options={options} error="Error" />)
    expect(screen.getByRole('combobox').className).toContain('border-red-400')
  })

  it('applies normal styling when no error', () => {
    render(<Select options={options} />)
    expect(screen.getByRole('combobox').className).toContain('border-gray-300')
  })
})