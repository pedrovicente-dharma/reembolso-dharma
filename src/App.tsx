import { useState } from 'react'
import type { Solicitante, Comprovante } from './types'
import { page, btnGerar } from './styles'
import { gerarPDF } from './pdf/gerarPDF'
import { Header } from './components/Header'
import { SolicitanteForm } from './components/SolicitanteForm'
import { ComprovantesSection } from './components/ComprovantesSection'
import { DetalhesNota } from './components/DetalhesNota'

function App() {
  const [sol, setSol] = useState<Solicitante>({
    nome: '', cpf: '', rg: '', endereco: '',
    banco: '', agencia: '', conta: '', chavePix: '', titular: '',
  })
  const [comp, setComp] = useState<Comprovante[]>([])
  const [num, setNum] = useState('ND 001/2025')

  const total = comp.reduce((s, c) => s + c.valor, 0)
  const podGerar = comp.length > 0

  return (
    <div style={page}>
      <Header />
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <SolicitanteForm
          sol={sol}
          onChange={setSol}
          onValidSubmit={() => gerarPDF(sol, comp, total, num)}
        />
        <ComprovantesSection comp={comp} onChange={setComp} />
        <DetalhesNota num={num} total={total} onChange={setNum} />

        <button
          onClick={() => gerarPDF(sol, comp, total, num)}
          disabled={!podGerar}
          style={{ ...btnGerar, opacity: podGerar ? 1 : 0.4, cursor: podGerar ? 'pointer' : 'not-allowed' }}
        >
          Gerar nota de débito (PDF)
        </button>

        {!podGerar && (
          <p style={{ color: '#64748b', fontSize: 12, textAlign: 'center', marginTop: 10 }}>
            Adicione pelo menos um comprovante para gerar a nota
          </p>
        )}
      </div>
    </div>
  )
}

export default App
