import Arweave from 'arweave'

export function strToJwkPubKey(pubKey: string) {
  return {
    e: 'AQAB',
    ext: true,
    kty: 'RSA',
    n: pubKey
  }
}

export async function deriveAddress(publicKey: string) {
  const arweave = Arweave.init({
    host: 'ar-io.net',
    port: 443,
    protocol: 'https'
  })

  const pubKeyBuf = arweave.utils.b64UrlToBuffer(publicKey)
  const sha512DigestBuf = await crypto.subtle.digest('SHA-512', pubKeyBuf)

  return arweave.utils.bufferTob64Url(new Uint8Array(sha512DigestBuf))
}
