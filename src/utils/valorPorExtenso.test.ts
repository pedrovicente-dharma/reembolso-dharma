import { describe, it, expect } from 'vitest'
import { valorPorExtenso } from './valorPorExtenso'

describe('valorPorExtenso', () => {
  it('retorna "Zero reais" para 0', () => {
    expect(valorPorExtenso(0)).toBe('Zero reais')
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

  it('milhares sem "um" antes de "mil"', () => {
    expect(valorPorExtenso(1000)).toBe('Mil reais')
    expect(valorPorExtenso(1500)).toBe('Mil e quinhentos reais')
    expect(valorPorExtenso(1020)).toBe('Mil e vinte reais')
    expect(valorPorExtenso(1100)).toBe('Mil e cem reais')
    expect(valorPorExtenso(2000)).toBe('Dois mil reais')
    expect(valorPorExtenso(21000)).toBe('Vinte e um mil reais')
  })

  it('não usa "e" antes de centena não redonda', () => {
    expect(valorPorExtenso(1234.56)).toBe('Mil duzentos e trinta e quatro reais e cinquenta e seis centavos')
  })

  it('milhões e bilhões', () => {
    expect(valorPorExtenso(1000000)).toBe('Um milhão de reais')
    expect(valorPorExtenso(2000000)).toBe('Dois milhões de reais')
    expect(valorPorExtenso(1250000)).toBe('Um milhão duzentos e cinquenta mil reais')
    expect(valorPorExtenso(3000500)).toBe('Três milhões e quinhentos reais')
    expect(valorPorExtenso(1000000000)).toBe('Um bilhão de reais')
  })

  it('com centavos', () => {
    expect(valorPorExtenso(1.50)).toBe('Um real e cinquenta centavos')
    expect(valorPorExtenso(10.99)).toBe('Dez reais e noventa e nove centavos')
    expect(valorPorExtenso(0.29)).toBe('Vinte e nove centavos')
  })

  it('centavo único', () => {
    expect(valorPorExtenso(0.01)).toBe('Um centavo')
  })

  it('não sofre erro de ponto flutuante nos centavos', () => {
    expect(valorPorExtenso(4.35)).toBe('Quatro reais e trinta e cinco centavos')
    expect(valorPorExtenso(0.1 + 0.2)).toBe('Trinta centavos')
    expect(valorPorExtenso(1.999)).toBe('Dois reais')
  })

  it('lança erro para valores inválidos ou fora do suportado', () => {
    expect(() => valorPorExtenso(-1)).toThrow(/inválido/)
    expect(() => valorPorExtenso(NaN)).toThrow(/inválido/)
    expect(() => valorPorExtenso(1e12)).toThrow(/acima do suportado/)
  })
})
