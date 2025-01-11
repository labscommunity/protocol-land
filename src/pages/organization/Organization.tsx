import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import React from 'react'
import { useParams } from 'react-router-dom'

import PageNotFound from '@/components/PageNotFound'
import { useGlobalStore } from '@/stores/globalStore'

import Header from './components/Header'
import { rootTabConfig } from './config/rootTabConfig'
import OrgLoader from './OrgLoader'

export default function OrganizationPage() {
  const { username } = useParams()
  const [selectedOrg, fetchAndLoadOrganization] = useGlobalStore((state) => [
    state.organizationState.selectedOrganization,
    state.organizationActions.fetchAndLoadOrganization
  ])

  React.useEffect(() => {
    if (username) {
      fetchAndLoadOrganization(username)
      return
    }
  }, [username])

  React.useEffect(() => {
    const resolvedUsername = selectedOrg.organization?.username

    if (resolvedUsername) {
      window.history.replaceState({}, '', `/#/organization/${resolvedUsername}`)
    }
  }, [username, selectedOrg])

  const isIdle = selectedOrg.status === 'IDLE'
  const isLoading = selectedOrg.status === 'PENDING'
  const isError = selectedOrg.status === 'ERROR'

  if (isLoading || isIdle) {
    return <OrgLoader />
  }

  if (isError) {
    return <PageNotFound />
  }

  return (
    <div className="h-full flex-1 flex flex-col max-w-[1280px] px-8 mx-auto w-full mb-6 gap-2">
      <Header organization={selectedOrg.organization!} />
      <div className="flex-grow container mx-auto py-6 px-4">
        <TabGroup>
          <TabList className={'h-10 inline-flex items-center justify-center rounded-md bg-gray-200 p-1'}>
            {rootTabConfig.map((tab) => (
              <Tab
                key={tab.title}
                className={
                  'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all disabled:pointer-events-none outline-none focus:outline-none disabled:opacity-50 data-[selected]:bg-white data-[selected]:text-black data-[selected]:shadow-sm'
                }
              >
                {tab.title}
              </Tab>
            ))}
          </TabList>
          <TabPanels className={'mt-4'}>
            {rootTabConfig.map((tab) => (
              <TabPanel key={tab.title}>
                <tab.Component />
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  )
}
