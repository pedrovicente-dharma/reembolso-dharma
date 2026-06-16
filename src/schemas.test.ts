import { describe, it, expect } from 'vitest'
import { SolicitanteSchema, ComprovanteInputSchema } from './schemas'

const solicitanteValido = {
  nome: 'Ana Silva', cpf: '123.456.789-00', rg: '', endereco: '',
  banco: 'Nubank', agencia: '0001', conta: '12345-6', chavePix: '', titular: 'Ana Silva',
}

describe('SolicitanteSchema', () => {
  it('aceita objeto válido', () => {
    expect(SolicitanteSchema.safeParse(solicitanteValido).success).toBe(true)
  })

  it('rejeita nome vazio', () => {
    const r = SolicitanteSchema.safeParse({ ...solicitanteValido, nome: '' })
    expect(r.success).toBe(false)
    expect(JSON.stringify(r)).toContain('Nome obrigatório')
  })

  it('rejeita CPF sem máscara', () => {
    const r = SolicitanteSchema.safeParse({ ...solicitanteValido, cpf: '12345678900' })
    expect(r.success).toBe(false)
    expect(JSON.stringify(r)).toContain('CPF inválido')
  })

  it('rejeita CPF com máscara errada', () => {
    const r = SolicitanteSchema.safeParse({ ...solicitanteValido, cpf: '123.456.789-0' })
    expect(r.success).toBe(false)
  })

  it('rejeita banco vazio', () => {
    const r = SolicitanteSchema.safeParse({ ...solicitanteValido, banco: '' })
    expect(r.success).toBe(false)
    expect(JSON.stringify(r)).toContain('Banco obrigatório')
  })

  it('rejeita titular vazio', () => {
    const r = SolicitanteSchema.safeParse({ ...solicitanteValido, titular: '' })
    expect(r.success).toBe(false)
    expect(JSON.stringify(r)).toContain('Nome do titular obrigatório')
  })

  it('aceita rg e endereco opcionais ausentes', () => {
    const { rg, endereco, ...semOpcionais } = solicitanteValido
    expect(SolicitanteSchema.safeParse(semOpcionais).success).toBe(true)
  })
})

describe('ComprovanteInputSchema', () => {
  const comprovanteValido = {
    descricao: 'Almoço cliente', centroCusto: 'CC-001', projeto: 'Dharma Labs', valor: 50,
  }

  it('aceita objeto válido', () => {
    expect(ComprovanteInputSchema.safeParse(comprovanteValido).success).toBe(true)
  })

  it('rejeita descrição vazia', () => {
    const r = ComprovanteInputSchema.safeParse({ ...comprovanteValido, descricao: '' })
    expect(r.success).toBe(false)
    expect(JSON.stringify(r)).toContain('Descrição obrigatória')
  })

  it('rejeita centroCusto vazio', () => {
    const r = ComprovanteInputSchema.safeParse({ ...comprovanteValido, centroCusto: '' })
    expect(r.success).toBe(false)
    expect(JSON.stringify(r)).toContain('Centro de custo obrigatório')
  })

  it('rejeita projeto vazio', () => {
    const r = ComprovanteInputSchema.safeParse({ ...comprovanteValido, projeto: '' })
    expect(r.success).toBe(false)
    expect(JSON.stringify(r)).toContain('Projeto obrigatório')
  })

  it('rejeita valor zero', () => {
    const r = ComprovanteInputSchema.safeParse({ ...comprovanteValido, valor: 0 })
    expect(r.success).toBe(false)
  })

  it('rejeita valor negativo', () => {
    const r = ComprovanteInputSchema.safeParse({ ...comprovanteValido, valor: -10 })
    expect(r.success).toBe(false)
  })
})
