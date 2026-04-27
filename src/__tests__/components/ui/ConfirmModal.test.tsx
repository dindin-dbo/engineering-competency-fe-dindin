import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import ConfirmModal from '@/components/ui/ConfirmModal'

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  title: 'Konfirmasi Aksi',
  description: 'Apakah kamu yakin?',
}

afterEach(() => {
  document.body.style.overflow = ''
})

describe('ConfirmModal', () => {
  it('renders title and description', () => {
    render(<ConfirmModal {...defaultProps} />)
    expect(screen.getByText('Konfirmasi Aksi')).toBeInTheDocument()
    expect(screen.getByText('Apakah kamu yakin?')).toBeInTheDocument()
  })

  it('renders default confirm and cancel labels', () => {
    render(<ConfirmModal {...defaultProps} />)
    expect(screen.getByRole('button', { name: /konfirmasi/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /batal/i })).toBeInTheDocument()
  })

  it('renders custom confirm and cancel labels', () => {
    render(
      <ConfirmModal
        {...defaultProps}
        confirmLabel="Ya, Hapus"
        cancelLabel="Tidak"
      />
    )
    expect(screen.getByRole('button', { name: /ya, hapus/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tidak/i })).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />)

    await user.click(screen.getByRole('button', { name: /konfirmasi/i }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when cancel button clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<ConfirmModal {...defaultProps} onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: /batal/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('disables both buttons when isLoading', () => {
    render(<ConfirmModal {...defaultProps} isLoading={true} />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((btn) => {
      if (btn.getAttribute('aria-label') !== 'Tutup modal') {
        expect(btn).toBeDisabled()
      }
    })
  })

  it('shows loading text when isLoading', () => {
    render(<ConfirmModal {...defaultProps} isLoading={true} />)
    expect(screen.getByText('Memproses...')).toBeInTheDocument()
  })

  it('applies success variant', () => {
    render(<ConfirmModal {...defaultProps} variant="success" />)
    const confirmBtn = screen.getByRole('button', { name: /konfirmasi/i })
    expect(confirmBtn.className).toContain('bg-green-600')
  })

  it('applies danger variant', () => {
    render(<ConfirmModal {...defaultProps} variant="danger" />)
    const confirmBtn = screen.getByRole('button', { name: /konfirmasi/i })
    expect(confirmBtn.className).toContain('bg-red-600')
  })

  it('does not render when isOpen is false', () => {
    render(<ConfirmModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})