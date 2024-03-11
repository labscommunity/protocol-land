import { DataItem } from 'warp-arbundles'

import Bundle from './bundle'

export function longToNByteArray(N: number, long: number) {
  const byteArray = new Uint8Array(N)
  if (long < 0) throw new Error('Array is unsigned, cannot represent -ve numbers')
  if (long > 2 ** (N * 8) - 1) throw new Error(`Number ${long} is too large for an array of ${N} bytes`)
  for (let index = 0; index < byteArray.length; index++) {
    const byte = long & 0xff
    byteArray[index] = byte
    long = (long - byte) / 256
  }
  return byteArray
}

export function longTo32ByteArray(long: number) {
  return longToNByteArray(32, long)
}

export async function digestMessage(message: string | ArrayBuffer) {
  const encoder = new TextEncoder()
  const data = encoder.encode(message as string)

  const hash = await crypto.subtle.digest('SHA-256', data)

  return hash as Buffer
}

export function byteArrayToLong(byteArray: Uint8Array) {
  let value = 0
  for (let i = byteArray.length - 1; i >= 0; i--) {
    value = value * 256 + byteArray[i]
  }
  return value
}

export async function bundleAndSignData(dataItems: DataItem[], signer: any) {
  const headers = new Uint8Array(64 * dataItems.length)

  const binaries = await Promise.all(
    dataItems.map(async (d, index) => {
      // Sign DataItem
      const id = d.isSigned() ? d.rawId : await d.sign(signer)
      // Create header array
      const header = new Uint8Array(64)
      // Set offset
      header.set(longTo32ByteArray(d.getRaw().byteLength), 0)
      // Set id
      header.set(await id, 32)
      // Add header to array of headers
      headers.set(header, 64 * index)
      // Convert to array for flattening
      return d.getRaw()
    })
  ).then((a) => {
    return Buffer.concat(a)
  })

  const buffer = Buffer.concat([Buffer.from(longTo32ByteArray(dataItems.length)), Buffer.from(headers), binaries])

  return new Bundle(buffer)
}
