// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const filesCreate = vi.fn()
vi.mock('googleapis', () => ({
  google: {
    auth: { OAuth2: vi.fn(function () { this.setCredentials = vi.fn() }) },
    drive: vi.fn(() => ({ files: { create: filesCreate } })),
  },
}))

const { default: handler } = await import('./upload.js')
const { validarUpload, escaparSlack, MAX_ARQUIVOS } = await import('./_validateUpload.js')

const b64 = (bytes) => Buffer.from(bytes).toString('base64')
const PDF = b64([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31])
const PNG = b64([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a])
const JPEG = b64([0xff, 0xd8, 0xff, 0xe0, 0x00])

function corpoValido(extra = {}) {
  return {
    folderName: '2026-09-30 - Ana Silva - ND - 30-09-2026 - Uber',
    files: [
      { name: 'ND.pdf', mimeType: 'application/pdf', data: PDF },
      { name: 'recibo.jpg', mimeType: 'image/jpeg', data: JPEG },
    ],
    solicitante: 'Ana Silva',
    numeracao: 'ND - 30-09-2026 - Uber',
    valorTotal: 50,
    centroCusto: 'AI Lab',
    projeto: 'BID - Reforma Tributária',
    ...extra,
  }
}

function mockRes() {
  const res = { statusCode: 0, body: undefined }
  res.status = vi.fn((code) => { res.statusCode = code; return res })
  res.json = vi.fn((body) => { res.body = body; return res })
  return res
}

async function chamar(body, method = 'POST') {
  const res = mockRes()
  await handler({ method, body }, res)
  return res
}

const ENV = {
  GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 'secret',
  GOOGLE_REFRESH_TOKEN: 'token', DRIVE_FOLDER_ID: 'root-folder',
}

describe('validarUpload', () => {
  it('aceita um corpo válido e decodifica os arquivos', () => {
    const r = validarUpload(corpoValido())
    expect(r.ok).toBe(true)
    expect(r.data.files[0].buffer.subarray(0, 4).toString()).toBe('%PDF')
  })

  it('rejeita corpo ausente ou sem arquivos', () => {
    expect(validarUpload(undefined).ok).toBe(false)
    expect(validarUpload(corpoValido({ files: [] })).ok).toBe(false)
  })

  it('rejeita tipo de arquivo não permitido', () => {
    const r = validarUpload(corpoValido({ files: [{ name: 'x.exe', mimeType: 'application/x-msdownload', data: PDF }] }))
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/mimeType/)
  })

  it('rejeita arquivo cujo conteúdo não bate com o mimeType declarado', () => {
    const r = validarUpload(corpoValido({
      files: [
        { name: 'ND.pdf', mimeType: 'application/pdf', data: PDF },
        { name: 'falso.png', mimeType: 'image/png', data: PDF },
      ],
    }))
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/falso\.png.*image\/png/)
  })

  it('exige o PDF da nota no envio', () => {
    const r = validarUpload(corpoValido({ files: [{ name: 'a.png', mimeType: 'image/png', data: PNG }] }))
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/PDF da nota/)
  })

  it('rejeita base64 inválido', () => {
    const r = validarUpload(corpoValido({ files: [{ name: 'ND.pdf', mimeType: 'application/pdf', data: 'não é base64!' }] }))
    expect(r.ok).toBe(false)
  })

  it('rejeita mais arquivos que o limite', () => {
    const files = Array.from({ length: MAX_ARQUIVOS + 1 }, (_, i) => ({ name: `${i}.pdf`, mimeType: 'application/pdf', data: PDF }))
    expect(validarUpload(corpoValido({ files })).ok).toBe(false)
  })

  it('rejeita envio acima do tamanho total', () => {
    const grande = Buffer.alloc(4 * 1024 * 1024 + 1)
    grande.set([0x25, 0x50, 0x44, 0x46])
    const r = validarUpload(corpoValido({ files: [{ name: 'ND.pdf', mimeType: 'application/pdf', data: grande.toString('base64') }] }))
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/tamanho máximo/)
  })

  it('remove barras e caracteres de controle dos nomes', () => {
    const r = validarUpload(corpoValido({ folderName: '../pasta/\u0000x' }))
    expect(r.data.folderName).toBe('..pastax')
  })

  it('rejeita nome que fica vazio após sanitização', () => {
    expect(validarUpload(corpoValido({ folderName: '///' })).ok).toBe(false)
  })

  it('rejeita valorTotal negativo ou não numérico', () => {
    expect(validarUpload(corpoValido({ valorTotal: -1 })).ok).toBe(false)
    expect(validarUpload(corpoValido({ valorTotal: '50' })).ok).toBe(false)
  })
})

describe('escaparSlack', () => {
  it('escapa &, < e > para não injetar links ou menções', () => {
    expect(escaparSlack('<https://evil.com|Clique> & <!channel>'))
      .toBe('&lt;https://evil.com|Clique&gt; &amp; &lt;!channel&gt;')
  })
})

describe('POST /api/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    for (const [k, v] of Object.entries(ENV)) vi.stubEnv(k, v)
    vi.stubEnv('SLACK_WEBHOOK_URL', '')
    filesCreate.mockResolvedValue({ data: { id: 'nova-pasta' } })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('retorna 405 para métodos diferentes de POST', async () => {
    expect((await chamar(undefined, 'GET')).statusCode).toBe(405)
  })

  it('retorna 500 com mensagem clara quando falta variável de ambiente', async () => {
    vi.stubEnv('GOOGLE_REFRESH_TOKEN', '')
    const res = await chamar(corpoValido())
    expect(res.statusCode).toBe(500)
    expect(res.body.error).toMatch(/configuração do Google Drive/)
    expect(filesCreate).not.toHaveBeenCalled()
  })

  it('retorna 400 e não toca no Drive quando o corpo é inválido', async () => {
    const res = await chamar(corpoValido({ files: [{ name: 'x', mimeType: 'text/html', data: PDF }] }))
    expect(res.statusCode).toBe(400)
    expect(filesCreate).not.toHaveBeenCalled()
  })

  it('cria a pasta e envia cada arquivo quando o corpo é válido', async () => {
    const res = await chamar(corpoValido())
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ success: true, folderId: 'nova-pasta' })
    expect(filesCreate).toHaveBeenCalledTimes(3)
    expect(filesCreate.mock.calls[0][0].requestBody.parents).toEqual(['root-folder'])
    expect(filesCreate.mock.calls[1][0].requestBody).toEqual({ name: 'ND.pdf', parents: ['nova-pasta'] })
  })

  it('escapa os campos do usuário no alerta do Slack', async () => {
    vi.stubEnv('SLACK_WEBHOOK_URL', 'https://hooks.slack.test/x')
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    await chamar(corpoValido({ solicitante: '<https://evil.com|Ana>' }))

    const texto = JSON.parse(fetchMock.mock.calls[0][1].body).blocks[0].text.text
    expect(texto).toContain('*Solicitante:* &lt;https://evil.com|Ana&gt;')
    expect(texto).toContain('<https://drive.google.com/drive/folders/nova-pasta|Abrir pasta>')
  })

  it('retorna 500 com a mensagem do erro quando o Drive falha', async () => {
    filesCreate.mockRejectedValueOnce(new Error('invalid_grant'))
    const res = await chamar(corpoValido())
    expect(res.statusCode).toBe(500)
    expect(res.body.error).toBe('invalid_grant')
  })
})
