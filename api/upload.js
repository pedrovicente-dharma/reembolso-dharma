import { google } from 'googleapis'
import { Readable } from 'stream'
import { validarUpload, escaparSlack } from './_validateUpload.js'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

const ENV_OBRIGATORIAS = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN', 'DRIVE_FOLDER_ID']

async function notifySlack({ solicitante, numeracao, valorTotal, centroCusto, projeto, folderId }) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL?.trim()
  if (!webhookUrl) return

  const valorFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valorTotal || 0)
  const driveLink = `https://drive.google.com/drive/folders/${folderId}`
  const campo = (v) => (v ? escaparSlack(v) : '—')

  const payload = {
    text: `Novo reembolso enviado ao Drive: ${campo(solicitante)} — ${valorFormatado}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: [
            '*✅ Reembolso enviado ao Google Drive*',
            `*Solicitante:* ${campo(solicitante)}`,
            `*Numeração:* ${campo(numeracao)}`,
            `*Valor total:* ${valorFormatado}`,
            `*Centro de custo:* ${campo(centroCusto)}`,
            `*Projeto:* ${campo(projeto)}`,
            `*Pasta no Drive:* <${driveLink}|Abrir pasta>`,
          ].join('\n'),
        },
      },
    ],
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      console.error('Erro ao enviar alerta ao Slack:', res.status, await res.text())
    }
  } catch (error) {
    console.error('Erro ao enviar alerta ao Slack:', error)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const faltando = ENV_OBRIGATORIAS.filter((nome) => !process.env[nome]?.trim())
  if (faltando.length > 0) {
    console.error('Variáveis de ambiente ausentes:', faltando.join(', '))
    return res.status(500).json({ error: 'Servidor sem configuração do Google Drive. Avise o time de tecnologia.' })
  }

  const validacao = validarUpload(req.body)
  if (!validacao.ok) {
    return res.status(400).json({ error: validacao.error })
  }

  try {
    const { folderName, files, solicitante, numeracao, valorTotal, centroCusto, projeto } = validacao.data

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID.trim(),
      process.env.GOOGLE_CLIENT_SECRET.trim(),
      'https://developers.google.com/oauthplayground',
    )

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN.trim(),
    })

    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    const folder = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [process.env.DRIVE_FOLDER_ID.trim()],
      },
      fields: 'id',
    })

    const newFolderId = folder.data.id

    for (const file of files) {
      await drive.files.create({
        requestBody: {
          name: file.name,
          parents: [newFolderId],
        },
        media: {
          mimeType: file.mimeType,
          body: Readable.from(file.buffer),
        },
      })
    }

    await notifySlack({ solicitante, numeracao, valorTotal, centroCusto, projeto, folderId: newFolderId })

    return res.status(200).json({ success: true, folderId: newFolderId })
  } catch (error) {
    console.error('Erro:', error)
    return res.status(500).json({ error: error.message || 'Erro no servidor' })
  }
}
