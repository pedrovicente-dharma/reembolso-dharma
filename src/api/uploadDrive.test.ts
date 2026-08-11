import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadDrive, compressImage } from './uploadDrive'
import type { Solicitante, Comprovante } from '../types'

const sol: Solicitante = {
  nome: 'Ana Silva', cpf: '123.456.789-00', rg: '', endereco: '',
  banco: 'Nubank', agencia: '0001', conta: '12345-6', chavePix: '', titular: 'Ana Silva',
}

const compSemArquivo: Comprovante[] = [
  { id: '1', descricao: 'Almoço', centroCusto: 'CC-01', projeto: 'Lab', valor: 50, arquivo: null, nomeArquivo: '' },
]

const mockPdf = {
  output: vi.fn().mockReturnValue('data:application/pdf;base64,PDFBASE64'),
}

beforeEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  mockPdf.output.mockReturnValue('data:application/pdf;base64,PDFBASE64')
})

class FakeImage {
  width: number
  height: number
  onload: (() => void) | null = null
  onerror: (() => void) | null = null

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }

  set src(_value: string) {
    queueMicrotask(() => this.onload?.())
  }
}

function stubImagem(width: number, height: number) {
  vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:fake'), revokeObjectURL: vi.fn() })
  vi.stubGlobal('Image', class extends FakeImage {
    constructor() {
      super(width, height)
    }
  })
}

describe('uploadDrive', () => {
  it('resolve com folderId quando fetch retorna 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ folderId: 'abc123' }),
    }))

    const result = await uploadDrive(sol, compSemArquivo, mockPdf as any, 'ND 001/2025')
    expect(result.folderId).toBe('abc123')
  })

  it('rejeita com mensagem do servidor quando fetch retorna 500 com corpo JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve(JSON.stringify({ error: 'Quota excedida' })),
    }))

    await expect(uploadDrive(sol, compSemArquivo, mockPdf as any, 'ND 001/2025'))
      .rejects.toThrow('Quota excedida')
  })

  it('rejeita com mensagem amigável quando o body excede o limite do Vercel (413)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 413,
      text: () => Promise.resolve('Request Entity Too Large'),
    }))

    await expect(uploadDrive(sol, compSemArquivo, mockPdf as any, 'ND 001/2025'))
      .rejects.toThrow('muito grandes para enviar')
  })

  it('rejeita com mensagem genérica quando o corpo de erro não é JSON nem 413', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      text: () => Promise.resolve('<html>Bad Gateway</html>'),
    }))

    await expect(uploadDrive(sol, compSemArquivo, mockPdf as any, 'ND 001/2025'))
      .rejects.toThrow('Erro no upload para o Drive')
  })

  it('payload contém só o PDF quando nenhum comprovante tem arquivo', async () => {
    let capturedBody: any
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url, opts) => {
      capturedBody = JSON.parse(opts.body)
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ folderId: 'x' }) })
    }))

    await uploadDrive(sol, compSemArquivo, mockPdf as any, 'ND 001/2025')
    expect(capturedBody.files).toHaveLength(1)
    expect(capturedBody.files[0].mimeType).toBe('application/pdf')
  })

  it('nome da pasta inclui data, nome do solicitante e numeração', async () => {
    let capturedBody: any
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url, opts) => {
      capturedBody = JSON.parse(opts.body)
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ folderId: 'x' }) })
    }))

    await uploadDrive(sol, compSemArquivo, mockPdf as any, 'ND 001/2025')
    expect(capturedBody.folderName).toMatch(/^\d{4}-\d{2}-\d{2} - Ana Silva - ND 001\/2025$/)
  })

  it('payload inclui dados para o alerta do Slack (solicitante, numeração, valor, CC e projeto)', async () => {
    let capturedBody: any
    vi.stubGlobal('fetch', vi.fn().mockImplementation((_url, opts) => {
      capturedBody = JSON.parse(opts.body)
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ folderId: 'x' }) })
    }))

    await uploadDrive(sol, compSemArquivo, mockPdf as any, 'ND 001/2025')
    expect(capturedBody.solicitante).toBe('Ana Silva')
    expect(capturedBody.numeracao).toBe('ND 001/2025')
    expect(capturedBody.valorTotal).toBe(50)
    expect(capturedBody.centroCusto).toBe('CC-01')
    expect(capturedBody.projeto).toBe('Lab')
  })
})

describe('compressImage', () => {
  it('retorna o arquivo original quando não é imagem (ex: PDF)', async () => {
    const pdfFile = new File(['conteudo'], 'comprovante.pdf', { type: 'application/pdf' })
    const result = await compressImage(pdfFile)
    expect(result).toBe(pdfFile)
  })

  it('retorna o arquivo original quando a imagem já é pequena', async () => {
    stubImagem(800, 600)
    const imgFile = new File(['conteudo'], 'foto.jpg', { type: 'image/jpeg' })

    const result = await compressImage(imgFile)
    expect(result).toBe(imgFile)
  })

  it('redimensiona e reexporta como JPEG quando a imagem excede 1600px', async () => {
    stubImagem(4000, 3000)
    const canvasCtx = { drawImage: vi.fn() }
    const blobFake = new Blob(['jpeg-comprimido'], { type: 'image/jpeg' })
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(canvasCtx as any)
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((cb: any) => cb(blobFake))

    const imgFile = new File(['conteudo-grande'], 'foto-celular.png', { type: 'image/png' })
    const result = await compressImage(imgFile)

    expect(result.type).toBe('image/jpeg')
    expect(result.name).toBe('foto-celular.jpg')
    expect(canvasCtx.drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1600, 1200)
  })
})
