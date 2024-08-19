import { v4 as uuid } from 'uuid'

import { withAsync } from '@/helpers/withAsync'
import { Submission } from '@/types/hackathon'

import { HackathonSubmissionSchema } from '../config/schema'
import { uploadDetailsReadme } from './uploadDetailsReadme'
import { uploadLogo } from './uploadLogo'

export async function prepareHackathonSubmissionToSave(submission: PrepareHackathonItemProps) {
  const { projectLogoFile, details, links, images, ...rest } = submission
  const result: Partial<Submission> = {}

  const id = uuid()

  if (projectLogoFile) {
    const { response: projectLogo } = await withAsync(() => uploadLogo(projectLogoFile, id, 'project-logo'))
    if (!projectLogo) throw 'Error uploading project logo'
    result.logo = projectLogo
  }

  if (details) {
    const { response: descriptionTxId } = await withAsync(() => uploadDetailsReadme(details, id))
    if (!descriptionTxId) throw 'Error posting hackathon details'

    result.descriptionTxId = descriptionTxId
  }

  if (links) {
    result.links = links.map((link) => link.url)
  }

  if (images) {
    result.images = images.map((image) => image.url)
  }

  return { ...result, ...rest }
}

type PrepareHackathonItemProps = HackathonSubmissionSchema & {
  projectLogoFile?: File
}
