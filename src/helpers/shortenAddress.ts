export function shortenAddress(address: string, range = 4) {
  if (address.length !== 43) return address
  return address.slice(0, range) + '...' + address.slice(-range)
}

export function shortenUUID(uuid: string, range = 4) {
  if (uuid.length !== 36) return uuid
  return uuid.slice(0, range) + '...' + uuid.slice(-range)
}
