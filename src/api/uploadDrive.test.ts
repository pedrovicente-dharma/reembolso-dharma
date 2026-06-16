import { describe, it, expect, vi, beforeEach } from 'vitest'
import { uploadDrive } from './uploadDrive'
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
  mockPdf.output.mockReturnValue('data:application/pdf;base64,PDFBASE64')
})

describe('uploadDrive', () => {
  it('resolve com folderId quando fetch retorna 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ folderId: 'abc123' }),
    }))

    const result = await uploadDrive(sol, compSemArquivo, mockPdf as any, 'ND 001/2025')
    expect(result.folderId).toBe('abc123')
  })

  it('rejeita com mensagem do servidor quando fetch retorna 500', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Quota excedida' }),
    }))

    await expect(uploadDrive(sol, compSemArquivo, mockPdf as any, 'ND 001/2025'))
      .rejects.toThrow('Quota excedida')
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
})
