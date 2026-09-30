import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'
import { gerarPDF } from './pdf/gerarPDF'
import { uploadDrive } from './api/uploadDrive'

vi.mock('./pdf/gerarPDF', () => ({ gerarPDF: vi.fn(async () => ({})) }))
vi.mock('./api/uploadDrive', () => ({ uploadDrive: vi.fn(async () => ({ folderId: 'abc' })) }))

function adicionarComprovante() {
  fireEvent.change(screen.getByPlaceholderText(/Reembolso de despesas/i), { target: { value: 'Uber' } })
  fireEvent.change(screen.getByLabelText('Centro de custo'), { target: { value: 'AI Lab' } })
  fireEvent.change(screen.getByLabelText('Projeto'), { target: { value: 'BID - Reforma Tributária' } })
  fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '50' } })
  fireEvent.click(screen.getByText('+ Adicionar'))
}

function preencherSolicitante() {
  fireEvent.change(screen.getByPlaceholderText(/Gabriel/i), { target: { value: 'Ana Silva' } })
  fireEvent.change(screen.getByPlaceholderText('000.000.000-00'), { target: { value: '123.456.789-00' } })
  fireEvent.change(screen.getByPlaceholderText(/NU PAGAMENTOS/i), { target: { value: 'Nubank' } })
  fireEvent.change(screen.getByPlaceholderText('0001'), { target: { value: '0001' } })
  fireEvent.change(screen.getByPlaceholderText('0000000-0'), { target: { value: '12345-6' } })
  fireEvent.change(screen.getByPlaceholderText(/Nome completo do titular/i), { target: { value: 'Ana Silva' } })
}

describe('App — geração da nota', () => {
  beforeEach(() => vi.clearAllMocks())

  it('não gera o PDF quando os dados do solicitante estão vazios', () => {
    render(<App />)
    adicionarComprovante()
    fireEvent.click(screen.getByText('Gerar nota de débito (PDF)'))

    expect(gerarPDF).not.toHaveBeenCalled()
    expect(uploadDrive).not.toHaveBeenCalled()
    expect(screen.getByText('Nome obrigatório')).toBeInTheDocument()
    expect(screen.getByText(/Preencha corretamente os dados do solicitante/)).toBeInTheDocument()
  })

  it('gera e envia o PDF quando os dados do solicitante são válidos', async () => {
    render(<App />)
    preencherSolicitante()
    adicionarComprovante()
    fireEvent.click(screen.getByText('Gerar nota de débito (PDF)'))

    await waitFor(() => expect(uploadDrive).toHaveBeenCalledTimes(1))
    expect(gerarPDF).toHaveBeenCalledTimes(1)
  })
})
