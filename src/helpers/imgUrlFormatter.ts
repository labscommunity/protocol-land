export function imgUrlFormatter(url: string) {
  if (!url) return ''
  if (url.match(/^[a-zA-Z0-9_-]{43}$/)) {
    return `https://arweave.net/${url}`
  }

  return url
}
