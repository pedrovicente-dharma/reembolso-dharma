import { useState } from 'react'
import type { Solicitante, Comprovante } from './types'
import { page, btnGerar } from './styles'
import { gerarPDF } from './pdf/gerarPDF'
import { uploadDrive } from './api/uploadDrive'
import { gerarNumeracao } from './utils/gerarNumeracao'
import { Header } from './components/Header'
import { SolicitanteForm } from './components/SolicitanteForm'
import { ComprovantesSection } from './components/ComprovantesSection'
import { SucessoReembolso } from './components/SucessoReembolso'

type UploadStatus = 'idle' | 'loading' | 'success' | 'error'

const SOLICITANTE_VAZIO: Solicitante = {
  nome: '', cpf: '',
  banco: '', agencia: '', conta: '', chavePix: '', titular: '',
}

function App() {
  const [sol, setSol] = useState<Solicitante>(SOLICITANTE_VAZIO)
  const [comp, setComp] = useState<Comprovante[]>([])
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [uploadMsg, setUploadMsg] = useState('')
  const [enviado, setEnviado] = useState<{ numeracao: string; total: number } | null>(null)

  const total = comp.reduce((s, c) => s + c.valor, 0)
  const podGerar = comp.length > 0
  const carregando = uploadStatus === 'loading'

  async function handleGerar() {
    setUploadStatus('loading')
    setUploadMsg('Gerando PDF...')
    try {
      const hoje = new Date()
      const data = `${String(hoje.getDate()).padStart(2, '0')}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${hoje.getFullYear()}`
      const numeracao = gerarNumeracao(comp, data)
      const pdfDoc = await gerarPDF(sol, comp, total, numeracao)

      setUploadMsg('Enviando para o Drive...')
      await uploadDrive(sol, comp, pdfDoc, numeracao)

      setEnviado({ numeracao, total })
      setUploadStatus('success')
      setUploadMsg('')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) {
      setUploadStatus('error')
      setUploadMsg(err instanceof Error ? err.message : 'Erro ao gerar o PDF')
    }
  }

  function handleNovo() {
    setSol(SOLICITANTE_VAZIO)
    setComp([])
    setEnviado(null)
    setUploadStatus('idle')
  }

  if (enviado) {
    return (
      <div style={page}>
        <Header />
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <SucessoReembolso numeracao={enviado.numeracao} total={enviado.total} onNovo={handleNovo} />
        </div>
      </div>
    )
  }

  return (
    <div style={page}>
      <Header />
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <SolicitanteForm
          sol={sol}
          onChange={setSol}
          onValidSubmit={handleGerar}
        />
        <ComprovantesSection comp={comp} onChange={setComp} />

        <button
          onClick={handleGerar}
          disabled={!podGerar || carregando}
          style={{ ...btnGerar, opacity: podGerar && !carregando ? 1 : 0.4, cursor: podGerar && !carregando ? 'pointer' : 'not-allowed' }}
        >
          {carregando ? uploadMsg : 'Gerar nota de débito (PDF)'}
        </button>

        {uploadStatus === 'error' && (
          <p style={{ color: '#dc2626', fontSize: 13, textAlign: 'center', marginTop: 10, fontWeight: 500 }}>
            ✗ {uploadMsg}
          </p>
        )}
        {!podGerar && uploadStatus === 'idle' && (
          <p style={{ color: '#64748b', fontSize: 12, textAlign: 'center', marginTop: 10 }}>
            Adicione pelo menos um comprovante para gerar a nota
          </p>
        )}
      </div>
    </div>
  )
}

export default App
