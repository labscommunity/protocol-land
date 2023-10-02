import { Tab } from '@headlessui/react'
import React from 'react'
import { useParams } from 'react-router-dom'

import { useGlobalStore } from '@/stores/globalStore'
import { fetchUserRepos } from '@/stores/user/actions'
import { Repo } from '@/types/repository'
import { User } from '@/types/user'

// import { Button } from '@/components/common/buttons'
import Sidebar from './components/Sidebar'
import { rootTabConfig } from './config/tabConfig'

const activeClasses = 'border-b-[3px] border-[#8a6bec] text-[#8a6bec] font-medium'

export default function Profile() {
  const [status, setStatus] = React.useState('PENDING')
  const [userRepos, setUserRepos] = React.useState<Repo[]>([])
  const [userDetails, setUserDetails] = React.useState<User>({})
  const [fetchUserDetailsByAddress] = useGlobalStore((state) => [state.userActions.fetchUserDetailsByAddress])
  const { id } = useParams()

  React.useEffect(() => {
    if (id) {
      fetchUserDetails(id)
    }
  }, [id])

  async function fetchUserDetails(address: string) {
    const userDetails = await fetchUserDetailsByAddress(address)
    const repos = await fetchUserRepos(address)

    setUserRepos(repos)
    setUserDetails(userDetails)

    setStatus('SUCCESS')
  }

  return (
    <div className="h-full flex-1 flex max-w-[1280px] mx-auto w-full mt-12 gap-4 pb-12">
      <Sidebar setUserDetails={setUserDetails} userDetails={userDetails} />
      <div className="flex flex-col flex-1 px-8 gap-4">
        <div>
          <Tab.Group>
            <Tab.List className="flex text-liberty-dark-100 text-lg gap-10 border-b-[1px] border-[#cbc9f6]">
              {rootTabConfig.map((tab) => (
                <Tab className="focus-visible:outline-none">
                  {({ selected }) => (
                    <div
                      className={`flex items-center gap-2 py-2 px-2 justify-center ${selected ? activeClasses : ''}`}
                    >
                      <tab.Icon className="w-5 h-5" />
                      {tab.title}
                    </div>
                  )}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className={'mt-4 px-2 flex flex-col flex-1'}>
              {rootTabConfig.map((TabItem) => (
                <Tab.Panel className={'flex flex-col flex-1'}>
                  <TabItem.Component userDetails={userDetails} userRepos={userRepos} />
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  )
}
