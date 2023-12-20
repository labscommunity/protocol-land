import Arweave from 'arweave'

import { deriveAddress } from '../utils'

const arweave = Arweave.init({
  host: 'ar-io.net',
  port: 443,
  protocol: 'https'
})

export async function encryptFileWithAesGcm(file: ArrayBuffer) {
  const aesKey = await window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])

  const iv = window.crypto.getRandomValues(new Uint8Array(16))
  const encryptedFile = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, aesKey, file)

  return { encryptedFile, aesKey, iv: arweave.utils.bufferTob64Url(iv) }
}

export async function encryptAesKeyWithPublicKeys(aesKey: CryptoKey, publicKeyArray: JsonWebKey[]) {
  const encryptedKeys: Record<string, string> = Object.create(null)

  for (const publicKeyJwk of publicKeyArray) {
    const publicKey = await window.crypto.subtle.importKey(
      'jwk',
      publicKeyJwk,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['encrypt']
    )

    const encryptedKey = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      await window.crypto.subtle.exportKey('raw', aesKey)
    )

    const hash = await deriveAddress(publicKeyJwk.n!)

    encryptedKeys[hash] = arweave.utils.bufferTob64Url(new Uint8Array(encryptedKey))
  }

  return encryptedKeys
}
