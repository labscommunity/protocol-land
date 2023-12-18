export function strToJwkPubKey(pubKey: string) {
  return {
    e: 'AQAB',
    ext: true,
    kty: 'RSA',
    n: pubKey
  }
}
