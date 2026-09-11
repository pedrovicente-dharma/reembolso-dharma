// Contador de numeração de ND (nota de débito) persistido no localStorage, um contador por ano

const chaveAno = (ano: number) => `nd-seq-${ano}`

const formatarData = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`

// Número "candidato" para exibir no formulário — não reserva/persiste nada.
// O usuário pode editar esse valor livremente antes de gerar o PDF.
export function proximoNumeroND(): string {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const seq = parseInt(localStorage.getItem(chaveAno(ano)) ?? '0') + 1
  return `ND ${String(seq).padStart(3, '0')} - ${formatarData(hoje)}`
}

// Chamado após o PDF ser gerado com sucesso, para avançar o contador.
// Recebe o número que foi de fato impresso (numeroUsado) em vez de recalcular do zero,
// porque o usuário pode ter editado o campo de numeração manualmente antes de gerar —
// se ignorássemos isso, o contador interno dessincronizaria do que já foi emitido.
export function confirmarNumeroND(numeroUsado: string): void {
  const ano = new Date().getFullYear()
  const match = numeroUsado.match(/ND\s+(\d+)/)
  const seqUsado = match ? parseInt(match[1], 10) : NaN
  const seqAtual = parseInt(localStorage.getItem(chaveAno(ano)) ?? '0')
  // Math.max evita retroceder o contador caso o número usado seja menor que o já persistido
  const seq = Number.isNaN(seqUsado) ? seqAtual + 1 : Math.max(seqAtual, seqUsado)
  localStorage.setItem(chaveAno(ano), String(seq))
}
