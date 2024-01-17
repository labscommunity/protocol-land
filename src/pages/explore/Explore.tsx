import { useConnection } from '@arweave-wallet-kit-beta/react'
import React, { useState } from 'react'

import { Button } from '@/components/common/buttons'
import CreateProfileModal from '@/components/CreateProfileModal/CreateProfileModal'
import Landing from '@/components/Landing/Landing'
import { Seo } from '@/components/Seo'
import { trackGoogleAnalyticsEvent, trackGoogleAnalyticsPageView } from '@/helpers/google-analytics'
import { defaultMetaTagsData } from '@/helpers/seoUtils'
import { useGlobalStore } from '@/stores/globalStore'

import Activities from './components/Activities'
import Filter from './components/Filter'
import MainContent from './components/MainContent'
import NewRepoModal from './components/NewRepoModal'
import Sidebar from './components/Sidebar'
import { useFetchUserRepos } from './hooks/useFetchUserRepos'

export default function Explore() {
  const [authState] = useGlobalStore((state) => [state.authState])
  const { initFetchUserRepos, fetchUserReposStatus, userRepos } = useFetchUserRepos()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isCreateProfileModalOpen, setIsCreateProfileModalOpen] = React.useState(false)
  const { connect } = useConnection()
  const strategy = React.useMemo(() => localStorage.getItem('wallet_kit_strategy_id'), [authState.isLoggedIn])
  const [selectedFilters, setSelectedFilters] = useState({
    Repositories: true,
    'Pull Requests': true,
    Issues: true,
    Bounties: true,
    Deployments: true,
    Domains: true
  })

  React.useEffect(() => {
    if (strategy) {
      trackGoogleAnalyticsPageView('pageview', '/', 'Home Page Visit')
    }
  }, [strategy])

  React.useEffect(() => {
    if (authState.isLoggedIn) {
      initFetchUserRepos()
    }
  }, [authState.isLoggedIn])

  async function handleNewRepoBtnClick() {
    if (!authState.isLoggedIn) {
      connect()
    } else {
      setIsOpen(true)
    }

    trackGoogleAnalyticsEvent('Repository', 'Create Repository button click', 'Create new repo')
  }

  if (!strategy) {
    return <Landing />
  }

  return (
    <>
      <Seo {...defaultMetaTagsData} title="Protocol.Land | App homepage" />
      <div className="h-full flex flex-1">
        <Sidebar repos={userRepos} isLoading={fetchUserReposStatus === 'PENDING'} />
        <MainContent>
          <div className="w-[70%] lg:w-[85%] xl:w-[80%] 2xl:w-[70%] flex flex-col gap-8">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center flex-row gap-1">
                <span>Latest</span>
                <Filter selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} />
              </div>
              <Button onClick={handleNewRepoBtnClick} variant="primary-solid">
                Create new repo
              </Button>
            </div>
            <Activities filters={selectedFilters} />
          </div>
        </MainContent>
        <NewRepoModal isOpen={isOpen} setIsOpen={setIsOpen} />
        <CreateProfileModal isOpen={isCreateProfileModalOpen} setIsOpen={setIsCreateProfileModalOpen} />
      </div>
    </>
  )
}
