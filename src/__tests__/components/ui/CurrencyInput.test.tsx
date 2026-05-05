import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CurrencyInput from '@/components/ui/CurrencyInput'
import userEvent from '@testing-library/user-event'

describe('CurrencyInput Component', () => {
  it('harus merender label dan placeholder dengan benar', () => {
    render(<CurrencyInput label="Top Up" placeholder="Masukkan jumlah" />)
    
    expect(screen.getByText('Top Up')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Masukkan jumlah')).toBeInTheDocument()
    expect(screen.getByText('Rp')).toBeInTheDocument()
  })

  it('harus memformat angka dengan pemisah ribuan saat diketik', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CurrencyInput onChange={onChange} />)
    
    const input = screen.getByRole('textbox') as HTMLInputElement
    
    // Gunakan user.type untuk mensimulasikan ketikan satu per satu karakter
    await user.type(input, '10000')
    
    expect(input.value).toBe('10.000')
    expect(onChange).toHaveBeenLastCalledWith(10000)
  })

  it('harus menangani input non-numerik (hanya mengizinkan angka)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<CurrencyInput onChange={onChange} />)
    
    const input = screen.getByRole('textbox') as HTMLInputElement
    
    // Ketik karakter campuran
    await user.type(input, '12a0!0')
    
    expect(input.value).toBe('1.200')
    expect(onChange).toHaveBeenLastCalledWith(1200)
  })

  it('harus mengupdate tampilan saat prop value berubah dari luar (sinkronisasi)', () => {
    const { rerender } = render(<CurrencyInput value={50000} />)
    
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('50.000')

    rerender(<CurrencyInput value={100000} />)
    expect(input.value).toBe('100.000')
  })

  it('harus mengosongkan input jika value bernilai 0 atau kosong', () => {
    render(<CurrencyInput value={0} />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('')
  })

  it('harus menampilkan pesan error jika prop error diberikan', () => {
    render(<CurrencyInput error="Jumlah minimal Rp 10.000" />)
    
    expect(screen.getByText('Jumlah minimal Rp 10.000')).toBeInTheDocument()
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-400')
  })

  it('harus memanggil onBlur saat input kehilangan fokus', () => {
    const onBlur = vi.fn()
    render(<CurrencyInput onBlur={onBlur} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.blur(input)
    
    expect(onBlur).toHaveBeenCalled()
  })
})