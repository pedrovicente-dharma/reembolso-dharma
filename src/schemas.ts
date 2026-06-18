import { z } from 'zod'

export const SolicitanteSchema = z.object({
  nome:     z.string().min(1, 'Nome obrigatório'),
  cpf:      z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido (use 000.000.000-00)'),
  rg:       z.string().optional(),
  endereco: z.string().optional(),
  banco:    z.string().min(1, 'Banco obrigatório'),
  agencia:  z.string().min(1, 'Agência obrigatória'),
  conta:    z.string().min(1, 'Conta obrigatória'),
  chavePix: z.string().optional(),
  titular:  z.string().min(1, 'Nome do titular obrigatório'),
})

export const ComprovanteInputSchema = z.object({
  descricao:   z.string().min(1, 'Descrição obrigatória'),
  centroCusto: z.string().min(1, 'Centro de custo obrigatório'),
  projeto:     z.string().min(1, 'Projeto obrigatório'),
  valor:       z.number({ error: 'Valor inválido' }).positive('Valor deve ser maior que zero'),
})

export type SolicitanteData  = z.infer<typeof SolicitanteSchema>
export type ComprovanteInput = z.infer<typeof ComprovanteInputSchema>
