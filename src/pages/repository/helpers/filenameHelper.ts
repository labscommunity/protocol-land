const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'ico', 'svg', 'webp', 'heic', 'heif']

export function isImage(fileName: string) {
  return IMAGE_EXTS.some((v) => v === getFileExtension(fileName))
}

export function getFileExtension(filename: string) {
  const regex = /(?:\.([^.]+))?$/

  const parts = regex.exec(filename)
  if (!parts || parts.length < 2) return ''

  return parts[1].toLowerCase()
}

export async function getFileContent(fileData: Uint8Array, filename: string) {
  if (!fileData) return ''

  if (!isImage(filename)) return Buffer.from(fileData).toString('utf8')

  if (getFileExtension(filename) === 'svg')
    return `data:image/svg+xml;base64,${Buffer.from(fileData).toString('base64')}`
  else {
    const dataUrl = await new Promise((res: (value: string) => void) => {
      const reader = new FileReader()
      reader.onload = () => res(reader.result as string)
      reader.readAsDataURL(new Blob([fileData]))
    })
    return dataUrl ? dataUrl : ''
  }
}
