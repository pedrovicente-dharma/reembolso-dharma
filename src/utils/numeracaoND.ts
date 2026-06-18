const chaveAno = (ano: number) => `nd-seq-${ano}`

export function proximoNumeroND(): string {
  const ano = new Date().getFullYear()
  const seq = parseInt(localStorage.getItem(chaveAno(ano)) ?? '0') + 1
  return `ND ${String(seq).padStart(3, '0')}/${ano}`
}

export function confirmarNumeroND(): void {
  const ano = new Date().getFullYear()
  const seq = parseInt(localStorage.getItem(chaveAno(ano)) ?? '0') + 1
  localStorage.setItem(chaveAno(ano), String(seq))
}
