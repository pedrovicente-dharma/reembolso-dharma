import { card, btnPrimary } from '../styles'
import { formatarReais } from '../utils/formatarReais'

interface Props {
  numeracao: string
  total: number
  onNovo: () => void
}

export function SucessoReembolso({ numeracao, total, onNovo }: Props) {
  return (
    <div style={{ ...card, textAlign: 'center', padding: '48px 28px' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
        backgroundColor: '#dcfce7', color: '#16a34a',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700,
      }}>
        ✓
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', margin: '0 0 12px' }}>
        Reembolso solicitado!
      </h2>
      <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6, maxWidth: 480, margin: '0 auto 8px' }}>
        Sua nota de débito <strong>{numeracao}</strong> no valor de <strong>{formatarReais(total)}</strong> foi
        gerada e enviada para o time responsável, junto com os comprovantes.
      </p>
      <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6, maxWidth: 480, margin: '0 auto 28px' }}>
        Você não precisa fazer mais nada por aqui. O pagamento será feito na conta informada no formulário.
      </p>
      <button onClick={onNovo} style={btnPrimary}>
        Solicitar novo reembolso
      </button>
    </div>
  )
}
