import { useState } from 'react'
import type { Comprovante } from '../types'
import { ComprovanteInputSchema } from '../schemas'
import { formatarReais } from '../utils/formatarReais'
import { card, gridStyle, labelStyle, inputStyle, sectionTitle, sectionIcon, btnPrimary, btnDanger } from '../styles'

type CompErrors = Partial<{ descricao: string; centroCusto: string; projeto: string; valor: string }>

interface Props {
  comp: Comprovante[]
  onChange: (comp: Comprovante[]) => void
}

export function ComprovantesSection({ comp, onChange }: Props) {
  const [desc, setDesc] = useState('')
  const [cc, setCc] = useState('')
  const [proj, setProj] = useState('')
  const [val, setVal] = useState('')
  const [arq, setArq] = useState<File | null>(null)
  const [errors, setErrors] = useState<CompErrors>({})

  function clearError(campo: keyof CompErrors) {
    if (errors[campo]) setErrors(e => ({ ...e, [campo]: undefined }))
  }

  function addComp() {
    const result = ComprovanteInputSchema.safeParse({
      descricao: desc,
      centroCusto: cc,
      projeto: proj,
      valor: Number(val),
    })
    if (!result.success) {
      const map: CompErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof CompErrors
        if (!map[key]) map[key] = issue.message
      }
      setErrors(map)
      return
    }
    setErrors({})
    onChange([...comp, {
      id: Date.now().toString(),
      descricao: desc,
      centroCusto: cc,
      projeto: proj,
      valor: Number(val),
      arquivo: arq,
      nomeArquivo: arq?.name || '',
    }])
    setDesc(''); setCc(''); setProj(''); setVal(''); setArq(null)
    const fi = document.getElementById('fi') as HTMLInputElement
    if (fi) fi.value = ''
  }

  function rmComp(id: string) { onChange(comp.filter(c => c.id !== id)) }

  const total = comp.reduce((s, c) => s + c.valor, 0)

  return (
    <div style={card}>
      <div style={sectionTitle}>
        <span style={{ ...sectionIcon, backgroundColor: '#f3f4f6', color: '#4b5563' }}>&#128206;</span>
        Comprovantes
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12, marginBottom: 8 }}>
        <div>
          <label style={labelStyle}>Descrição do custo *</label>
          <input
            type="text" value={desc}
            onChange={e => { setDesc(e.target.value); clearError('descricao') }}
            placeholder="Ex: Reembolso de despesas com reunião comercial"
            style={{ ...inputStyle, borderColor: errors.descricao ? '#dc2626' : undefined }}
          />
          {errors.descricao && <p style={{ color: '#dc2626', fontSize: 11, margin: '4px 0 0' }}>{errors.descricao}</p>}
        </div>
        <div>
          <label style={labelStyle}>Centro de custo *</label>
          <input
            type="text" value={cc}
            onChange={e => { setCc(e.target.value); clearError('centroCusto') }}
            placeholder="Ex: CC-001"
            style={{ ...inputStyle, borderColor: errors.centroCusto ? '#dc2626' : undefined }}
          />
          {errors.centroCusto && <p style={{ color: '#dc2626', fontSize: 11, margin: '4px 0 0' }}>{errors.centroCusto}</p>}
        </div>
        <div>
          <label style={labelStyle}>Projeto *</label>
          <input
            type="text" value={proj}
            onChange={e => { setProj(e.target.value); clearError('projeto') }}
            placeholder="Ex: Dharma Labs"
            style={{ ...inputStyle, borderColor: errors.projeto ? '#dc2626' : undefined }}
          />
          {errors.projeto && <p style={{ color: '#dc2626', fontSize: 11, margin: '4px 0 0' }}>{errors.projeto}</p>}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 120 }}>
          <label style={labelStyle}>Valor (R$) *</label>
          <input
            type="number" step="0.01" min="0" value={val}
            onChange={e => { setVal(e.target.value); clearError('valor') }}
            placeholder="0,00"
            style={{ ...inputStyle, borderColor: errors.valor ? '#dc2626' : undefined }}
          />
          {errors.valor && <p style={{ color: '#dc2626', fontSize: 11, margin: '4px 0 0' }}>{errors.valor}</p>}
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
                <th style={{ padding: '10px 12px', color: '#94a3b8', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', textAlign: 'left' }}>CC / Projeto</th>
                <th style={{ padding: '10px 12px', color: '#94a3b8', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', textAlign: 'right' }}>Valor</th>
                <th style={{ padding: '10px 12px' }}></th>
              </tr>
            </thead>
            <tbody>
              {comp.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', color: '#94a3b8', fontSize: 13 }}>{i + 1}</td>
                  <td style={{ padding: '12px', color: '#334155', fontWeight: 500 }}>{c.descricao}</td>
                  <td style={{ padding: '12px', color: '#94a3b8', fontSize: 12 }}>{c.centroCusto} / {c.projeto}</td>
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
  )
}
