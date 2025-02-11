import React from 'react'
import { useParams } from 'react-router-dom'
import { validate as isUuid } from 'uuid'

import PageNotFound from '@/components/PageNotFound'

export default function OrgRepoWrapper({ element }: { element: React.ReactNode }) {
  const { id } = useParams()

  if (id && !isUuid(id)) return <PageNotFound />

  return element
}
