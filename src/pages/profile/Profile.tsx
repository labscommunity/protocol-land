import { Tab } from '@headlessui/react'
import React from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { Seo } from '@/components/Seo'
import { trackGoogleAnalyticsPageView } from '@/helpers/google-analytics'
import { defaultMetaTagsData } from '@/helpers/seoUtils'
import { useGlobalStore } from '@/stores/globalStore'
import { fetchUserRepos } from '@/stores/user/actions'
import { Repo } from '@/types/repository'
import { User } from '@/types/user'

// import { Button } from '@/components/common/buttons'
import Sidebar from './components/Sidebar'
import SidebarLoading from './components/SidebarLoading'
import { rootTabConfig } from './config/tabConfig'

const activeClasses = 'border-b-[2px] border-primary-600 text-gray-900 font-medium'

export default function Profile() {
  const [status, setStatus] = React.useState('PENDING')
  const [userRepos, setUserRepos] = React.useState<Repo[]>([])
  const [userDetails, setUserDetails] = React.useState<Partial<User>>({})
  const [fetchUserDetailsByAddress] = useGlobalStore((state) => [state.userActions.fetchUserDetailsByAddress])
  const { id } = useParams()
  const location = useLocation()

  React.useEffect(() => {
    trackGoogleAnalyticsPageView('pageview', location.pathname, 'Profile Page Visit')
  }, [])

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
    <>
      <Seo {...defaultMetaTagsData} title="Protocol.Land | Profile" />
      <div className="h-full flex-1 flex max-w-[1280px] px-8 mx-auto w-full mt-12 gap-4 pb-12">
        {status === 'SUCCESS' && <Sidebar setUserDetails={setUserDetails} userDetails={userDetails} />}
        {status === 'PENDING' && <SidebarLoading />}
        <div className="flex flex-col flex-1 px-8 gap-4">
          <div>
            <Tab.Group>
              <Tab.List className="flex text-gray-500 text-lg gap-10 border-b-[1px] border-gray-200">
                {rootTabConfig.map((tab) => (
                  <Tab className="focus-visible:outline-none">
                    {({ selected }) => (
                      <div
                        className={`flex items-center gap-2 py-[10px] px-4 justify-center ${
                          selected ? activeClasses : ''
                        }`}
                      >
                        <tab.Icon className="w-5 h-5" />
                        {tab.title}
                      </div>
                    )}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels className={'mt-4 px-2 flex flex-col flex-1'}>
                {status === 'PENDING' && (
                  <div className="flex flex-col gap-4">
                    <div className="h-16 bg-gray-200 rounded-lg dark:bg-gray-700 w-full animate-pulse"></div>
                    <div className="h-16 bg-gray-200 rounded-lg dark:bg-gray-700 w-full animate-pulse"></div>
                    <div className="h-16 bg-gray-200 rounded-lg dark:bg-gray-700 w-full animate-pulse"></div>
                    <div className="h-16 bg-gray-200 rounded-lg dark:bg-gray-700 w-full animate-pulse"></div>
                  </div>
                )}
                {status === 'SUCCESS' &&
                  rootTabConfig.map((TabItem) => (
                    <Tab.Panel className={'flex flex-col flex-1'}>
                      <TabItem.Component userDetails={userDetails} userRepos={userRepos} />
                    </Tab.Panel>
                  ))}
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </div>
    </>
  )
}
