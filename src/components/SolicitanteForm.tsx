import { useState, forwardRef, useImperativeHandle } from 'react'
import type { Solicitante } from '../types'
import { SolicitanteSchema } from '../schemas'
import { card, gridStyle, labelStyle, inputStyle, sectionTitle, sectionIcon, subHeader } from '../styles'

type Errors = Partial<Record<keyof Solicitante, string>>

export interface SolicitanteFormHandle {
  validate: () => boolean
}

interface Props {
  sol: Solicitante
  onChange: (sol: Solicitante) => void
  onValidSubmit: (sol: Solicitante) => void
  submitLabel?: string
}

export const SolicitanteForm = forwardRef<SolicitanteFormHandle, Props>(
  function SolicitanteForm({ sol, onChange, onValidSubmit, submitLabel }, ref) {
    const [errors, setErrors] = useState<Errors>({})

    function set(campo: keyof Solicitante, v: string) {
      onChange({ ...sol, [campo]: v })
      if (errors[campo]) setErrors(e => ({ ...e, [campo]: undefined }))
    }

    function validate(): boolean {
      const result = SolicitanteSchema.safeParse(sol)
      if (result.success) { setErrors({}); return true }
      const map: Errors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Solicitante
        if (!map[key]) map[key] = issue.message
      }
      setErrors(map)
      return false
    }

    useImperativeHandle(ref, () => ({ validate }))

    if (submitLabel) {
      return (
        <div style={card}>
          <Fields sol={sol} errors={errors} set={set} />
          <button onClick={() => validate() && onValidSubmit(sol)} style={{ marginTop: 16 }}>
            {submitLabel}
          </button>
        </div>
      )
    }

    return (
      <div style={card} data-testid="solicitante-form">
        <Fields sol={sol} errors={errors} set={set} onBlurValidate={validate} />
      </div>
    )
  }
)

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p style={{ color: '#dc2626', fontSize: 11, margin: '4px 0 0' }}>{msg}</p>
}

interface FieldsProps {
  sol: Solicitante
  errors: Errors
  set: (campo: keyof Solicitante, v: string) => void
  onBlurValidate?: () => void
}

function Fields({ sol, errors, set }: FieldsProps) {
  return (
    <>
      <div style={sectionTitle}>
        <span style={{ ...sectionIcon, backgroundColor: '#f3f4f6', color: '#4b5563' }}>&#128100;</span>
        Dados do solicitante
      </div>
      <div style={gridStyle}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Nome completo *</label>
          <input
            type="text" value={sol.nome}
            onChange={e => set('nome', e.target.value)}
            placeholder="Ex: Gabriel Gustavo Henriques da Costa"
            style={{ ...inputStyle, borderColor: errors.nome ? '#dc2626' : undefined }}
          />
          <ErrorMsg msg={errors.nome} />
        </div>
        <div>
          <label style={labelStyle}>CPF *</label>
          <input
            type="text" value={sol.cpf}
            onChange={e => set('cpf', e.target.value)}
            placeholder="000.000.000-00"
            style={{ ...inputStyle, borderColor: errors.cpf ? '#dc2626' : undefined }}
          />
          <ErrorMsg msg={errors.cpf} />
        </div>
        <div>
          <label style={labelStyle}>RG</label>
          <input type="text" value={sol.rg} onChange={e => set('rg', e.target.value)} placeholder="00.000.000-0" style={inputStyle} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Endereço</label>
          <input type="text" value={sol.endereco} onChange={e => set('endereco', e.target.value)} placeholder="Rua, número, bairro, cidade - UF" style={inputStyle} />
        </div>
      </div>
      <h3 style={subHeader}>Dados bancários</h3>
      <div style={gridStyle}>
        <div>
          <label style={labelStyle}>Banco *</label>
          <input
            type="text" value={sol.banco}
            onChange={e => set('banco', e.target.value)}
            placeholder="Ex: NU PAGAMENTOS S.A (260)"
            style={{ ...inputStyle, borderColor: errors.banco ? '#dc2626' : undefined }}
          />
          <ErrorMsg msg={errors.banco} />
        </div>
        <div>
          <label style={labelStyle}>Agência *</label>
          <input
            type="text" value={sol.agencia}
            onChange={e => set('agencia', e.target.value)}
            placeholder="0001"
            style={{ ...inputStyle, borderColor: errors.agencia ? '#dc2626' : undefined }}
          />
          <ErrorMsg msg={errors.agencia} />
        </div>
        <div>
          <label style={labelStyle}>Conta *</label>
          <input
            type="text" value={sol.conta}
            onChange={e => set('conta', e.target.value)}
            placeholder="0000000-0"
            style={{ ...inputStyle, borderColor: errors.conta ? '#dc2626' : undefined }}
          />
          <ErrorMsg msg={errors.conta} />
        </div>
        <div>
          <label style={labelStyle}>Chave Pix</label>
          <input type="text" value={sol.chavePix} onChange={e => set('chavePix', e.target.value)} placeholder="CPF, e-mail ou telefone" style={inputStyle} />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Titular da conta *</label>
          <input
            type="text" value={sol.titular}
            onChange={e => set('titular', e.target.value)}
            placeholder="Nome completo do titular"
            style={{ ...inputStyle, borderColor: errors.titular ? '#dc2626' : undefined }}
          />
          <ErrorMsg msg={errors.titular} />
        </div>
      </div>
    </>
  )
}
