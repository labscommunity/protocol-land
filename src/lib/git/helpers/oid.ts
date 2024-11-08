import git, { TreeEntry } from '@protocol.land/isomorphic-git'

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

  const sortedObjects = objects.sort((a, b) => {
    if (a.type === b.type) {
      return a.path.localeCompare(b.path)
    }
    return a.type === 'folder' ? -1 : 1
  })

  return {
    objects: sortedObjects,
    parent: oid
  }
}

export async function readFilesFromCommit({ fs, dir, oid, prefix }: ReadFilesFromOidOptions) {
  const objects: {
    prefix: string
    oid: string
    path: string
    parent: string
    type: string
  }[] = []
  const oids: string[] = []

  const stack: { tree: TreeEntry[]; prefix: string }[] = []
  const { tree } = await git.readTree({ fs, dir, oid })
  stack.push({ tree, prefix })

  while (stack.length > 0) {
    const { tree: currentTree, prefix: currentPrefix } = stack.pop()!

    for (const entry of currentTree) {
      const updatedPrefix = join(currentPrefix, entry.path)
      const _oid = entry.oid
      const path = entry.path

      oids.push(_oid)

      if (entry.type === 'tree') {
        // If it's a tree, add its contents to the stack
        const { tree: treeNested } = await git.readTree({ fs, dir, oid: _oid })
        stack.push({ tree: treeNested, prefix: updatedPrefix })
      } else {
        // If it's a blob, add it to the objects array
        objects.push({
          prefix: updatedPrefix,
          oid: _oid,
          path,
          parent: oid,
          type: entry.type
        })
      }
    }
  }

  return {
    objects,
    oids,
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

export async function createPackFile({ fs, dir, oids }: CreatePackFileOptions) {
  return await git.packObjects({ fs, dir, oids })
}

export async function indexPackFile({ fs, dir, filePath }: IndexPackFileOptions) {
  return await git.indexPack({ fs, dir, filepath: filePath })
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

type CreatePackFileOptions = {
  fs: FSType
  dir: string
  oids: string[]
}
type IndexPackFileOptions = {
  fs: FSType
  dir: string
  filePath: string
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
