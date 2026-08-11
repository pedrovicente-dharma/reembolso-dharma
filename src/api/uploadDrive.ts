import type jsPDF from 'jspdf'
import type { Solicitante, Comprovante } from '../types'

const MAX_DIMENSAO = 1600
const QUALIDADE_JPEG = 0.8

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não foi possível ler a imagem do comprovante'))
    }
    img.src = url
  })
}

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file

  const img = await loadImageElement(file)
  const maiorLado = Math.max(img.width, img.height)
  if (maiorLado <= MAX_DIMENSAO) return file

  const escala = MAX_DIMENSAO / maiorLado
  const largura = Math.round(img.width * escala)
  const altura = Math.round(img.height * escala)

  const canvas = document.createElement('canvas')
  canvas.width = largura
  canvas.height = altura
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(img, 0, 0, largura, altura)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', QUALIDADE_JPEG),
  )
  if (!blob) return file

  const nome = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  return new File([blob], nome, { type: 'image/jpeg' })
}

export async function uploadDrive(
  sol: Solicitante,
  comp: Comprovante[],
  pdfDoc: jsPDF,
  num: string,
): Promise<{ folderId: string }> {
  const date = new Date().toISOString().split('T')[0]
  const folderName = `${date} - ${sol.nome} - ${num}`

  const pdfBase64 = pdfDoc.output('datauristring').split(',')[1]
  const files: { name: string; mimeType: string; data: string }[] = [
    {
      name: `nota-debito-${num.replace(/\//g, '-')}.pdf`,
      mimeType: 'application/pdf',
      data: pdfBase64,
    },
  ]

  for (const c of comp) {
    if (c.arquivo) {
      const arquivoComprimido = await compressImage(c.arquivo)
      const data = await fileToBase64(arquivoComprimido)
      files.push({ name: arquivoComprimido.name, mimeType: arquivoComprimido.type, data })
    }
  }

  const valorTotal = comp.reduce((s, c) => s + c.valor, 0)
  const centroCusto = [...new Set(comp.map((c) => c.centroCusto))].join(', ')
  const projeto = [...new Set(comp.map((c) => c.projeto))].join(', ')

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      folderName,
      files,
      solicitante: sol.nome,
      numeracao: num,
      valorTotal,
      centroCusto,
      projeto,
    }),
  })

  if (!res.ok) {
    const bodyText = await res.text()

    let mensagemServidor: string | undefined
    try {
      mensagemServidor = JSON.parse(bodyText).error
    } catch {
      // resposta não é JSON (ex: erro de infraestrutura) — tratado abaixo
    }

    if (res.status === 413 || bodyText.includes('Request Entity Too Large')) {
      throw new Error(
        'Os arquivos anexados são muito grandes para enviar, mesmo após compressão. ' +
        'Tente reduzir o número de comprovantes por envio ou usar arquivos menores.',
      )
    }

    throw new Error(mensagemServidor || 'Erro no upload para o Drive')
  }

  return res.json()
}
