import { describe, it, expect } from 'vitest'
import { formatarCPF } from './formatarCPF'

describe('formatarCPF', () => {
  it('formata 11 dígitos sem pontuação', () => {
    expect(formatarCPF('17630823770')).toBe('176.308.237-70')
  })

  it('aplica a máscara progressivamente enquanto digita', () => {
    expect(formatarCPF('')).toBe('')
    expect(formatarCPF('176')).toBe('176')
    expect(formatarCPF('1763')).toBe('176.3')
    expect(formatarCPF('176308')).toBe('176.308')
    expect(formatarCPF('1763082')).toBe('176.308.2')
    expect(formatarCPF('176308237')).toBe('176.308.237')
    expect(formatarCPF('1763082377')).toBe('176.308.237-7')
  })

  it('mantém um CPF já formatado', () => {
    expect(formatarCPF('176.308.237-70')).toBe('176.308.237-70')
  })

  it('ignora letras, espaços e dígitos além do 11º', () => {
    expect(formatarCPF(' 176a308 237-70999')).toBe('176.308.237-70')
  })
})
