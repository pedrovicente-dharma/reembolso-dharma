// Dados de quem está solicitando o reembolso/nota de débito e da conta que vai receber o valor
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

// Um item de despesa reembolsável, com o arquivo (recibo/nota fiscal) anexado pelo usuário
export interface Comprovante {
  id: string
  descricao: string
  centroCusto: string
  projeto: string
  valor: number
  arquivo: File | null // guardado em memória; só é enviado ao backend no upload para o Drive
  nomeArquivo: string
}
