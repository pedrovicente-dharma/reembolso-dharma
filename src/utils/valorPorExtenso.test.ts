import { describe, it, expect } from 'vitest'
import { valorPorExtenso } from './valorPorExtenso'

describe('valorPorExtenso', () => {
  it('retorna "zero reais" para 0', () => {
    expect(valorPorExtenso(0)).toBe('zero reais')
  })

  it('inteiro simples', () => {
    expect(valorPorExtenso(1)).toBe('Um real')
    expect(valorPorExtenso(2)).toBe('Dois reais')
    expect(valorPorExtenso(15)).toBe('Quinze reais')
    expect(valorPorExtenso(100)).toBe('Cem reais')
  })

  it('centenas e dezenas', () => {
    expect(valorPorExtenso(150)).toBe('Cento e cinquenta reais')
    expect(valorPorExtenso(999)).toBe('Novecentos e noventa e nove reais')
  })

  it('milhares', () => {
    expect(valorPorExtenso(1000)).toBe('Um mil reais')
    expect(valorPorExtenso(1500)).toBe('Um mil e quinhentos reais')
    expect(valorPorExtenso(2000)).toBe('Dois mil reais')
  })

  it('com centavos', () => {
    expect(valorPorExtenso(1.50)).toBe('Um real e cinquenta centavos')
    expect(valorPorExtenso(0.01)).toBe('Um centavo')
    expect(valorPorExtenso(10.99)).toBe('Dez reais e noventa e nove centavos')
  })

  it('centavo único', () => {
    expect(valorPorExtenso(0.01)).toBe('Um centavo')
  })

  it('soma de valores decimais com erro de ponto flutuante não gera "cem centavos"', () => {
    const total = [25.04, 61.97, 60.38, 12.56, 16.95, 31.10].reduce((s, v) => s + v, 0)
    expect(total).not.toBe(208) // confirma que o erro de ponto flutuante está presente no teste
    expect(valorPorExtenso(total)).toBe('Duzentos e oito reais')
  })

  it('não perde centavo por erro de ponto flutuante', () => {
    expect(valorPorExtenso(2.005)).toBe('Dois reais e um centavo')
  })
})
