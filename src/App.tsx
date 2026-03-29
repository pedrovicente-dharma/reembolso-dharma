import { useState } from 'react'

// ========== TIPOS ==========
interface Solicitante {
  nome: string
  cpf: string
  rg: string
  endereco: string
  banco: string
  agencia: string
  conta: string
  chavePix: string
  titular: string
}

interface Comprovante {
  id: string
  descricao: string
  valor: number
  arquivo: File | null
  nomeArquivo: string
}

// ========== ESTILOS ==========
const containerStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: 12,
  padding: '28px 24px',
  border: '1px solid #e0e0e0',
  marginBottom: 24,
}
const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
}
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: '#555',
  marginBottom: 6,
}
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1.5px solid #ddd',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
}
const btnPrimary: React.CSSProperties = {
  padding: '10px 20px',
  borderRadius: 8,
  border: 'none',
  backgroundColor: '#1a1a1a',
  color: '#fff',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
}
const btnDanger: React.CSSProperties = {
  padding: '6px 12px',
  borderRadius: 6,
  border: 'none',
  backgroundColor: '#fee2e2',
  color: '#991b1b',
  fontSize: 12,
  cursor: 'pointer',
}

// ========== FORMATAR MOEDA ==========
function formatarReais(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ========== APP ==========
function App() {
  // Estado do solicitante
  const [solicitante, setSolicitante] = useState<Solicitante>({
    nome: '', cpf: '', rg: '', endereco: '',
    banco: '', agencia: '', conta: '', chavePix: '', titular: '',
  })

  // Estado dos comprovantes
  const [comprovantes, setComprovantes] = useState<Comprovante[]>([])

  // Estado do formulário de novo comprovante
  const [novoDescricao, setNovoDescricao] = useState('')
  const [novoValor, setNovoValor] = useState('')
  const [novoArquivo, setNovoArquivo] = useState<File | null>(null)

  // Funções
  function handleSolicitante(campo: keyof Solicitante, valor: string) {
    setSolicitante({ ...solicitante, [campo]: valor })
  }

  function adicionarComprovante() {
    if (!novoDescricao || !novoValor || Number(novoValor) <= 0) return

    const novo: Comprovante = {
      id: Date.now().toString(),
      descricao: novoDescricao,
      valor: Number(novoValor),
      arquivo: novoArquivo,
      nomeArquivo: novoArquivo ? novoArquivo.name : '',
    }

    setComprovantes([...comprovantes, novo])
    setNovoDescricao('')
    setNovoValor('')
    setNovoArquivo(null)

    // Limpa o input de arquivo
    const fileInput = document.getElementById('file-input') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  function removerComprovante(id: string) {
    setComprovantes(comprovantes.filter(c => c.id !== id))
  }

  const total = comprovantes.reduce((soma, c) => soma + c.valor, 0)

  // ========== RENDER ==========
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Nota de débito</h1>
      <p style={{ color: '#666', marginBottom: 32, fontSize: 14 }}>
        Preencha os dados para gerar a nota de débito da Dharma
      </p>

      {/* ===== DADOS DO SOLICITANTE ===== */}
      <div style={containerStyle}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Dados do solicitante</h2>
        <div style={gridStyle}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Nome completo *</label>
            <input type="text" value={solicitante.nome} onChange={e => handleSolicitante('nome', e.target.value)} placeholder="Ex: Gabriel Gustavo Henriques da Costa" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>CPF *</label>
            <input type="text" value={solicitante.cpf} onChange={e => handleSolicitante('cpf', e.target.value)} placeholder="000.000.000-00" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>RG</label>
            <input type="text" value={solicitante.rg} onChange={e => handleSolicitante('rg', e.target.value)} placeholder="00.000.000-0" style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Endereço</label>
            <input type="text" value={solicitante.endereco} onChange={e => handleSolicitante('endereco', e.target.value)} placeholder="Rua, número, bairro, cidade - UF" style={inputStyle} />
          </div>
        </div>

        <h3 style={{ fontSize: 15, fontWeight: 600, marginTop: 24, marginBottom: 16, color: '#444', borderTop: '1px solid #eee', paddingTop: 20 }}>Dados bancários</h3>
        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>Banco *</label>
            <input type="text" value={solicitante.banco} onChange={e => handleSolicitante('banco', e.target.value)} placeholder="Ex: NU PAGAMENTOS S.A (260)" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Agência *</label>
            <input type="text" value={solicitante.agencia} onChange={e => handleSolicitante('agencia', e.target.value)} placeholder="0001" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Conta *</label>
            <input type="text" value={solicitante.conta} onChange={e => handleSolicitante('conta', e.target.value)} placeholder="0000000-0" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Chave Pix *</label>
            <input type="text" value={solicitante.chavePix} onChange={e => handleSolicitante('chavePix', e.target.value)} placeholder="CPF, e-mail ou telefone" style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Titular da conta *</label>
            <input type="text" value={solicitante.titular} onChange={e => handleSolicitante('titular', e.target.value)} placeholder="Nome completo do titular" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* ===== COMPROVANTES ===== */}
      <div style={containerStyle}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>Comprovantes</h2>

        {/* Formulário para adicionar */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{ flex: 2, minWidth: 200 }}>
            <label style={labelStyle}>Descrição do custo *</label>
            <input type="text" value={novoDescricao} onChange={e => setNovoDescricao(e.target.value)} placeholder="Ex: Reembolso de despesas com reunião comercial" style={inputStyle} />
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <label style={labelStyle}>Valor (R$) *</label>
            <input type="number" step="0.01" min="0" value={novoValor} onChange={e => setNovoValor(e.target.value)} placeholder="0,00" style={inputStyle} />
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={labelStyle}>Comprovante</label>
            <input id="file-input" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setNovoArquivo(e.target.files?.[0] || null)} style={{ fontSize: 13 }} />
          </div>
          <button onClick={adicionarComprovante} style={btnPrimary}>+ Adicionar</button>
        </div>

        {/* Lista de comprovantes */}
        {comprovantes.length === 0 ? (
          <p style={{ color: '#999', fontSize: 14, textAlign: 'center', padding: 20 }}>
            Nenhum comprovante adicionado ainda.
          </p>
        ) : (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', color: '#555', fontWeight: 500 }}>#</th>
                  <th style={{ padding: '8px 12px', color: '#555', fontWeight: 500 }}>Descrição</th>
                  <th style={{ padding: '8px 12px', color: '#555', fontWeight: 500 }}>Arquivo</th>
                  <th style={{ padding: '8px 12px', color: '#555', fontWeight: 500, textAlign: 'right' }}>Valor</th>
                  <th style={{ padding: '8px 12px' }}></th>
                </tr>
              </thead>
              <tbody>
                {comprovantes.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '10px 12px', color: '#999' }}>{i + 1}</td>
                    <td style={{ padding: '10px 12px' }}>{c.descricao}</td>
                    <td style={{ padding: '10px 12px', color: '#888', fontSize: 12 }}>{c.nomeArquivo || '—'}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 500 }}>{formatarReais(c.valor)}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <button onClick={() => removerComprovante(c.id)} style={btnDanger}>Remover</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 12px', borderTop: '2px solid #1a1a1a', marginTop: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>Total: {formatarReais(total)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App