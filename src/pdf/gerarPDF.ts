import jsPDF from 'jspdf'
import type { Solicitante, Comprovante } from '../types'
import { DHARMA } from '../constants'
import { valorPorExtenso } from '../utils/valorPorExtenso'
import { formatarReais } from '../utils/formatarReais'
import { loadImage } from '../utils/loadImage'

const MARGIN = 20
const PAGE_BOTTOM = 268
const LINE_H = 6
const BRAND = { r: 15, g: 23, b: 42 } // dark navy

export async function gerarPDF(
  sol: Solicitante,
  comp: Comprovante[],
  total: number,
  numeracao: string,
) {
  const doc = new jsPDF()
  const w = doc.internal.pageSize.getWidth()
  const h = doc.internal.pageSize.getHeight()
  let y = 15

  function checkBreak(needed: number) {
    if (y + needed > PAGE_BOTTOM) {
      doc.addPage()
      y = 20
    }
  }

  function banner(text: string) {
    checkBreak(14)
    doc.setFillColor(BRAND.r, BRAND.g, BRAND.b)
    doc.rect(MARGIN, y, w - MARGIN * 2, 8, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text(text, w / 2, y + 5.5, { align: 'center' })
    doc.setTextColor(0, 0, 0)
    y += 12
  }

  // --- CABEÇALHO ---
  const logoData = await loadImage('/dharma-logo.png')
  if (logoData) doc.addImage(logoData, 'PNG', MARGIN, y, 22, 22)

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(DHARMA.razaoSocial, w / 2, y + 6, { align: 'center' })
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`CNPJ: ${DHARMA.cnpj}`, w / 2, y + 12, { align: 'center' })
  doc.text(DHARMA.endereco, w / 2, y + 17, { align: 'center' })
  doc.text(DHARMA.cidade, w / 2, y + 22, { align: 'center' })

  y += 28
  doc.setLineWidth(0.5)
  doc.line(MARGIN, y, w - MARGIN, y)

  // --- TÍTULO ---
  y += 12
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('NOTA DE DÉBITO', w / 2, y, { align: 'center' })

  // --- SOLICITANTE ---
  y += 14
  doc.setFontSize(11)
  doc.text('Solicitante', MARGIN, y)
  y += 7
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Nome: ${sol.nome}`, MARGIN, y)
  y += 5
  doc.text(`CPF: ${sol.cpf}`, MARGIN, y)
  if (sol.rg) doc.text(`RG: ${sol.rg}`, 110, y)
  y += 5
  if (sol.endereco) {
    doc.text(`Endereço: ${sol.endereco}`, MARGIN, y)
    y += 5
  }

  // --- NUMERAÇÃO / VALOR / DATA ---
  y += 8
  doc.setLineWidth(0.3)
  doc.line(MARGIN, y, w - MARGIN, y)
  y += 7
  const dataEmissao = new Date().toLocaleDateString('pt-BR')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  const colSpacing = (w - MARGIN * 2) / 3
  const cols = [
    MARGIN + colSpacing * 0.5,
    MARGIN + colSpacing * 1.5,
    MARGIN + colSpacing * 2.5,
  ]
  doc.text('Numeração', cols[0], y, { align: 'center' })
  doc.text('Valor Final', cols[1], y, { align: 'center' })
  doc.text('Data Emissão', cols[2], y, { align: 'center' })
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.text(numeracao, cols[0], y, { align: 'center' })
  doc.text(formatarReais(total), cols[1], y, { align: 'center' })
  doc.text(dataEmissao, cols[2], y, { align: 'center' })
  y += 4
  doc.line(MARGIN, y, w - MARGIN, y)

  // --- DETALHAMENTO ---
  y += 6
  banner('DETALHAMENTO')

  const colDesc = MARGIN
  const colCC = 82
  const colProj = 130
  const colValor = w - MARGIN
  const descMaxW = colCC - colDesc - 4
  const projMaxW = colValor - colProj - 6

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Descrição', colDesc, y)
  doc.text('Centro de custo', colCC, y)
  doc.text('Projeto', colProj, y)
  doc.text('Valor [R$]', colValor, y, { align: 'right' })
  y += 3
  doc.setLineWidth(0.3)
  doc.line(MARGIN, y, w - MARGIN, y)
  y += 5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)

  comp.forEach((c, idx) => {
    const descLines = doc.splitTextToSize(c.descricao, descMaxW) as string[]
    const projLines = doc.splitTextToSize(c.projeto, projMaxW) as string[]
    const rowLines = Math.max(descLines.length, projLines.length, 1)
    const rowH = rowLines * LINE_H + 3

    checkBreak(rowH + 2)

    if (idx % 2 === 0) {
      doc.setFillColor(245, 247, 250)
      doc.rect(MARGIN, y - 4, w - MARGIN * 2, rowH, 'F')
    }

    doc.setTextColor(0, 0, 0)
    doc.text(descLines, colDesc, y)
    doc.text(c.centroCusto, colCC, y)
    doc.text(projLines, colProj, y)
    doc.text(formatarReais(c.valor).replace('R$ ', ''), colValor, y, { align: 'right' })
    y += rowH
  })

  // --- TOTAL ---
  checkBreak(22)
  doc.setLineWidth(0.5)
  doc.line(MARGIN, y, w - MARGIN, y)
  y += 7
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('VALOR DA NOTA DE DÉBITO [R$]', colDesc, y)
  doc.text(formatarReais(total), colValor, y, { align: 'right' })
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Valor por extenso: ${valorPorExtenso(total)}`, MARGIN, y)

  // --- INFORMAÇÕES PARA DEPÓSITO ---
  y += 10
  banner('INFORMAÇÕES PARA DEPÓSITO (pessoa física)')

  const labelX = w / 2 - 55
  const valueX = w / 2 + 5
  const bankFields: [string, string][] = [
    ['Nome:', sol.titular],
    ['Banco:', sol.banco],
    ['Agência:', sol.agencia],
    ['Conta Corrente:', sol.conta],
    ['CPF:', sol.cpf],
  ]
  if (sol.chavePix) bankFields.push(['Chave Pix:', sol.chavePix])

  bankFields.forEach(([label, value]) => {
    checkBreak(7)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(label, labelX, y, { align: 'right' })
    doc.setFont('helvetica', 'normal')
    doc.text(value || '—', valueX, y)
    y += 7
  })

  // --- ASSINATURAS ---
  y += 16
  checkBreak(30)
  doc.setLineWidth(0.4)
  const sigW = 72
  const sig1X = MARGIN + 8
  const sig2X = w - MARGIN - sigW - 8
  doc.line(sig1X, y, sig1X + sigW, y)
  doc.line(sig2X, y, sig2X + sigW, y)
  y += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Solicitante', sig1X + sigW / 2, y, { align: 'center' })
  doc.text('Responsável Financeiro', sig2X + sigW / 2, y, { align: 'center' })
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text(sol.nome || '', sig1X + sigW / 2, y, { align: 'center' })
  doc.setTextColor(0, 0, 0)

  // --- RODAPÉ (todas as páginas) ---
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(130, 130, 130)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, h - 14, w - MARGIN, h - 14)
    doc.text(`Página ${i} de ${totalPages}`, w / 2, h - 9, { align: 'center' })
    doc.text(`Emitido em ${dataEmissao}`, MARGIN, h - 9)
    doc.text(DHARMA.razaoSocial, w - MARGIN, h - 9, { align: 'right' })
    doc.setTextColor(0, 0, 0)
  }

  return doc
}
