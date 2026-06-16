import { header, logoCircle } from '../styles'

export function Header() {
  return (
    <div style={header}>
      <div style={logoCircle}>D</div>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1f2937', margin: 0 }}>Nota de débito</h1>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Sistema de reembolso — Dharma AI</p>
      </div>
    </div>
  )
}
