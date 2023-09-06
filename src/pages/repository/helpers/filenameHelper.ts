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
