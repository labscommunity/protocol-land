import JSZip from 'jszip'

import { waitFor } from '@/helpers/waitFor'
import { withAsync } from '@/helpers/withAsync'

import { FSType } from './fsWithName'

export async function packGitRepo({ fs, dir }: CommonPackUnpackGitRepoOptions) {
  const zip = new JSZip()

  await addFilesToZip(zip, dir, fs)

  await waitFor(500)

  const blob = await zip.generateAsync({ type: 'blob' })

  return blob
}

export async function unpackGitRepo({ fs, blob }: UnpackGitRepoOptions) {
  const zip = await JSZip.loadAsync(blob)

  zip.forEach(async (_, file) => {
    if (file.dir) {
      await fs.promises.mkdir('/' + file.name)
    } else {
      const content = await file.async('blob')
      await fs.promises.writeFile('/' + file.name, new Uint8Array(await content.arrayBuffer()))
    }
  })

  await waitFor(1000)

  return true
}

export async function copyFilesToTargetRepo(
  sourceDirPath: string,
  sourceFS: FSType,
  targetFS: FSType,
  targetDir: string
) {
  // ensure targetFS is initialized with dir
  const { error } = await withAsync(() => targetFS.promises.readdir(targetDir))
  if (error) {
    await targetFS.promises.mkdir(targetDir)
  }

  const dirItems = await sourceFS.promises.readdir(sourceDirPath)

  dirItems.forEach(async (item) => {
    const srcPath = `${sourceDirPath}/${item}`
    const destPath = `${targetDir}/${item}`

    const stats = await sourceFS.promises.stat(srcPath)

    if (stats.isDirectory()) {
      try {
        await targetFS.promises.mkdir(destPath)
      } catch (error) {
        // ignore
      }

      await copyFilesToTargetRepo(srcPath, sourceFS, targetFS, destPath)
    } else {
      const fileContent = await sourceFS.promises.readFile(srcPath)
      await targetFS.promises.writeFile(destPath, fileContent)
    }
  })
}

async function addFilesToZip(zip: JSZip, path: string, fs: FSType) {
  const dirItems = await fs.promises.readdir(path)

  dirItems.forEach(async (item) => {
    const fullPath = path + '/' + item
    const stats = await fs.promises.stat(fullPath)

    if (stats.isDirectory()) {
      await addFilesToZip(zip, fullPath, fs)
    } else {
      const fileContent = await fs.promises.readFile(fullPath)

      zip.file(fullPath.substring(fullPath.startsWith('//') ? 2 : 1), fileContent, {
        binary: true,
        compression: 'DEFLATE'
      }) // Remove leading slash
    }
  })
}

type CommonPackUnpackGitRepoOptions = {
  fs: FSType
  dir: string
}

type UnpackGitRepoOptions = CommonPackUnpackGitRepoOptions & {
  blob: Blob
}
