export function shortenAddress(address: string) {
  return address.length > 11 ? address.slice(0, 4) + '...' + address.slice(-4) : address
}
