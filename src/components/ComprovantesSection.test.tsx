import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ComprovantesSection } from './ComprovantesSection'

function renderSection(comp = []) {
  const onChange = vi.fn()
  render(<ComprovantesSection comp={comp} onChange={onChange} />)
  return { onChange }
}

function fillAndAdd(overrides: Record<string, string> = {}) {
  const fields = {
    descricao: 'Almoço cliente',
    centroCusto: 'CC-001',
    projeto: 'Dharma Labs',
    valor: '50',
    ...overrides,
  }
  if (fields.descricao) fireEvent.change(screen.getByPlaceholderText(/reunião comercial/i), { target: { value: fields.descricao } })
  if (fields.centroCusto) fireEvent.change(screen.getByPlaceholderText(/CC-001/i), { target: { value: fields.centroCusto } })
  if (fields.projeto) fireEvent.change(screen.getByPlaceholderText(/Dharma Labs/i), { target: { value: fields.projeto } })
  if (fields.valor) fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: fields.valor } })
  fireEvent.click(screen.getByText('+ Adicionar'))
}

describe('ComprovantesSection', () => {
  it('exibe erro quando descrição está vazia', () => {
    renderSection()
    fillAndAdd({ descricao: '' })
    expect(screen.getByText('Descrição obrigatória')).toBeInTheDocument()
  })

  it('exibe erro quando centro de custo está vazio', () => {
    renderSection()
    fillAndAdd({ centroCusto: '' })
    expect(screen.getByText('Centro de custo obrigatório')).toBeInTheDocument()
  })

  it('exibe erro quando projeto está vazio', () => {
    renderSection()
    fillAndAdd({ projeto: '' })
    expect(screen.getByText('Projeto obrigatório')).toBeInTheDocument()
  })

  it('não chama onChange quando há erros de validação', () => {
    const { onChange } = renderSection()
    fillAndAdd({ descricao: '' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('chama onChange com novo comprovante quando todos os campos são válidos', () => {
    const { onChange } = renderSection()
    fillAndAdd()
    expect(onChange).toHaveBeenCalledOnce()
    const [novaLista] = onChange.mock.calls[0]
    expect(novaLista).toHaveLength(1)
    expect(novaLista[0].descricao).toBe('Almoço cliente')
    expect(novaLista[0].centroCusto).toBe('CC-001')
    expect(novaLista[0].projeto).toBe('Dharma Labs')
    expect(novaLista[0].valor).toBe(50)
  })
})
