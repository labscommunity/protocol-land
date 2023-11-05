import git from 'isomorphic-git'

import { FSType } from './fsWithName'

export async function readFilesFromOid({ fs, dir, oid, prefix }: ReadFilesFromOidOptions) {
  const objects = []

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

export async function readFileFromOid({ fs, dir, oid }: ReadFileFromOidOptions) {
  const { blob } = await git.readBlob({ fs, dir, oid })

  return blob
}

export async function getOidFromRef({ ref, dir, fs }: GetOidFromRefOptions) {
  return await git.resolveRef({ fs, dir, ref })
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

type ReadFilesFromOidOptions = {
  fs: FSType
  dir: string
  oid: string
  prefix: string
}

type ReadFileFromOidOptions = {
  fs: FSType
  dir: string
  oid: string
}

type GetOidFromRefOptions = {
  fs: FSType
  dir: string
  ref: string
}
