import { render, screen } from '@testing-library/react'
import StatCard from '@/components/ui/StatCard'

const mockIcon = <svg data-testid="mock-icon" />

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Saldo Wallet" value="Rp 500.000" icon={mockIcon} />)
    expect(screen.getByText('Saldo Wallet')).toBeInTheDocument()
    expect(screen.getByText('Rp 500.000')).toBeInTheDocument()
  })

  it('renders icon', () => {
    render(<StatCard label="Test" value="0" icon={mockIcon} />)
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
  })

  it('renders sub text when provided', () => {
    render(<StatCard label="Test" value="0" icon={mockIcon} sub="5 invoice lunas" />)
    expect(screen.getByText('5 invoice lunas')).toBeInTheDocument()
  })

  it('does not render sub text when not provided', () => {
    render(<StatCard label="Test" value="0" icon={mockIcon} />)
    expect(screen.queryByText('invoice lunas')).not.toBeInTheDocument()
  })

  it('renders numeric value correctly', () => {
    render(<StatCard label="Total" value={42} icon={mockIcon} />)
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('applies custom iconBg class', () => {
    const { container } = render(
      <StatCard label="Test" value="0" icon={mockIcon} iconBg="bg-green-50" />
    )
    expect(container.querySelector('.bg-green-50')).toBeInTheDocument()
  })

  it('applies default iconBg class when not provided', () => {
    const { container } = render(
      <StatCard label="Test" value="0" icon={mockIcon} />
    )
    expect(container.querySelector('.bg-blue-50')).toBeInTheDocument()
  })
})