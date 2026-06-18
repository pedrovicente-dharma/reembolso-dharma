import type jsPDF from 'jspdf'
import type { Solicitante, Comprovante } from '../types'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
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
      const data = await fileToBase64(c.arquivo)
      files.push({ name: c.arquivo.name, mimeType: c.arquivo.type, data })
    }
  }

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ folderName, files }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Erro no upload para o Drive')
  }

  return res.json()
}
