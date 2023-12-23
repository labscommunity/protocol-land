export async function decryptAesKeyWithPrivateKey(encryptedAesKey: Uint8Array) {
  const decryptedAesKey = await window.arweaveWallet.decrypt(encryptedAesKey, {
    // @ts-ignore
    name: 'RSA-OAEP',
    hash: 'SHA-256'
  })

  return decryptedAesKey
}

export async function decryptFileWithAesGcm(encryptedFile: ArrayBuffer, decryptedAesKey: ArrayBuffer, iv: Uint8Array) {
  const aesKey = await window.crypto.subtle.importKey('raw', decryptedAesKey, { name: 'AES-GCM', length: 256 }, true, [
    'decrypt'
  ])

  const decryptedFile = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, aesKey, encryptedFile)

  return decryptedFile
}
