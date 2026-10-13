import { z } from 'zod'

// Arquivos com prefixo "_" dentro de /api não viram endpoint na Vercel.

export const MAX_ARQUIVOS = 30
// A Vercel já corta requisições acima de ~4,5 MB; base64 infla ~33%, então o
// conteúdo decodificado nunca passa de ~3,4 MB. O limite aqui é defesa extra.
export const MAX_BYTES_TOTAL = 4 * 1024 * 1024
const MAX_NOME = 500

// Assinatura (magic bytes) de cada tipo aceito — o mimeType enviado pelo cliente
// não é confiável, então conferimos o conteúdo real do arquivo.
const ASSINATURAS = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/jpeg': [0xff, 0xd8, 0xff],
}

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/

// Remove caracteres de controle e barras (Drive aceita, mas confundem quem lê a pasta)
function sanitizarNome(nome) {
  return nome.replace(/[\u0000-\u001f\u007f/\\]/g, '').trim()
}

const nome = z.string().transform(sanitizarNome).pipe(z.string().min(1).max(MAX_NOME))
const textoOpcional = z.string().max(MAX_NOME).optional()

const ArquivoSchema = z.object({
  name: nome,
  mimeType: z.enum(Object.keys(ASSINATURAS)),
  data: z.string().min(1).regex(BASE64, 'conteúdo não é base64 válido'),
})

const UploadSchema = z.object({
  folderName: nome,
  files: z.array(ArquivoSchema).min(1).max(MAX_ARQUIVOS),
  solicitante: textoOpcional,
  numeracao: textoOpcional,
  valorTotal: z.number().nonnegative().optional(),
  centroCusto: z.string().max(2000).optional(),
  projeto: z.string().max(2000).optional(),
})

function temAssinatura(buffer, mimeType) {
  const assinatura = ASSINATURAS[mimeType]
  return buffer.length >= assinatura.length && assinatura.every((byte, i) => buffer[i] === byte)
}

/**
 * Valida o corpo de POST /api/upload.
 * Retorna { ok: true, data } com os arquivos já decodificados em `buffer`,
 * ou { ok: false, error } com uma mensagem legível para o usuário.
 */
export function validarUpload(body) {
  const parsed = UploadSchema.safeParse(body)
  if (!parsed.success) {
    const detalhes = parsed.error.issues
      .map((i) => `${i.path.join('.') || 'corpo'}: ${i.message}`)
      .join('; ')
    return { ok: false, error: `Dados inválidos — ${detalhes}` }
  }

  const { files, ...resto } = parsed.data
  let totalBytes = 0
  const arquivos = []

  for (const [i, file] of files.entries()) {
    const buffer = Buffer.from(file.data, 'base64')
    totalBytes += buffer.length
    if (!temAssinatura(buffer, file.mimeType)) {
      return { ok: false, error: `Arquivo "${file.name}" não corresponde ao tipo ${file.mimeType}` }
    }
    arquivos.push({ name: file.name, mimeType: file.mimeType, buffer, index: i })
  }

  if (totalBytes > MAX_BYTES_TOTAL) {
    return { ok: false, error: 'Arquivos excedem o tamanho máximo permitido por envio' }
  }
  if (!arquivos.some((f) => f.mimeType === 'application/pdf')) {
    return { ok: false, error: 'O envio deve conter o PDF da nota de débito' }
  }

  return { ok: true, data: { ...resto, files: arquivos } }
}

// Slack mrkdwn interpreta &, < e > (ex: <https://x|texto> vira link). Campos vindos
// do usuário precisam ser escapados para não injetar links ou menções na mensagem.
export function escaparSlack(texto) {
  return String(texto).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
