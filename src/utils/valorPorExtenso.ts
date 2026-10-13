const UN = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
  'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
const DEZ = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
const CEN = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']

// Maior valor suportado (inteiro): 999.999.999.999
const LIMITE = 1e12

function ate999(n: number): string {
  if (n === 0) return ''
  if (n === 100) return 'cem'
  const c = Math.floor(n / 100), d = Math.floor((n % 100) / 10), u = n % 10
  let r = ''
  if (c > 0) r += CEN[c]
  if (d >= 2) { r += (r ? ' e ' : '') + DEZ[d]; if (u > 0) r += ' e ' + UN[u] }
  else if (d === 1 || u > 0) { r += (r ? ' e ' : '') + UN[d * 10 + u] }
  return r
}

function inteiroPorExtenso(n: number): string {
  const grupos = [
    { valor: Math.floor(n / 1e9) % 1000, singular: 'bilhão', plural: 'bilhões' },
    { valor: Math.floor(n / 1e6) % 1000, singular: 'milhão', plural: 'milhões' },
    { valor: Math.floor(n / 1e3) % 1000, singular: 'mil', plural: 'mil' },
    { valor: n % 1000, singular: '', plural: '' },
  ].filter(g => g.valor > 0)

  return grupos.reduce((r, g, i) => {
    // "mil", não "um mil"
    const numero = g.singular === 'mil' && g.valor === 1 ? '' : ate999(g.valor)
    const escala = g.valor === 1 ? g.singular : g.plural
    const texto = [numero, escala].filter(Boolean).join(' ')
    if (i === 0) return texto
    // Regra do "e" entre grupos: só antes do último grupo quando ele é < 100 ou centena
    // redonda ("mil e quinhentos", "mil e vinte"), mas "mil duzentos e trinta".
    const usaE = i === grupos.length - 1 && (g.valor < 100 || g.valor % 100 === 0)
    return r + (usaE ? ' e ' : ' ') + texto
  }, '')
}

export function valorPorExtenso(valor: number): string {
  if (!Number.isFinite(valor) || valor < 0) {
    throw new Error(`Valor inválido para escrita por extenso: ${valor}`)
  }
  // Trabalha em centavos inteiros para evitar erro de ponto flutuante (ex: 4.35 * 100 = 434.99...)
  const totalCentavos = Math.round(valor * 100)
  const inteiro = Math.floor(totalCentavos / 100)
  const centavos = totalCentavos % 100
  if (inteiro >= LIMITE) {
    throw new Error(`Valor acima do suportado para escrita por extenso: ${valor}`)
  }
  if (totalCentavos === 0) return 'Zero reais'

  let r = ''
  if (inteiro > 0) {
    r = inteiroPorExtenso(inteiro)
    // "um milhão de reais", "dois bilhões de reais"
    if (inteiro >= 1e6 && inteiro % 1e6 === 0) r += ' de reais'
    else r += inteiro === 1 ? ' real' : ' reais'
  }
  if (centavos > 0) {
    r += (r ? ' e ' : '') + ate999(centavos) + (centavos === 1 ? ' centavo' : ' centavos')
  }
  return r.charAt(0).toUpperCase() + r.slice(1)
}
