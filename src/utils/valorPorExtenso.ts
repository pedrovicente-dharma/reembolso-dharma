export function valorPorExtenso(valor: number): string {
  if (valor === 0) return 'zero reais'
  const un = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
    'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
  const dez = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
  const cen = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']
  function ate999(n: number): string {
    if (n === 0) return ''
    if (n === 100) return 'cem'
    const c = Math.floor(n / 100), d = Math.floor((n % 100) / 10), u = n % 10
    let r = ''
    if (c > 0) r += cen[c]
    if (d >= 2) { r += (r ? ' e ' : '') + dez[d]; if (u > 0) r += ' e ' + un[u] }
    else if (d === 1 || u > 0) { r += (r ? ' e ' : '') + un[d * 10 + u] }
    return r
  }
  const inteiro = Math.floor(valor)
  const centavos = Math.round((valor - inteiro) * 100)
  let r = ''
  if (inteiro > 0) {
    const milhares = Math.floor(inteiro / 1000), resto = inteiro % 1000
    if (milhares > 0) r += ate999(milhares) + ' mil'
    if (resto > 0) r += (r ? ' e ' : '') + ate999(resto)
    r += inteiro === 1 ? ' real' : ' reais'
  }
  if (centavos > 0) {
    r += (r ? ' e ' : '') + ate999(centavos) + (centavos === 1 ? ' centavo' : ' centavos')
  }
  return r.charAt(0).toUpperCase() + r.slice(1)
}
