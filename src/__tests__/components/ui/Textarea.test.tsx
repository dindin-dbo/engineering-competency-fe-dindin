import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { createRef } from 'react'
import Textarea from '@/components/ui/Textarea'

describe('Textarea Component', () => {
  it('harus merender label dan textarea dengan benar', () => {
    render(
      <Textarea 
        id="description" 
        label="Deskripsi" 
        placeholder="Masukkan deskripsi..." 
      />
    )
    
    // Cek apakah label muncul
    expect(screen.getByText('Deskripsi')).toBeInTheDocument()
    // Cek apakah textarea muncul berdasarkan placeholder
    expect(screen.getByPlaceholderText('Masukkan deskripsi...')).toBeInTheDocument()
  })

  it('harus bisa menerima input teks dari user', () => {
    render(<Textarea id="test-textarea" />)
    
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'Halo ini testing' } })
    
    expect(textarea.value).toBe('Halo ini testing')
  })

  it('harus menampilkan pesan error dan menerapkan style border merah', () => {
    const errorMessage = 'Kolom ini wajib diisi'
    render(<Textarea id="test-error" error={errorMessage} />)
    
    // Pastikan teks error muncul
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    
    // Pastikan class border-red-400 diterapkan ke textarea
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('border-red-400')
    expect(textarea).toHaveClass('text-red-900')
  })

  it('harus dalam keadaan disabled jika prop disabled diberikan', () => {
    render(<Textarea id="test-disabled" disabled />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
    expect(textarea).toHaveClass('disabled:bg-gray-100')
  })

  it('harus bisa meneruskan (forward) ref ke elemen textarea asli', () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<Textarea id="test-ref" ref={ref} />)
    
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    expect(ref.current?.id).toBe('test-ref')
  })

  it('harus menggabungkan className tambahan jika diberikan lewat props', () => {
    render(<Textarea id="test-class" className="custom-class" />)
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('custom-class')
    // Pastikan class bawaan (seperti w-full) tetap ada
    expect(textarea).toHaveClass('w-full')
  })

  it('harus meneruskan atribut textarea standar (seperti rows)', () => {
    render(<Textarea id="test-rows" rows={10} />)
    
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.rows).toBe(10)
  })
})