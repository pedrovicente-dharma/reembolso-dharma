import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SolicitanteForm } from './SolicitanteForm'
import type { Solicitante } from '../types'

const solVazio: Solicitante = {
  nome: '', cpf: '',
  banco: '', agencia: '', conta: '', chavePix: '', titular: '',
}

const solValido: Solicitante = {
  nome: 'Ana Silva', cpf: '123.456.789-00',
  banco: 'Nubank', agencia: '0001', conta: '12345-6', chavePix: '', titular: 'Ana Silva',
}

function renderForm(sol: Solicitante = solVazio) {
  const onChange = vi.fn()
  const onValidSubmit = vi.fn()
  render(
    <SolicitanteForm
      sol={sol}
      onChange={onChange}
      onValidSubmit={onValidSubmit}
      submitLabel="Enviar"
    />
  )
  return { onChange, onValidSubmit }
}

describe('SolicitanteForm', () => {
  it('exibe erro "Nome obrigatório" ao submeter com nome vazio', () => {
    renderForm(solVazio)
    fireEvent.click(screen.getByText('Enviar'))
    expect(screen.getByText('Nome obrigatório')).toBeInTheDocument()
  })

  it('exibe erro de CPF inválido ao submeter com CPF sem máscara', () => {
    renderForm({ ...solValido, cpf: '12345678900' })
    fireEvent.click(screen.getByText('Enviar'))
    expect(screen.getByText(/CPF inválido/i)).toBeInTheDocument()
  })

  it('formata o CPF automaticamente ao digitar só os números', () => {
    const { onChange } = renderForm(solVazio)
    fireEvent.change(screen.getByPlaceholderText('000.000.000-00'), { target: { value: '17630823770' } })
    expect(onChange).toHaveBeenCalledWith({ ...solVazio, cpf: '176.308.237-70' })
  })

  it('não chama onValidSubmit quando dados são inválidos', () => {
    const { onValidSubmit } = renderForm(solVazio)
    fireEvent.click(screen.getByText('Enviar'))
    expect(onValidSubmit).not.toHaveBeenCalled()
  })

  it('chama onValidSubmit quando todos os campos obrigatórios são válidos', () => {
    const { onValidSubmit } = renderForm(solValido)
    fireEvent.click(screen.getByText('Enviar'))
    expect(onValidSubmit).toHaveBeenCalledWith(solValido)
  })

  it('erro some ao corrigir o campo', () => {
    renderForm(solVazio)
    fireEvent.click(screen.getByText('Enviar'))
    expect(screen.getByText('Nome obrigatório')).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText(/Mariana/i), { target: { value: 'Pedro' } })
    expect(screen.queryByText('Nome obrigatório')).not.toBeInTheDocument()
  })
})
