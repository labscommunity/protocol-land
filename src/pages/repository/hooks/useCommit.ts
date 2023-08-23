import React from 'react'
import { useParams } from 'react-router-dom'

import { getAllCommits } from '@/lib/git/commit'
import { fsWithName } from '@/lib/git/helpers/fsWithName'
import { useGlobalStore } from '@/stores/globalStore'
import { CommitResult } from '@/types/commit'

export default function useCommit() {
  const { id } = useParams()

  const [userRepo, address] = useGlobalStore((state) => [state.getUserRepositoryMetaById(id!), state.auth.address])
  const [commitsList, setCommitsList] = React.useState<CommitResult[]>([])

  React.useEffect(() => {
    if (userRepo) {
      fetchAllCommits()
    }
  }, [userRepo])

  async function fetchAllCommits() {
    if (!userRepo) return

    const { name } = userRepo

    const fs = fsWithName(name)
    const dir = `/${name}`
    const commits = await getAllCommits({ fs, dir })

    if (commits && commits.length > 0) {
      setCommitsList(commits)
    }
  }

  return {
    commitsList
  }
}
