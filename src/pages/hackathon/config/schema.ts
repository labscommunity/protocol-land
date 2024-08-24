import * as yup from 'yup'

export const hackathonSubmissionSchema = yup
  .object({
    projectName: yup.string(),
    shortDescription: yup.string(),
    details: yup.string(),
    technologiesUsed: yup
      .string()
      .transform((curr, orig) => (orig === '' ? undefined : curr))
      .matches(/^([^,\s]+,)*([^,\s]+)$/, 'Technologies used must be comma separated'),
    images: yup.array().of(
      yup.object({
        url: yup.string().url('Must be a valid URL').required('Image is required')
      })
    ),
    links: yup.array().of(
      yup.object({
        url: yup.string().url('Must be a valid URL').required('Link is required')
      })
    ),
    video: yup.string().url('Must be a valid URL')
  })
  .required()

export type HackathonSubmissionSchema = yup.InferType<typeof hackathonSubmissionSchema>
