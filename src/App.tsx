import { useState } from 'react'
import type { Solicitante, Comprovante } from './types'
import { page, btnGerar } from './styles'
import { gerarPDF } from './pdf/gerarPDF'
import { Header } from './components/Header'
import { SolicitanteForm } from './components/SolicitanteForm'
import { ComprovantesSection } from './components/ComprovantesSection'
import { DetalhesNota } from './components/DetalhesNota'

type UploadStatus = 'idle' | 'loading' | 'success' | 'error'

function App() {
  const [sol, setSol] = useState<Solicitante>({
    nome: '', cpf: '', rg: '', endereco: '',
    banco: '', agencia: '', conta: '', chavePix: '', titular: '',
  })
  const [comp, setComp] = useState<Comprovante[]>([])
  const [num, setNum] = useState('ND 001/2025')
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle')
  const [uploadMsg, setUploadMsg] = useState('')

  const total = comp.reduce((s, c) => s + c.valor, 0)
  const podGerar = comp.length > 0
  const carregando = uploadStatus === 'loading'

  async function handleGerar() {
    setUploadStatus('loading')
    setUploadMsg('Gerando PDF...')
    try {
      const pdfDoc = await gerarPDF(sol, comp, total, num)
      const hoje = new Date()
      const data = `${String(hoje.getDate()).padStart(2, '0')}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${hoje.getFullYear()}`
      const nomeArquivo = `ND - ${data} - ${sol.nome || 'nota'}.pdf`
      pdfDoc.save(nomeArquivo)
      setUploadStatus('success')
      setUploadMsg('PDF gerado com sucesso!')
      setTimeout(() => { setUploadStatus('idle'); setUploadMsg('') }, 4000)
    } catch (err: unknown) {
      setUploadStatus('error')
      setUploadMsg(err instanceof Error ? err.message : 'Erro ao gerar o PDF')
    }
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
        <DetalhesNota num={num} total={total} onChange={setNum} />

        <button
          onClick={handleGerar}
          disabled={!podGerar || carregando}
          style={{ ...btnGerar, opacity: podGerar && !carregando ? 1 : 0.4, cursor: podGerar && !carregando ? 'pointer' : 'not-allowed' }}
        >
          {carregando ? uploadMsg : 'Gerar nota de débito (PDF)'}
        </button>

        {uploadStatus === 'success' && (
          <p style={{ color: '#16a34a', fontSize: 13, textAlign: 'center', marginTop: 10, fontWeight: 500 }}>
            ✓ {uploadMsg}
          </p>
        )}
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
