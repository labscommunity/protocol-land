export function getLogoUrl(logo: string) {
  if (!logo) return ''

  const isFullUrl = logo.startsWith('http://') || logo.startsWith('https://')
  return isFullUrl ? logo : `https://arweave.net/${logo}`
}
