import { createDataItemSigner, dryrun, message, result } from '@permaweb/aoconnect'

import { AOS_PROCESS_ID } from '@/helpers/constants'
import { extractMessage } from '@/helpers/extractMessage'
import { getTags } from '@/helpers/getTags'
import { getSigner } from '@/helpers/wallet/getSigner'
import { withAsync } from '@/helpers/withAsync'
import { useGlobalStore } from '@/stores/globalStore'
import { Repo, RepoWithParent } from '@/types/repository'
import { User } from '@/types/user'

export const getUserAddressToUserMap = async () => {
  const userMap = new Map<string, User>()

  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({ Action: 'Get-Users' })
  })
  const users = JSON.parse(Messages[0].Data)?.result
  Object.entries(users).forEach(([address, user]) => {
    userMap.set(address, user as User)
  })
  return userMap
}

export const getUserDetailsFromContract = async (): Promise<{ result: User }> => {
  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({ Action: 'Get-User-Details' }),
    Owner: useGlobalStore.getState().authState.address as string
  })

  return JSON.parse(Messages[0].Data)
}

export const getUserDetailsByAddressFromContract = async (address: string): Promise<{ result: User }> => {
  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({ Action: 'Get-User-Details' }),
    Owner: address
  })

  const userDetails = JSON.parse(Messages[0].Data)?.result as User

  if (!userDetails)
    return {
      result: {
        statistics: {
          commits: [],
          pullRequests: [],
          issues: []
        },
        arNSNames: {}
      }
    }

  return { result: userDetails }
}

export const saveUserDetails = async (details: Partial<User>, address: string): Promise<{ result: User }> => {
  if (details.username && details.username !== useGlobalStore.getState().userState.userDetails.username) {
    const { Messages } = await dryrun({
      process: AOS_PROCESS_ID,
      tags: getTags({
        Action: 'Get-Username-Availability',
        Username: details.username
      })
    })

    const { result: isAvailable } = JSON.parse(Messages[0].Data)

    if (!isAvailable) {
      throw new Error(`Username ${details.username} is not available.`)
    }
  }

  const messageId = await message({
    process: AOS_PROCESS_ID,
    tags: getTags({ Action: 'Update-Profile-Details', Payload: JSON.stringify(details || {}) }),
    signer: createDataItemSigner(await getSigner({ injectedSigner: false }))
  })

  const { Output } = await result({
    message: messageId,
    process: AOS_PROCESS_ID
  })

  if (Output?.data?.output) {
    throw new Error(extractMessage(Output?.data?.output))
  }

  const { Messages } = await dryrun({
    process: AOS_PROCESS_ID,
    tags: getTags({ Action: 'Get-User-Details' }),
    Owner: address
  })

  const userDetails = JSON.parse(Messages[0].Data)?.result as User

  if (!userDetails)
    return {
      result: {
        statistics: {
          commits: [],
          pullRequests: [],
          issues: []
        },
        arNSNames: {}
      }
    }

  return { result: userDetails }
}

export const fetchUserRepos = async (address: string) => {
  let repos: RepoWithParent[] = []

  const { response: ownerReposResponse } = await withAsync(() =>
    dryrun({
      process: AOS_PROCESS_ID,
      tags: getTags({
        Action: 'Get-Repositories-By-Owner'
      }),
      Owner: address as string
    })
  )

  const { response: collabResponse } = await withAsync(() =>
    dryrun({
      process: AOS_PROCESS_ID,
      tags: getTags({
        Action: 'Get-Repositories-By-Contributor',
        Contributor: address as string
      })
    })
  )

  if (ownerReposResponse) {
    repos = [...repos, ...(JSON.parse(ownerReposResponse?.Messages[0].Data)?.result as Repo[])]
  }

  if (collabResponse) {
    repos = [...repos, ...(JSON.parse(collabResponse?.Messages[0].Data)?.result as Repo[])]
  }

  return repos
}
