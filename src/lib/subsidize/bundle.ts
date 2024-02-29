import Arweave, { CreateTransactionInterface } from 'arweave/web'
import { JWKInterface } from 'arweave/web/lib/wallet'
import base64url from 'base64url'
import { DataItem } from 'warp-arbundles'

import { byteArrayToLong, digestMessage } from './utils'

const HEADER_START = 32

export class Bundle {
  binary: Buffer
  length: number
  items: DataItem[]

  constructor(binary: Buffer) {
    this.binary = binary
    this.length = this.getDataItemCount()
    this.items = this.getItems()
  }

  getRaw() {
    return this.binary
  }

  get(index: number | string) {
    if (typeof index === 'number') {
      if (index >= this.length) {
        throw new RangeError('Index out of range')
      }

      return this.getByIndex(index)
    } else {
      return this.getById(index)
    }
  }

  getSizes() {
    const ids = []
    for (let i = HEADER_START; i < HEADER_START + 64 * this.length; i += 64) {
      ids.push(byteArrayToLong(this.binary.subarray(i, i + 32)))
    }

    return ids
  }

  getIds() {
    const ids = []
    for (let i = HEADER_START; i < HEADER_START + 64 * this.length; i += 64) {
      const bundleId = this.binary.subarray(i + 32, i + 64)
      if (bundleId.length === 0) {
        throw new Error("Invalid bundle, id specified in headers doesn't exist")
      }
      ids.push(base64url.encode(bundleId))
    }

    return ids
  }

  getIdBy(index: number) {
    if (index > this.length - 1) {
      throw new RangeError('Index of bundle out of range')
    }

    const start = 64 + 64 * index
    return base64url.encode(this.binary.subarray(start, start + 32))
  }

  async toTransaction(attributes: Partial<CreateTransactionInterface>, arweave: Arweave, jwk: JWKInterface) {
    const tx = await arweave.createTransaction({ data: this.binary, ...attributes }, jwk)

    tx.addTag('Bundle-Format', 'binary')
    tx.addTag('Bundle-Version', '2.0.0')

    return tx
  }

  async verify() {
    for (const item of this.items) {
      const valid = await item.isValid()
      const expected = base64url(await digestMessage(item.rawSignature))

      if (!(valid && item.id === expected)) {
        return false
      }
    }

    return true
  }

  getOffset(id: Buffer) {
    let offset = 0
    for (let i = HEADER_START; i < HEADER_START + 64 * this.length; i += 64) {
      const _offset = byteArrayToLong(this.binary.subarray(i, i + 32))
      offset += _offset
      const _id = this.binary.subarray(i + 32, i + 64)

      if (Buffer.compare(_id, id) === 0) {
        return { startOffset: offset, size: _offset }
      }
    }

    return { startOffset: -1, size: -1 }
  }

  getByIndex(index: number) {
    let offset = 0
    const bundleStart = this.getBundleStart()
    let counter = 0
    let _offset, _id
    for (let i = HEADER_START; i < HEADER_START + 64 * this.length; i += 64) {
      _offset = byteArrayToLong(this.binary.subarray(i, i + 32))
      if (counter++ === index) {
        _id = this.binary.subarray(i + 32, i + 64)
        break
      }
      offset += _offset
    }
    const dataItemStart = bundleStart + offset
    const slice = this.binary.subarray(dataItemStart, dataItemStart + _offset!)
    const item = new DataItem(slice)
    item.rawId = _id as Buffer | Promise<Buffer>

    return item
  }

  getById(id: string) {
    const _id = base64url.toBuffer(id)

    const offset = this.getOffset(_id)
    if (offset.startOffset === -1) {
      throw new Error('Transaction not found')
    }

    const bundleStart = this.getBundleStart()
    const dataItemStart = bundleStart + offset.startOffset

    return new DataItem(this.binary.subarray(dataItemStart, dataItemStart + offset.size))
  }

  getDataItemCount() {
    return byteArrayToLong(this.binary.subarray(0, 32))
  }

  getBundleStart() {
    return 32 + 64 * this.length
  }

  getItems() {
    const items = new Array(this.length)
    let offset = 0
    const bundleStart = this.getBundleStart()

    let counter = 0
    for (let i = HEADER_START; i < HEADER_START + 64 * this.length; i += 64) {
      const _offset = byteArrayToLong(this.binary.subarray(i, i + 32))
      const _id = this.binary.subarray(i + 32, i + 64)
      if (_id.length === 0) {
        throw new Error("Invalid bundle, id specified in headers doesn't exist")
      }
      const dataItemStart = bundleStart + offset
      const bytes = this.binary.subarray(dataItemStart, dataItemStart + _offset)

      offset += _offset

      const item = new DataItem(bytes)
      item.rawId = _id
      items[counter] = item

      counter++
    }
    return items
  }
}
export default Bundle
