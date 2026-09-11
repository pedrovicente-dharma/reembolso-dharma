// Carrega uma imagem (ex: o logo) e converte para data URL em base64, formato que o jsPDF
// exige para desenhar imagens no PDF (doc.addImage não aceita uma URL comum).
export function loadImage(url: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      canvas.getContext('2d')!.drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    // Se a imagem não carregar (ex: arquivo ausente), resolve com string vazia em vez de rejeitar,
    // para que o PDF ainda seja gerado sem o logo em vez de falhar por completo.
    img.onerror = () => resolve('')
    img.src = url
  })
}
