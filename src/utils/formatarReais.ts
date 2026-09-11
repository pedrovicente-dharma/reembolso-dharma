// Formata um número como moeda brasileira, ex: 1234.5 -> "R$ 1.234,50"
export function formatarReais(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
