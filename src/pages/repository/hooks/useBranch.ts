import React from 'react'
import { useParams } from 'react-router'

import { checkoutBranch, createNewBranch, getAllBranches, getCurrentBranch } from '@/lib/git/branch'
import { fsWithName } from '@/lib/git/helpers/fsWithName'
import { useGlobalStore } from '@/stores/globalStore'

export default function useBranch() {
  const { id } = useParams()
  const [userRepo] = useGlobalStore((state) => [
    state.userActions.getUserRepositoryMetaById(id!),
    state.authState.address
  ])
  const [branches, setBranches] = React.useState<string[]>([])
  const [currentBranch, setCurrentBranch] = React.useState('main')

  React.useEffect(() => {
    if (userRepo) {
      listBranches()
      fetchCurrentBranch()
    }
  }, [userRepo])

  async function listBranches() {
    if (!userRepo) return

    const { id } = userRepo

    const fs = fsWithName(id)
    const dir = `/${id}`

    const branchList = await getAllBranches({ fs, dir })

    setBranches([...branchList])
  }

  async function fetchCurrentBranch() {
    if (!userRepo) return

    const { id } = userRepo

    const fs = fsWithName(id)
    const dir = `/${id}`

    const { result, error } = await getCurrentBranch({ fs, dir })

    if (error || !result) return

    setCurrentBranch(result)
  }

  async function addNewBranch(branchName: string) {
    if (!userRepo) return

    const { id } = userRepo
    const fs = fsWithName(id)
    const dir = `/${id}`

    const result = await createNewBranch({
      fs,
      dir,
      name: branchName
    })

    if (result) {
      await listBranches()
      await fetchCurrentBranch()
    }
  }

  async function switchBranch(branch: string) {
    if (!userRepo) return

    const { id } = userRepo
    const fs = fsWithName(id)
    const dir = `/${id}`

    const { error } = await checkoutBranch({ fs, dir, name: branch })

    if (!error) {
      await fetchCurrentBranch()
    }
  }

  return { branches, currentBranch, addNewBranch, switchBranch }
}
