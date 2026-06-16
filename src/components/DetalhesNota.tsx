import { card, gridStyle, labelStyle, inputStyle, sectionTitle, sectionIcon } from '../styles'
import { valorPorExtenso } from '../utils/valorPorExtenso'

interface Props {
  num: string
  total: number
  onChange: (num: string) => void
}

export function DetalhesNota({ num, total, onChange }: Props) {
  return (
    <div style={card}>
      <div style={sectionTitle}>
        <span style={{ ...sectionIcon, backgroundColor: '#f3f4f6', color: '#4b5563' }}>&#128196;</span>
        Detalhes da nota
      </div>
      <div style={gridStyle}>
        <div>
          <label style={labelStyle}>Numeração</label>
          <input type="text" value={num} onChange={e => onChange(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Valor por extenso (automático)</label>
          <div style={{ padding: '11px 14px', backgroundColor: '#f8fafc', borderRadius: 10, fontSize: 14, color: '#334155', border: '1.5px solid #e2e8f0', minHeight: 44, display: 'flex', alignItems: 'center' }}>
            {total > 0 ? valorPorExtenso(total) : '—'}
          </div>
        </div>
      </div>
    </div>
  )
}
