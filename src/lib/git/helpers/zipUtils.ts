import JSZip from 'jszip'

import { waitFor } from '@/helpers/waitFor'

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
