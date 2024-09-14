import { dryrun } from '@/helpers/aoconnect'
import { AOS_PROCESS_ID } from '@/helpers/constants'
import { getTags } from '@/helpers/getTags'
import { withAsync } from '@/helpers/withAsync'
import { sendMessage } from '@/lib/contract'
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

  await sendMessage({ tags: getTags({ Action: 'Update-Profile-Details', Payload: JSON.stringify(details || {}) }) })

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
        Action: 'Get-User-Owned-Contributed-Repos',
        'User-Address': address as string
      })
    })
  )

  if (ownerReposResponse) {
    repos = [...repos, ...(JSON.parse(ownerReposResponse?.Messages[0].Data)?.result as Repo[])]
  }

  return repos
}
