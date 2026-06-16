import type { CSSProperties } from 'react'

export const page: CSSProperties = {
  minHeight: '100vh',
  background: '#f0f2f5',
  padding: '0 20px 60px',
}

export const header: CSSProperties = {
  padding: '32px 0 24px',
  maxWidth: 820,
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  gap: 16,
}

export const logoCircle: CSSProperties = {
  width: 48, height: 48, borderRadius: 12,
  backgroundColor: '#1b1b1b',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#fff', fontWeight: 700, fontSize: 18,
}

export const card: CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: 16,
  padding: '28px 28px',
  border: '1px solid #e5e7eb',
  marginBottom: 20,
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
}

export const gridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }

export const labelStyle: CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#6b7280',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
}

export const inputStyle: CSSProperties = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none',
  boxSizing: 'border-box', transition: 'border 0.2s',
  backgroundColor: '#fff', color: '#1f2937',
}

export const sectionTitle: CSSProperties = {
  fontSize: 17, fontWeight: 700, color: '#1f2937', marginBottom: 20,
  display: 'flex', alignItems: 'center', gap: 10,
}

export const sectionIcon: CSSProperties = {
  width: 32, height: 32, borderRadius: 8,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 15,
}

export const btnPrimary: CSSProperties = {
  padding: '11px 22px', borderRadius: 10, border: 'none',
  backgroundColor: '#1b1b1b', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
  transition: 'background 0.2s',
}

export const btnDanger: CSSProperties = {
  padding: '6px 14px', borderRadius: 8, border: 'none',
  backgroundColor: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 500, cursor: 'pointer',
}

export const btnGerar: CSSProperties = {
  padding: '16px 32px', borderRadius: 14, border: 'none',
  backgroundColor: '#1b1b1b',
  color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
  width: '100%', maxWidth: 820, margin: '0 auto', display: 'block',
  boxShadow: '0 4px 14px rgba(0,0,0,0.15)', transition: 'opacity 0.2s',
}

export const subHeader: CSSProperties = {
  fontSize: 14, fontWeight: 600, color: '#6b7280', marginTop: 24, marginBottom: 16,
  borderTop: '1px solid #f3f4f6', paddingTop: 20,
}
