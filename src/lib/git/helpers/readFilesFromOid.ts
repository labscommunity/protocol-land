import LightningFS from '@isomorphic-git/lightning-fs'
import git from 'isomorphic-git'

type ReadFilesFromOidOptions = {
  dir: string
  oid: string
  prefix: string
}

export async function readFilesFromOid({ dir, oid, prefix }: ReadFilesFromOidOptions) {
  const objects = []
  const fs = new LightningFS('fs')

  const { tree } = await git.readTree({ fs, dir, oid })

  for (const entry of tree) {
    const updatedPrefix = join(prefix, entry.path)
    const _oid = entry.oid
    const path = entry.path
    let type = 'file'

    if (entry.type === 'tree') {
      type = 'folder'
    }

    objects.push({
      prefix: updatedPrefix,
      oid: _oid,
      path,
      type,
      parent: oid
    })
  }

  return {
    objects,
    parent: oid
  }
}

function join(...parts: string[]) {
  return normalizePath(parts.map(normalizePath).join('/'))
}

function normalizePath(path: string) {
  return path
    .replace(/\/\.\//g, '/') // Replace '/./' with '/'
    .replace(/\/{2,}/g, '/') // Replace consecutive '/'
    .replace(/^\/\.$/, '/') // if path === '/.' return '/'
    .replace(/^\.\/$/, '.') // if path === './' return '.'
    .replace(/^\.\//, '') // Remove leading './'
    .replace(/\/\.$/, '') // Remove trailing '/.'
    .replace(/(.+)\/$/, '$1') // Remove trailing '/'
    .replace(/^$/, '.') // if path === '' return '.'
}
