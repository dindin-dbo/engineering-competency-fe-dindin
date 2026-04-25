import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Pagination from '@/components/ui/Pagination'
import { PaginationMeta } from '@/types'

const makeMeta = (page: number, total_pages: number): PaginationMeta => ({
  page,
  limit: 10,
  total_items: total_pages * 10,
  total_pages,
})

describe('Pagination', () => {
  it('renders nothing when total_pages is 1', () => {
    const { container } = render(
      <Pagination meta={makeMeta(1, 1)} onPageChange={vi.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders page info text', () => {
    render(<Pagination meta={makeMeta(1, 3)} onPageChange={vi.fn()} />)
    expect(screen.getByText(/halaman 1 dari 3/i)).toBeInTheDocument()
  })

  it('disables previous button on first page', () => {
    render(<Pagination meta={makeMeta(1, 3)} onPageChange={vi.fn()} />)
    expect(screen.getByText('Sebelumnya')).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(<Pagination meta={makeMeta(3, 3)} onPageChange={vi.fn()} />)
    expect(screen.getByText('Berikutnya')).toBeDisabled()
  })

  it('calls onPageChange with previous page', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(<Pagination meta={makeMeta(2, 3)} onPageChange={onPageChange} />)
    await user.click(screen.getByText('Sebelumnya'))

    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('calls onPageChange with next page', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(<Pagination meta={makeMeta(2, 3)} onPageChange={onPageChange} />)
    await user.click(screen.getByText('Berikutnya'))

    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('calls onPageChange when page number clicked', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(<Pagination meta={makeMeta(1, 3)} onPageChange={onPageChange} />)
    await user.click(screen.getByText('3'))

    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('highlights current page button', () => {
    render(<Pagination meta={makeMeta(2, 3)} onPageChange={vi.fn()} />)
    const currentBtn = screen.getByText('2')
    expect(currentBtn.className).toContain('bg-blue-600')
  })
})