import jsPDF from 'jspdf'
import type { Solicitante, Comprovante } from '../types'
import { DHARMA } from '../constants'
import { valorPorExtenso } from '../utils/valorPorExtenso'
import { formatarReais } from '../utils/formatarReais'
import { loadImage } from '../utils/loadImage'

export async function gerarPDF(
  sol: Solicitante,
  comp: Comprovante[],
  total: number,
  numeracao: string,
) {
  const doc = new jsPDF()
  const w = doc.internal.pageSize.getWidth()
  let y = 15

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

  y += 14; doc.setFontSize(11); doc.text('Solicitante', 20, y)
  y += 7; doc.setFontSize(10); doc.setFont('helvetica', 'normal')
  doc.text(`Nome: ${sol.nome}`, 20, y); y += 5
  doc.text(`CPF: ${sol.cpf}`, 20, y)
  if (sol.rg) doc.text(`RG: ${sol.rg}`, 110, y)
  y += 5
  if (sol.endereco) { doc.text(`Endereço: ${sol.endereco}`, 20, y); y += 5 }

  y += 8; doc.setLineWidth(0.3); doc.line(20, y, w - 20, y); y += 7
  const dataEmissao = new Date().toLocaleDateString('pt-BR')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
  const colStart = 20, colEnd = w - 20, colSpacing = (colEnd - colStart) / 3
  const cols = [colStart + colSpacing * 0.5, colStart + colSpacing * 1.5, colStart + colSpacing * 2.5]
  doc.text('Numeração', cols[0], y, { align: 'center' })
  doc.text('Valor Final', cols[1], y, { align: 'center' })
  doc.text('Data Emissão', cols[2], y, { align: 'center' }); y += 6
  doc.setFont('helvetica', 'normal')
  doc.text(numeracao, cols[0], y, { align: 'center' })
  doc.text(formatarReais(total), cols[1], y, { align: 'center' })
  doc.text(dataEmissao, cols[2], y, { align: 'center' })
  y += 4; doc.line(20, y, w - 20, y)

  y += 12
  doc.setFillColor(0, 0, 0); doc.rect(20, y, w - 40, 8, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(255, 255, 255)
  doc.text('DETALHAMENTO', 24, y + 5.5); doc.setTextColor(0, 0, 0)

  y += 12
  const colDesc = 20, colCC = 85, colProj = 135, colValor = w - 20
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9)
  doc.text('Descrição', colDesc, y)
  doc.text('Centro de custo', colCC, y)
  doc.text('Projeto', colProj, y)
  doc.text('Valor [R$]', colValor, y, { align: 'right' })
  y += 3; doc.setLineWidth(0.3); doc.line(20, y, w - 20, y); y += 6

  doc.setFont('helvetica', 'normal'); doc.setFontSize(9)
  comp.forEach(c => {
    doc.text(c.descricao, colDesc, y)
    doc.text(c.centroCusto, colCC, y)
    doc.text(c.projeto, colProj, y)
    doc.text(formatarReais(c.valor).replace('R$ ', ''), colValor, y, { align: 'right' })
    y += 6
  })

  y += 2; doc.setLineWidth(0.5); doc.line(20, y, w - 20, y); y += 7
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10)
  doc.text('VALOR DA NOTA DE DÉBITO [R$]', colDesc, y)
  doc.text(formatarReais(total), colValor, y, { align: 'right' })
  y += 10; doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
  doc.text(`Valor por extenso: ${valorPorExtenso(total)}`, 20, y)

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
  if (sol.chavePix) { doc.text(`Chave Pix: ${sol.chavePix}`, w / 2, y, { align: 'center' }) }

  return doc
}
