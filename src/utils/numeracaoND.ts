const chaveAno = (ano: number) => `nd-seq-${ano}`

const formatarData = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`

export function proximoNumeroND(): string {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const seq = parseInt(localStorage.getItem(chaveAno(ano)) ?? '0') + 1
  return `ND ${String(seq).padStart(3, '0')} - ${formatarData(hoje)}`
}

export function confirmarNumeroND(numeroUsado: string): void {
  const ano = new Date().getFullYear()
  const match = numeroUsado.match(/ND\s+(\d+)/)
  const seqUsado = match ? parseInt(match[1], 10) : NaN
  const seqAtual = parseInt(localStorage.getItem(chaveAno(ano)) ?? '0')
  const seq = Number.isNaN(seqUsado) ? seqAtual + 1 : Math.max(seqAtual, seqUsado)
  localStorage.setItem(chaveAno(ano), String(seq))
}
