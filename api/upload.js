import { google } from 'googleapis'
import { Readable } from 'stream'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { folderName, files } = req.body

    if (!folderName || !files || files.length === 0) {
      return res.status(400).json({ error: 'Dados inválidos' })
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    )

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    })

    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    const folder = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [process.env.DRIVE_FOLDER_ID],
      },
      fields: 'id',
    })

    const newFolderId = folder.data.id

    for (const file of files) {
      const buffer = Buffer.from(file.data, 'base64')
      await drive.files.create({
        requestBody: {
          name: file.name,
          parents: [newFolderId],
        },
        media: {
          mimeType: file.mimeType,
          body: Readable.from(buffer),
        },
      })
    }

    return res.status(200).json({ success: true, folderId: newFolderId })
  } catch (error) {
    console.error('Erro:', error)
    return res.status(500).json({ error: error.message || 'Erro no servidor' })
  }
}