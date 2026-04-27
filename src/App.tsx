import { useState } from 'react'
import jsPDF from 'jspdf'

// ========== TIPOS ==========
interface Solicitante {
  nome: string; cpf: string; rg: string; endereco: string
  banco: string; agencia: string; conta: string; chavePix: string; titular: string
}
interface Comprovante {
  id: string; descricao: string; valor: number; arquivo: File | null; nomeArquivo: string
}

// ========== DADOS DA DHARMA ==========
const DHARMA = {
  razaoSocial: 'DHARMA – AI S.A.',
  cnpj: '57.963.071/0001-07',
  endereco: 'Rua Prof. Pereira Reis, nº 76, Loja B, Santo Cristo, CEP 20.220-800',
  cidade: 'Rio de Janeiro, RJ',
}

// ========== VALOR POR EXTENSO ==========
function valorPorExtenso(valor: number): string {
  if (valor === 0) return 'zero reais'
  const un = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
    'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
  const dez = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
  const cen = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']
  function ate999(n: number): string {
    if (n === 0) return ''
    if (n === 100) return 'cem'
    const c = Math.floor(n / 100), d = Math.floor((n % 100) / 10), u = n % 10
    let r = ''
    if (c > 0) r += cen[c]
    if (d >= 2) { r += (r ? ' e ' : '') + dez[d]; if (u > 0) r += ' e ' + un[u] }
    else if (d === 1 || u > 0) { r += (r ? ' e ' : '') + un[d * 10 + u] }
    return r
  }
  const inteiro = Math.floor(valor)
  const centavos = Math.round((valor - inteiro) * 100)
  let r = ''
  if (inteiro > 0) {
    const milhares = Math.floor(inteiro / 1000), resto = inteiro % 1000
    if (milhares > 0) r += ate999(milhares) + ' mil'
    if (resto > 0) r += (r ? ' e ' : '') + ate999(resto)
    r += inteiro === 1 ? ' real' : ' reais'
  }
  if (centavos > 0) {
    r += (r ? ' e ' : '') + ate999(centavos) + (centavos === 1 ? ' centavo' : ' centavos')
  }
  return r.charAt(0).toUpperCase() + r.slice(1)
}

// ========== CARREGAR IMAGEM ==========
function loadImage(url: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      canvas.getContext('2d')!.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => resolve('')
    img.src = url
  })
}

// ========== GERAR PDF ==========
async function gerarPDF(sol: Solicitante, comp: Comprovante[], total: number, numeracao: string) {
  const doc = new jsPDF()
  const w = doc.internal.pageSize.getWidth()
  let y = 15

  // Logo à esquerda + dados da empresa centralizados
  const logoData = await loadImage('/dharma-logo.png')
  if (logoData) {
    doc.addImage(logoData, 'PNG', 20, y, 22, 22)
  }

  doc.setFontSize(14); doc.setFont('helvetica', 'bold')
  doc.text(DHARMA.razaoSocial, w / 2, y + 6, { align: 'center' })
  doc.setFontSize(8); doc.setFont('helvetica', 'normal')
  doc.text(`CNPJ: ${DHARMA.cnpj}`, w / 2, y + 12, { align: 'center' })
  doc.text(DHARMA.endereco, w / 2, y + 17, { align: 'center' })
  doc.text(DHARMA.cidade, w / 2, y + 22, { align: 'center' })

  y += 28
  doc.setLineWidth(0.5); doc.line(20, y, w - 20, y)

  y += 12; doc.setFontSize(14); doc.setFont('helvetica', 'bold')
  doc.text('NOTA DE DÉBITO', w / 2, y, { align: 'center' })

  // Solicitante
  y += 14; doc.setFontSize(11); doc.text('Solicitante', 20, y)
  y += 7; doc.setFontSize(10); doc.setFont('helvetica', 'normal')
  doc.text(`Nome: ${sol.nome}`, 20, y); y += 5
  doc.text(`CPF: ${sol.cpf}`, 20, y)
  if (sol.rg) doc.text(`RG: ${sol.rg}`, 110, y)
  y += 5
  if (sol.endereco) { doc.text(`Endereço: ${sol.endereco}`, 20, y); y += 5 }

  // Numeração / Valor / Data — simples com linha
  y += 8; doc.setLineWidth(0.3); doc.line(20, y, w - 20, y); y += 7
  const hoje = new Date()
  const dataEmissao = hoje.toLocaleDateString('pt-BR')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
  const colStart = 20, colEnd = w - 20, colSpacing = (colEnd - colStart) / 3
  const cols = [colStart + colSpacing * 0.5, colStart + colSpacing * 1.5, colStart + colSpacing * 2.5]
  doc.text('Numeração', cols[0], y, { align: 'center' }); doc.text('Valor Final', cols[1], y, { align: 'center' })
  doc.text('Data Emissão', cols[2], y, { align: 'center' }); y += 6
  doc.setFont('helvetica', 'normal')
  doc.text(numeracao, cols[0], y, { align: 'center' }); doc.text(formatarReais(total), cols[1], y, { align: 'center' })
  doc.text(dataEmissao, cols[2], y, { align: 'center' })
  y += 4; doc.line(20, y, w - 20, y)

  // Banner DETALHAMENTO
  y += 12
  doc.setFillColor(0, 0, 0); doc.rect(20, y, w - 40, 8, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(255, 255, 255)
  doc.text('DETALHAMENTO', 24, y + 5.5); doc.setTextColor(0, 0, 0)

  y += 12
  const colDesc = 20, colRef = 100, colValor = w - 20
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9)
  doc.text('Descrição', colDesc, y); doc.text('Referência', colRef, y)
  doc.text('Valor [R$]', colValor, y, { align: 'right' })
  y += 3; doc.setLineWidth(0.3); doc.line(20, y, w - 20, y); y += 6

  doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
  comp.forEach(c => {
    doc.text(c.descricao, colDesc, y)
    doc.text(c.nomeArquivo || '—', colRef, y)
    doc.text(formatarReais(c.valor).replace('R$\u00a0', ''), colValor, y, { align: 'right' })
    y += 6
  })

  y += 2; doc.setLineWidth(0.5); doc.line(20, y, w - 20, y); y += 7
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
  doc.text('VALOR DA NOTA DE DÉBITO [R$]', colDesc, y)
  doc.text(formatarReais(total), colValor, y, { align: 'right' })
  y += 10; doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
  doc.text(`Valor por extenso: ${valorPorExtenso(total)}`, 20, y)

  // Banner INFORMAÇÕES PARA DEPÓSITO
  y += 14
  doc.setFillColor(0, 0, 0); doc.rect(20, y, w - 40, 8, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(255, 255, 255)
  doc.text('INFORMAÇÕES PARA DEPÓSITO (pessoa física)', w / 2, y + 5.5, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  y += 16; doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
  doc.text(`Nome: ${sol.titular}`, w / 2, y, { align: 'center' }); y += 6
  doc.text(`Conta Banco: ${sol.banco}`, w / 2, y, { align: 'center' }); y += 6
  doc.text(`Agência ${sol.agencia}`, w / 2, y, { align: 'center' }); y += 6
  doc.text(`Conta Corr. ${sol.conta}`, w / 2, y, { align: 'center' }); y += 6
  doc.text(`CPF: ${sol.cpf}`, w / 2, y, { align: 'center' }); y += 6
  if (sol.chavePix) { doc.text(`Chave Pix: ${sol.chavePix}`, w / 2, y, { align: 'center' }); y += 6 }

  doc.save(`nota-debito-${numeracao.replace(/\//g, '-')}.pdf`)
}

// ========== ESTILOS ==========
function formatarReais(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const page: React.CSSProperties = {
  minHeight: '100vh',
  background: '#f0f2f5',
  padding: '0 20px 60px',
}
const header: React.CSSProperties = {
  padding: '32px 0 24px',
  maxWidth: 820,
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  gap: 16,
}
const logoCircle: React.CSSProperties = {
  width: 48, height: 48, borderRadius: 12,
  backgroundColor: '#1b1b1b',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#fff', fontWeight: 700, fontSize: 18,
}
const card: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: 16,
  padding: '28px 28px',
  border: '1px solid #e5e7eb',
  marginBottom: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
}
const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none',
  boxSizing: 'border-box', transition: 'border 0.2s',
  backgroundColor: '#fff', color: '#1f2937',
}
const sectionTitle: React.CSSProperties = {
  fontSize: 17, fontWeight: 700, color: '#1f2937', marginBottom: 20,
  display: 'flex', alignItems: 'center', gap: 10,
}
const sectionIcon: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 8,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 15,
}
const btnPrimary: React.CSSProperties = {
  padding: '11px 22px', borderRadius: 10, border: 'none',
  backgroundColor: '#1b1b1b', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  transition: 'background 0.2s',
}
const btnDanger: React.CSSProperties = {
  padding: '6px 14px', borderRadius: 8, border: 'none',
  backgroundColor: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 500, cursor: 'pointer',
}
const btnGerar: React.CSSProperties = {
  padding: '16px 32px', borderRadius: 14, border: 'none',
  backgroundColor: '#1b1b1b',
  color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
  width: '100%', maxWidth: 820, margin: '0 auto', display: 'block',
  boxShadow: '0 4px 14px rgba(0,0,0,0.15)', transition: 'opacity 0.2s',
}
const subHeader: React.CSSProperties = {
  fontSize: 14, fontWeight: 600, color: '#6b7280', marginTop: 24, marginBottom: 16,
  borderTop: '1px solid #f3f4f6', paddingTop: 20,
}

// ========== APP ==========
function App() {
  const [sol, setSol] = useState<Solicitante>({
    nome: '', cpf: '', rg: '', endereco: '',
    banco: '', agencia: '', conta: '', chavePix: '', titular: '',
  })
  const [comp, setComp] = useState<Comprovante[]>([])
  const [desc, setDesc] = useState('')
  const [val, setVal] = useState('')
  const [arq, setArq] = useState<File | null>(null)
  const [num, setNum] = useState('ND 001/2025')

  function hSol(campo: keyof Solicitante, v: string) { setSol({ ...sol, [campo]: v }) }

  function addComp() {
    if (!desc || !val || Number(val) <= 0) return
    setComp([...comp, { id: Date.now().toString(), descricao: desc, valor: Number(val), arquivo: arq, nomeArquivo: arq?.name || '' }])
    setDesc(''); setVal(''); setArq(null)
    const fi = document.getElementById('fi') as HTMLInputElement; if (fi) fi.value = ''
  }

  function rmComp(id: string) { setComp(comp.filter(c => c.id !== id)) }

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
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 20 }}>
            <div style={{ flex: 2, minWidth: 200 }}>
              <label style={labelStyle}>Descrição do custo *</label>
              <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ex: Reembolso de despesas com reunião comercial" style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label style={labelStyle}>Valor (R$) *</label>
              <input type="number" step="0.01" min="0" value={val} onChange={e => setVal(e.target.value)} placeholder="0,00" style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <label style={labelStyle}>Comprovante</label>
              <input id="fi" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setArq(e.target.files?.[0] || null)} style={{ fontSize: 12, color: '#64748b' }} />
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
          onClick={() => gerarPDF(sol, comp, total, num)}
          disabled={!podGerar}
          style={{ ...btnGerar, opacity: podGerar ? 1 : 0.4, cursor: podGerar ? 'pointer' : 'not-allowed' }}
        >
          Gerar nota de débito (PDF)
        </button>

        {!podGerar && (
          <p style={{ color: '#64748b', fontSize: 12, textAlign: 'center', marginTop: 10 }}>
            Preencha os dados obrigatórios (*) e adicione pelo menos um comprovante
          </p>
        )}
      </div>
    </div>
  )
}

export default App