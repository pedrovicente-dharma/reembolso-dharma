import { describe, it, expect, vi } from 'vitest'
import { gerarPDF } from './gerarPDF'
import type { Solicitante, Comprovante } from '../types'

vi.mock('../utils/loadImage', () => ({
  loadImage: () => Promise.resolve(''),
}))

const sol: Solicitante = {
  nome: 'Ana Silva', cpf: '123.456.789-00', rg: '', endereco: '',
  banco: 'Nubank', agencia: '0001', conta: '12345-6', chavePix: '', titular: 'Ana Silva',
}

function comprovante(overrides: Partial<Comprovante> = {}): Comprovante {
  return {
    id: Math.random().toString(),
    descricao: 'Item de despesa',
    centroCusto: 'CC-001',
    projeto: 'Dharma Labs',
    valor: 10,
    arquivo: null,
    nomeArquivo: '',
    ...overrides,
  }
}

describe('gerarPDF', () => {
  it('gera uma única página para uma lista curta de comprovantes', async () => {
    const comp = [comprovante()]
    const doc = await gerarPDF(sol, comp, 10, 'ND 001 - 11-09-2026')
    expect(doc.getNumberOfPages()).toBe(1)
  })

  it('quebra em novas páginas quando há muitos comprovantes', async () => {
    const comp = Array.from({ length: 60 }, (_, i) =>
      comprovante({ id: String(i), descricao: `Item de despesa número ${i}`, valor: 10 })
    )
    const doc = await gerarPDF(sol, comp, 600, 'ND 001 - 11-09-2026')
    expect(doc.getNumberOfPages()).toBeGreaterThan(1)
  })

  it('não lança erro com descrição muito longa (texto deve ser quebrado, não vazar de coluna)', async () => {
    const comp = [
      comprovante({
        descricao: 'Descrição muito longa que precisa ser quebrada em múltiplas linhas para não invadir a coluna de centro de custo ao lado',
      }),
    ]
    const doc = await gerarPDF(sol, comp, 10, 'ND 001 - 11-09-2026')
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1)
  })
})
