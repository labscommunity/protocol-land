import { fsWithName } from '@/lib/git/helpers/fsWithName'
import { getOidFromRef, readFileFromOid, readFilesFromOid } from '@/lib/git/helpers/oid'
import { packGitRepo } from '@/lib/git/helpers/zipUtils'

export async function getOidOfHeadRef(name: string) {
  const fs = fsWithName(name)
  const dir = `/${name}`

  return getOidFromRef({ ref: 'HEAD', dir, fs })
}

export async function getFilesFromOid(oid: string, name: string) {
  const fs = fsWithName(name)
  const dir = `/${name}`

  return readFilesFromOid({ dir, oid, prefix: '', fs })
}

export async function getFileContentFromOid(oid: string, name: string) {
  const fs = fsWithName(name)
  const dir = `/${name}`

  return readFileFromOid({ dir, oid, fs })
}

export async function saveRepository(name: string) {
  const fs = fsWithName(name)
  const dir = `/${name}`

  const blob = await packGitRepo({ fs, dir })

  const downloadLink = document.createElement('a')
  downloadLink.href = URL.createObjectURL(blob)
  downloadLink.download = `${name}.zip` // Set the desired filename for the ZIP file
  downloadLink.style.display = 'none'
  document.body.appendChild(downloadLink)

  // Simulate a click on the download link
  downloadLink.click()

  // Clean up the temporary URL object
  URL.revokeObjectURL(downloadLink.href)

  // Remove the download link from the DOM
  document.body.removeChild(downloadLink)
}
