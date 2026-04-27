import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Modal from '@/components/ui/Modal'

const renderModal = (isOpen = true, onClose = vi.fn()) =>
  render(
    <Modal isOpen={isOpen} onClose={onClose} title="Test Modal">
      <p>Modal content</p>
    </Modal>
  )

describe('Modal', () => {
  afterEach(() => {
    document.body.style.overflow = ''
  })

  it('renders when isOpen is true', () => {
    renderModal()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    renderModal(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderModal(true, onClose)

    await user.click(screen.getByRole('button', { name: /tutup modal/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderModal(true, onClose)

    await user.click(screen.getByTestId('modal-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key pressed', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderModal(true, onClose)

    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('sets body overflow hidden when open', () => {
    renderModal()
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('resets body overflow when closed', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test">
        <p>Content</p>
      </Modal>
    )
    expect(document.body.style.overflow).toBe('hidden')

    rerender(
      <Modal isOpen={false} onClose={vi.fn()} title="Test">
        <p>Content</p>
      </Modal>
    )
    expect(document.body.style.overflow).toBe('')
  })

  it('renders children correctly', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test">
        <button>Action button</button>
      </Modal>
    )
    expect(screen.getByRole('button', { name: 'Action button' })).toBeInTheDocument()
  })
})