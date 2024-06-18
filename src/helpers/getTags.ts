import { Tag } from 'arweave/web/lib/transaction'

function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getTags(payload: { [key: string]: string }): Tag[] {
  return Object.entries(payload).map(([key, value]) => ({ name: capitalizeFirstLetter(key), value }) as Tag)
}
