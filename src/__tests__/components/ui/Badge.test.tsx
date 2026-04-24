import { render, screen } from '@testing-library/react'
import Badge from '@/components/ui/Badge'

describe('Badge', () => {
  it('renders label text', () => {
    render(<Badge label="Lunas" />)
    expect(screen.getByText('Lunas')).toBeInTheDocument()
  })

  it('applies success variant styles', () => {
    render(<Badge label="Lunas" variant="success" />)
    const badge = screen.getByText('Lunas')
    expect(badge.className).toContain('bg-green-50')
    expect(badge.className).toContain('text-green-700')
  })

  it('applies warning variant styles', () => {
    render(<Badge label="Pending" variant="warning" />)
    const badge = screen.getByText('Pending')
    expect(badge.className).toContain('bg-amber-50')
    expect(badge.className).toContain('text-amber-700')
  })

  it('applies danger variant styles', () => {
    render(<Badge label="Gagal" variant="danger" />)
    const badge = screen.getByText('Gagal')
    expect(badge.className).toContain('bg-red-50')
    expect(badge.className).toContain('text-red-700')
  })

  it('applies info variant styles', () => {
    render(<Badge label="Info" variant="info" />)
    const badge = screen.getByText('Info')
    expect(badge.className).toContain('bg-blue-50')
    expect(badge.className).toContain('text-blue-700')
  })

  it('applies neutral variant styles by default', () => {
    render(<Badge label="Default" />)
    const badge = screen.getByText('Default')
    expect(badge.className).toContain('bg-gray-50')
    expect(badge.className).toContain('text-gray-600')
  })
})