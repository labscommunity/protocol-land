import LightningFS from '@isomorphic-git/lightning-fs'

export function fsWithName(name: string) {
  return new LightningFS(name)
}

export type FSType = ReturnType<typeof fsWithName>