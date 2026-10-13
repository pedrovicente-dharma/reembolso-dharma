import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SucessoReembolso } from './SucessoReembolso'

describe('SucessoReembolso', () => {
  it('mostra a confirmação com a numeração e o valor', () => {
    render(<SucessoReembolso numeracao="ND 001/2025" total={1234.5} onNovo={vi.fn()} />)
    expect(screen.getByText('Reembolso solicitado!')).toBeInTheDocument()
    expect(screen.getByText('ND 001/2025')).toBeInTheDocument()
    expect(screen.getByText(/1\.234,50/)).toBeInTheDocument()
  })

  it('chama onNovo ao clicar em "Solicitar novo reembolso"', () => {
    const onNovo = vi.fn()
    render(<SucessoReembolso numeracao="ND 001/2025" total={10} onNovo={onNovo} />)
    fireEvent.click(screen.getByText('Solicitar novo reembolso'))
    expect(onNovo).toHaveBeenCalledOnce()
  })
})
