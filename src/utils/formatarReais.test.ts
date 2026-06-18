import { describe, it, expect } from 'vitest'
import { formatarReais } from './formatarReais'

describe('formatarReais', () => {
  it('formata zero', () => {
    expect(formatarReais(0)).toMatch(/R\$\s*0,00/)
  })

  it('formata valor inteiro positivo', () => {
    expect(formatarReais(100)).toMatch(/R\$\s*100,00/)
  })

  it('formata valor com centavos', () => {
    expect(formatarReais(1.5)).toMatch(/R\$\s*1,50/)
    expect(formatarReais(99.99)).toMatch(/R\$\s*99,99/)
  })

  it('formata valores grandes com separador de milhar', () => {
    expect(formatarReais(1000)).toMatch(/R\$\s*1\.000,00/)
  })
})
