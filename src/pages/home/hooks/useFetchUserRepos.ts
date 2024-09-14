import { useState } from 'react'

import { dryrun } from '@/helpers/aoconnect'
import { AOS_PROCESS_ID, PL_REPO_ID } from '@/helpers/constants'
import { getTags } from '@/helpers/getTags'
import { withAsync } from '@/helpers/withAsync'
import { useGlobalStore } from '@/stores/globalStore'
import { getRepositoryMetaFromContract } from '@/stores/repository-core/actions'
import { Repo } from '@/types/repository'

export function useFetchUserRepos() {
  const [address, userRepos, setUserRepos] = useGlobalStore((state) => [
    state.authState.address,
    state.userState.userRepos,
    state.userActions.setUserRepositories
  ])
  const [fetchUserReposStatus, setFetchUserReposStatus] = useState<ApiStatus>('IDLE')

  const initFetchUserRepos = async () => {
    setFetchUserReposStatus('PENDING')

    const { response: userReposResponse, error: userReposError } = await withAsync(() =>
      dryrun({
        process: AOS_PROCESS_ID,
        tags: getTags({
          Action: 'Get-User-Owned-Contributed-Repos',
          'User-Address': address as string
        })
      })
    )

    const { response: PLRepoResponse } = await withAsync(() => getRepositoryMetaFromContract(PL_REPO_ID))

    if (userReposError) {
      setFetchUserReposStatus('ERROR')
    } else if (userReposResponse) {
      const PLRepo = PLRepoResponse?.result ? [PLRepoResponse.result] : []

      setUserRepos([...PLRepo, ...(JSON.parse(userReposResponse?.Messages[0].Data)?.result as Repo[])])
      setFetchUserReposStatus('SUCCESS')
    }
  }

  return {
    userRepos,
    fetchUserReposStatus,
    initFetchUserRepos
  }
}
