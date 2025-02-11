import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import React from 'react'
import { toast } from 'react-hot-toast'
import { useParams } from 'react-router-dom'

import PageNotFound from '@/components/PageNotFound'
import { useGlobalStore } from '@/stores/globalStore'
import { OrgMemberInvite } from '@/types/orgs'

import Header from './components/Header'
import { rootTabConfig } from './config/rootTabConfig'
import OrgLoader from './OrgLoader'

export default function OrganizationPage() {
  const { username } = useParams()
  const [address, selectedOrg, fetchAndLoadOrganization, acceptInvite, rejectInvite] = useGlobalStore((state) => [
    state.authState.address,
    state.organizationState.selectedOrganization,
    state.organizationActions.fetchAndLoadOrganization,
    state.organizationActions.acceptInvite,
    state.organizationActions.rejectInvite
  ])
  const [isProcessingAcceptInvite, setIsProcessingAcceptInvite] = React.useState(false)
  const [isProcessingRejectInvite, setIsProcessingRejectInvite] = React.useState(false)
  const [processingInviteSuccess, setProcessingInviteSuccess] = React.useState(false)
  const [orgInvite, setOrgInvite] = React.useState<OrgMemberInvite | null>(null)

  React.useEffect(() => {
    if (username) {
      fetchAndLoadOrganization(username)
      return
    }
  }, [username])

  React.useEffect(() => {
    if (selectedOrg.organization && address) {
      const invite = selectedOrg.organization?.memberInvites.find(
        (invitation) => invitation.address === address && invitation.status === 'INVITED'
      )
      if (invite) {
        setOrgInvite(invite)
      }

      if (processingInviteSuccess) {
        setProcessingInviteSuccess(false)
      }
    }
  }, [selectedOrg, address, processingInviteSuccess])

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

  async function handleAcceptInvite() {
    setIsProcessingAcceptInvite(true)
    const success = await acceptInvite(selectedOrg.organization!.id)
    if (!success) {
      toast.error('Failed to accept invite')
    } else {
      toast.success('Invite accepted')
      setProcessingInviteSuccess(true)
    }
    setIsProcessingAcceptInvite(false)
  }

  async function handleRejectInvite() {
    setIsProcessingRejectInvite(true)
    const success = await rejectInvite(selectedOrg.organization!.id)
    if (!success) {
      toast.error('Failed to reject invite')
    } else {
      toast.success('Invite rejected')
      setProcessingInviteSuccess(true)
    }
    setIsProcessingRejectInvite(false)
  }

  return (
    <div className="h-full flex-1 flex flex-col max-w-[1280px] px-8 mx-auto w-full mb-6 gap-2">
      <Header organization={selectedOrg.organization!} />
      {orgInvite && (
        <div className="bg-yellow-500/20 py-4">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <p className="text-sm text-yellow-800">
              You have been invited to join this organization as {orgInvite.role.toLocaleLowerCase()}. You can accept or
              reject the invitation.
            </p>
            <div className="flex gap-2">
              <button
                disabled={isProcessingAcceptInvite}
                onClick={handleAcceptInvite}
                className="cursor-pointer text-sm text-green-600 font-semibold bg-green-500/20 px-2 py-1 rounded-sm"
              >
                {isProcessingAcceptInvite ? 'Processing...' : 'Accept'}
              </button>

              <button
                disabled={isProcessingRejectInvite}
                onClick={handleRejectInvite}
                className="cursor-pointer text-sm text-red-600 font-semibold bg-red-500/20 px-2 py-1 rounded-sm"
              >
                {isProcessingRejectInvite ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
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
