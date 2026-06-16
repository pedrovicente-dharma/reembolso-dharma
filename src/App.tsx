import { useState } from 'react'
import type { Solicitante, Comprovante } from './types'
import {
  page, header, logoCircle, card, gridStyle, labelStyle, inputStyle,
  sectionTitle, sectionIcon, btnPrimary, btnDanger, btnGerar, subHeader,
} from './styles'
import { valorPorExtenso } from './utils/valorPorExtenso'
import { formatarReais } from './utils/formatarReais'
import { gerarPDF } from './pdf/gerarPDF'

// ========== APP ==========
function App() {
  const [sol, setSol] = useState<Solicitante>({
    nome: '', cpf: '', rg: '', endereco: '',
    banco: '', agencia: '', conta: '', chavePix: '', titular: '',
  })
  
  const [comp, setComp] = useState<Comprovante[]>([])
  const [desc, setDesc] = useState('')
  const [centroCusto, setCentroCusto] = useState('')
  const [projeto, setProjeto] = useState('')
  const [val, setVal] = useState('')
  const [arq, setArq] = useState<File | null>(null)
  const [num, setNum] = useState('ND 001/2025')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [statusMsg, setStatusMsg] = useState('')

  function hSol(campo: keyof Solicitante, v: string) { setSol({ ...sol, [campo]: v }) }

  function addComp() {
    if (!desc || !centroCusto || !projeto || !val || Number(val) <= 0) return
    setComp([...comp, { id: Date.now().toString(), descricao: desc, centroCusto, projeto, valor: Number(val), arquivo: arq, nomeArquivo: arq?.name || '' }])
    setDesc(''); setCentroCusto(''); setProjeto(''); setVal(''); setArq(null)
    const fi = document.getElementById('fi') as HTMLInputElement; if (fi) fi.value = ''
  }
function rmComp(id: string) { setComp(comp.filter(c => c.id !== id)) }
  async function handleGerar() {
    setStatus('loading')
    setStatusMsg('Gerando PDF...')
    try {
      const pdfDoc = await gerarPDF(sol, comp, total, num)
      setStatusMsg('Enviando pro Drive...')
      await uploadParaDrive(sol, comp, num, pdfDoc)
      setStatus('success')
      setStatusMsg('Nota gerada e enviada pro Drive!')
      setTimeout(() => setStatus('idle'), 4000)
    } catch (err: any) {
      setStatus('error')
      setStatusMsg(err.message || 'Erro ao gerar nota')
    }
  }

  const total = comp.reduce((s, c) => s + c.valor, 0)
  const podGerar = sol.nome && sol.cpf && sol.banco && sol.agencia && sol.conta && sol.titular && comp.length > 0

  return (
    <div style={page}>
      {/* HEADER */}
      <div style={header}>
        <div style={logoCircle}>D</div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', margin: 0 }}>Nota de débito</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Sistema de reembolso — Dharma AI</p>
        </div>
      </div>

      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        {/* SOLICITANTE */}
        <div style={card}>
          <div style={sectionTitle}>
            <span style={{ ...sectionIcon, backgroundColor: '#f3f4f6', color: '#4b5563' }}>&#128100;</span>
            Dados do solicitante
          </div>
          <div style={gridStyle}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Nome completo *</label>
              <input type="text" value={sol.nome} onChange={e => hSol('nome', e.target.value)} placeholder="Ex: Gabriel Gustavo Henriques da Costa" style={inputStyle} />
            </div>
            <div><label style={labelStyle}>CPF *</label><input type="text" value={sol.cpf} onChange={e => hSol('cpf', e.target.value)} placeholder="000.000.000-00" style={inputStyle} /></div>
            <div><label style={labelStyle}>RG</label><input type="text" value={sol.rg} onChange={e => hSol('rg', e.target.value)} placeholder="00.000.000-0" style={inputStyle} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Endereço</label><input type="text" value={sol.endereco} onChange={e => hSol('endereco', e.target.value)} placeholder="Rua, número, bairro, cidade - UF" style={inputStyle} /></div>
          </div>
          <h3 style={subHeader}>Dados bancários</h3>
          <div style={gridStyle}>
            <div><label style={labelStyle}>Banco *</label><input type="text" value={sol.banco} onChange={e => hSol('banco', e.target.value)} placeholder="Ex: NU PAGAMENTOS S.A (260)" style={inputStyle} /></div>
            <div><label style={labelStyle}>Agência *</label><input type="text" value={sol.agencia} onChange={e => hSol('agencia', e.target.value)} placeholder="0001" style={inputStyle} /></div>
            <div><label style={labelStyle}>Conta *</label><input type="text" value={sol.conta} onChange={e => hSol('conta', e.target.value)} placeholder="0000000-0" style={inputStyle} /></div>
            <div><label style={labelStyle}>Chave Pix</label><input type="text" value={sol.chavePix} onChange={e => hSol('chavePix', e.target.value)} placeholder="CPF, e-mail ou telefone" style={inputStyle} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>Titular da conta *</label><input type="text" value={sol.titular} onChange={e => hSol('titular', e.target.value)} placeholder="Nome completo do titular" style={inputStyle} /></div>
          </div>
        </div>

        {/* COMPROVANTES */}
        <div style={card}>
          <div style={sectionTitle}>
            <span style={{ ...sectionIcon, backgroundColor: '#f3f4f6', color: '#4b5563' }}>&#128206;</span>
            Comprovantes
          </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>Descrição do produto *</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Almoço com cliente" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Centro de Custo *</label>
            <input type="text" value={centroCusto} onChange={e => setCentroCusto(e.target.value)} placeholder="Ex: Marketing" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Projeto *</label>
            <input type="text" value={projeto} onChange={e => setProjeto(e.target.value)} placeholder="Ex: Campanha Q1" style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{ flex: 1, minWidth: 120 }}>
            <label style={labelStyle}>Valor (R$) *</label>
            <input type="number" step="0.01" min="0" value={val} onChange={e => setVal(e.target.value)} placeholder="0,00" style={inputStyle} />
          </div>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={labelStyle}>Comprovante</label>
            <input id="fi" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setArq(e.target.files?.[0] || null)} style={{ fontSize: 12, color: '#9ca3af' }} />
          </div>
          <button onClick={addComp} style={btnPrimary}>+ Adicionar</button>
        </div>
          {comp.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 20px', backgroundColor: '#f8fafc', borderRadius: 12, border: '2px dashed #e2e8f0' }}>
              <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>Nenhum comprovante adicionado ainda</p>
              <p style={{ color: '#cbd5e1', fontSize: 12, margin: '4px 0 0' }}>Preencha os campos acima e clique em "+ Adicionar"</p>
            </div>
          ) : (
            <div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                    <th style={{ padding: '10px 12px', color: '#94a3b8', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', textAlign: 'left' }}>#</th>
                    <th style={{ padding: '10px 12px', color: '#94a3b8', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', textAlign: 'left' }}>Descrição</th>
                    <th style={{ padding: '10px 12px', color: '#94a3b8', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', textAlign: 'left' }}>Arquivo</th>
                    <th style={{ padding: '10px 12px', color: '#94a3b8', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', textAlign: 'right' }}>Valor</th>
                    <th style={{ padding: '10px 12px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {comp.map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', color: '#94a3b8', fontSize: 13 }}>{i + 1}</td>
                      <td style={{ padding: '12px', color: '#334155', fontWeight: 500 }}>{c.descricao}</td>
                      <td style={{ padding: '12px', color: '#94a3b8', fontSize: 12 }}>{c.nomeArquivo || '—'}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>{formatarReais(c.valor)}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button onClick={() => rmComp(c.id)} style={btnDanger}>Remover</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '16px 12px', borderTop: '2px solid #1e293b', marginTop: 4, gap: 12 }}>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>{formatarReais(total)}</span>
              </div>
            </div>
          )}
        </div>

        {/* DETALHES DA NOTA */}
        <div style={card}>
          <div style={sectionTitle}>
            <span style={{ ...sectionIcon, backgroundColor: '#f3f4f6', color: '#4b5563' }}>&#128196;</span>
            Detalhes da nota
          </div>
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Numeração</label>
              <input type="text" value={num} onChange={e => setNum(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Valor por extenso (automático)</label>
              <div style={{ padding: '11px 14px', backgroundColor: '#f8fafc', borderRadius: 10, fontSize: 14, color: '#334155', border: '1.5px solid #e2e8f0', minHeight: 44, display: 'flex', alignItems: 'center' }}>
                {total > 0 ? valorPorExtenso(total) : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* BOTÃO GERAR */}
        <button
          onClick={handleGerar}
          disabled={!podGerar || status === 'loading'}
          style={{ ...btnGerar, opacity: podGerar && status !== 'loading' ? 1 : 0.4, cursor: podGerar && status !== 'loading' ? 'pointer' : 'not-allowed' }}
        >
          {status === 'loading' ? statusMsg : 'Gerar nota de débito (PDF + Drive)'}
        </button>

        {status === 'success' && (
          <p style={{ color: '#16a34a', fontSize: 13, textAlign: 'center', marginTop: 10, fontWeight: 500 }}>
            ✓ {statusMsg}
          </p>
        )}
        {status === 'error' && (
          <p style={{ color: '#dc2626', fontSize: 13, textAlign: 'center', marginTop: 10, fontWeight: 500 }}>
            ✗ {statusMsg}
          </p>
        )}

        {!podGerar && status === 'idle' && (
          <p style={{ color: '#64748b', fontSize: 12, textAlign: 'center', marginTop: 10 }}>
            Preencha os dados obrigatórios (*) e adicione pelo menos um comprovante
          </p>
        )}
      </div>
    </div>
  )
}

export default App

