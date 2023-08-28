import React from 'react'
import { useParams } from 'react-router'

import { checkoutBranch, createNewBranch, getAllBranches, getCurrentBranch } from '@/lib/git/branch'
import { fsWithName } from '@/lib/git/helpers/fsWithName'
import { useGlobalStore } from '@/stores/globalStore'

export default function useBranch() {
  const { id } = useParams()
  const [userRepo, address] = useGlobalStore((state) => [
    state.repositoryActions.getUserRepositoryMetaById(id!),
    state.authState.address
  ])
  const [branches, setBranches] = React.useState<string[]>([])
  const [currentBranch, setCurrentBranch] = React.useState('master')

  React.useEffect(() => {
    if (userRepo) {
      listBranches()
      fetchCurrentBranch()
    }
  }, [userRepo])

  async function listBranches() {
    if (!userRepo) return

    const { name } = userRepo

    const fs = fsWithName(name)
    const dir = `/${name}`

    const branchList = await getAllBranches({ fs, dir })
    console.log({ branchList })
    setBranches([...branchList])
  }

  async function fetchCurrentBranch() {
    if (!userRepo) return

    const { name } = userRepo

    const fs = fsWithName(name)
    const dir = `/${name}`

    const { result, error } = await getCurrentBranch({ fs, dir })

    if (error || !result) return

    setCurrentBranch(result)
  }

  async function addNewBranch(branchName: string) {
    if (!userRepo) return

    const { name } = userRepo
    const fs = fsWithName(name)
    const dir = `/${name}`

    const result = await createNewBranch({
      fs,
      dir,
      name: branchName,
      owner: address!,
      repoName: name,
      id: userRepo.id
    })

    if (result) {
      await listBranches()
      await fetchCurrentBranch()
    }
  }

  async function switchBranch(branch: string) {
    if (!userRepo) return

    const { name } = userRepo
    const fs = fsWithName(name)
    const dir = `/${name}`

    const { error } = await checkoutBranch({ fs, dir, name: branch })

    if (!error) {
      await fetchCurrentBranch()
    }
  }

  return { branches, currentBranch, addNewBranch, switchBranch }
}
