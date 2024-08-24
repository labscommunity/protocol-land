import { Submission } from '@/types/hackathon'

import { HackathonSubmissionSchema } from '../config/schema'

export async function prepareSubmissionToLoad(submission: Partial<Submission>) {
  const { images, links, descriptionTxId, ...rest } = submission
  const result: HackathonSubmissionSchema = {
    ...rest
  }

  if (images) {
    result.images = images.map((image) => ({ url: image }))
  }
  if (links) {
    result.links = links.map((link) => ({ url: link }))
  }
  if (descriptionTxId) {
    const description = await fetch(`https://arweave.net/${descriptionTxId}`)
    result.details = await description.text()
  }

  return {
    projectName: result.projectName || undefined,
    shortDescription: result.shortDescription || undefined,
    technologiesUsed: result.technologiesUsed || undefined,
    images: result.images || undefined,
    links: result.links || undefined,
    video: result.video || undefined,
    details: result.details || ''
  }
}

export type PrepareSubmissionToLoadReturnType = Awaited<ReturnType<typeof prepareSubmissionToLoad>>
