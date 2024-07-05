import { useConnection } from '@arweave-wallet-kit-beta/react'
import React from 'react'
import { useNavigate } from 'react-router-dom'

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

export default function Home() {
  const navigate = useNavigate()
  const [authState] = useGlobalStore((state) => [state.authState])
  const { initFetchUserRepos, fetchUserReposStatus, userRepos } = useFetchUserRepos()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isCreateProfileModalOpen, setIsCreateProfileModalOpen] = React.useState(false)
  const { connect } = useConnection()
  const strategy = React.useMemo(() => localStorage.getItem('wallet_kit_strategy_id'), [authState.isLoggedIn])
  const [selectedFilters, setSelectedFilters] = React.useState({
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

  async function handleImportButton() {
    trackGoogleAnalyticsEvent('Repository', 'Import Repository button click', 'Import new repo')

    window.open('https://docs.protocol.land/working-with-repositories/import-a-repository-from-github', '_blank')
  }

  function handleHackathonExploreClick() {
    navigate('/hackathon')
  }

  if (!strategy) {
    return <Landing />
  }

  return (
    <>
      <Seo {...defaultMetaTagsData} title="Protocol.Land | App homepage" />
      <div className="h-full flex flex-1">
        <Sidebar repos={userRepos} isLoading={fetchUserReposStatus === 'PENDING'} setIsRepoModalOpen={setIsOpen} />
        <MainContent>
          <div className="lg:w-[85%] xl:w-[80%] 2xl:w-[70%] py-8 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row gap-8 w-full">
              <div
                className={
                  'bg-primary-100 p-6 min-h-[200px] w-full flex flex-col items-center gap-4 justify-center rounded-2xl border-[1px] border-primary-200'
                }
              >
                <div className="flex flex-col text-center gap-2">
                  <h1 className="text-2xl font-bold tracking-wide text-primary-600">Participate in Hackathons</h1>
                  <p className="text-base font-medium text-primary-500">
                    Host or Participate in Hackathons, build within the deadlines and earn prizes.
                  </p>
                </div>
                <Button onClick={handleHackathonExploreClick} variant="primary-solid">
                  Explore
                </Button>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-8 w-full">
              <div
                className={
                  'bg-primary-100 p-6 min-h-[200px] w-full flex flex-col items-center gap-4 justify-center rounded-2xl border-[1px] border-primary-200'
                }
              >
                <div className="flex flex-col text-center gap-2">
                  <h1 className="text-2xl font-bold tracking-wide text-primary-600">Create a new repository</h1>
                  <p className="text-base font-medium text-primary-500">
                    Start a new project from scratch, invite collaborators and get rolling within seconds.
                  </p>
                </div>
                <Button onClick={handleNewRepoBtnClick} variant="primary-solid">
                  Create
                </Button>
              </div>
              <div
                className={
                  'bg-primary-100 p-6 min-h-[200px] w-full flex flex-col items-center gap-4 justify-center rounded-xl'
                }
              >
                <div className="flex flex-col text-center text-[whitesmoke] gap-2">
                  <h1 className="text-2xl font-bold tracking-wide text-primary-600">Import an existing repository</h1>
                  <p className="text-base font-medium text-primary-500">
                    Bring your existing repository from Github, Gitlab etc. and continue where you left off.
                  </p>
                </div>
                <Button onClick={handleImportButton} variant="primary-solid">
                  Import
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center flex-row gap-2">
                <span>Latest</span>
                <Filter selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} />
              </div>
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
