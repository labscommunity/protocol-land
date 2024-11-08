import arfsSingletonMap from '@/lib/arfs/arfsSingletonMap'

export function fsWithName(name: string) {
  const arfsSingleton = arfsSingletonMap.getArFSSingleton(name)

  if (!arfsSingleton) throw new Error('ArFS uninitialized.')

  const bifrost = arfsSingleton.getBifrostInstance()

  if (!bifrost) throw new Error('Bifrost uninitialized.')

  return bifrost.fs
}

export type FSType = ReturnType<typeof fsWithName>
