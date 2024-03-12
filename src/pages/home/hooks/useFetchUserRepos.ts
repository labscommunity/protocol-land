import { dryrun } from '@permaweb/aoconnect'
import { useState } from 'react'

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
    const contract = await getWarpContract(CONTRACT_TX_ID)

    const { response: ownerReposResponse, error: ownerReposError } = await withAsync(() =>
      dryrun({
        process: AOS_PROCESS_ID,
        tags: getTags({
          Action: 'Get-Repositories-By-Owner'
        }),
        Owner: address as string
      })
    )

    const { response: PLRepoResponse } = await withAsync(() => getRepositoryMetaFromContract(PL_REPO_ID))

    const { response: collabResponse, error: collabError } = await withAsync(() =>
      dryrun({
        process: AOS_PROCESS_ID,
        tags: getTags({
          Action: 'Get-Repositories-By-Contributor',
          Contributor: address as string
        })
      })
    )

    if (ownerReposError || collabError) {
      setFetchUserReposStatus('ERROR')
    } else if (ownerReposResponse && collabResponse) {
      const PLRepo = PLRepoResponse?.result ? [PLRepoResponse.result] : []

      setUserRepos([
        ...PLRepo,
        ...(JSON.parse(ownerReposResponse?.Messages[0].Data)?.result as Repo[]),
        ...(JSON.parse(collabResponse?.Messages[0].Data)?.result as Repo[])
      ])
      setFetchUserReposStatus('SUCCESS')
    }
  }

  return {
    userRepos,
    fetchUserReposStatus,
    initFetchUserRepos
  }
}
