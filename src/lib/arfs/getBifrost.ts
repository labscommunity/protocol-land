import { ArFS, BiFrost, Drive } from 'arfs-js'

export function getBifrost(drive: Drive, arfs: ArFS) {
  const bifrost = new BiFrost(drive, arfs)

  return bifrost
}
