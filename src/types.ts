export interface Solicitante {
  nome: string
  cpf: string
  rg: string
  endereco: string
  banco: string
  agencia: string
  conta: string
  chavePix: string
  titular: string
}

export interface Comprovante {
  id: string
  descricao: string
  centroCusto: string
  projeto: string
  valor: number
  arquivo: File | null
  nomeArquivo: string
}
