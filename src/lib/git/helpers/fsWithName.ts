import singletonArfs from '@/lib/arfs/arfsSingleton'

export function fsWithName(name: string) {
  const bifrost = singletonArfs.getBifrostInstance()

  if (!bifrost) throw new Error('Bifrost uninitialized.')
  console.log({ name })
  return bifrost.fs
}

export type FSType = ReturnType<typeof fsWithName>
