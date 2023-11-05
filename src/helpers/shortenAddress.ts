export function shortenAddress(address: string, range = 4) {
  return address.length > 11 ? address.slice(0, range) + '...' + address.slice(-range) : address
}
