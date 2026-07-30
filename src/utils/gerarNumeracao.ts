import type { Comprovante } from '../types'

export function gerarNumeracao(comp: Comprovante[], data: string): string {
  const descricao = comp[0]?.descricao || 'Reembolso'
  return `ND - ${data} - ${descricao}`
}
