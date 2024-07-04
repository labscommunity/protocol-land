import { Tab } from '@headlessui/react'
import clsx from 'clsx'
import React from 'react'
import { FaArrowLeft, FaDotCircle } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'

import { detailsTabConfig } from './config/detailsTabConfig'
import { HACKATHON_ITEMS } from './utils/constants'
import { getHackathonStatus } from './utils/getHackathonStatus'

export default function HackathonDetails() {
  const { tabName } = useParams()
  console.log({ tabName })
  const [status, setStatus] = React.useState('NOT_STARTED')
  const navigate = useNavigate()

  const details = HACKATHON_ITEMS[0]
  const statusText = React.useMemo<string>(() => getHackathonStatus(details.startsAt, details.endsAt, setStatus), [])

  const selectedIndex = React.useMemo(() => {
    if (!tabName) return 0
    const tabNames = detailsTabConfig.map((tab) => tab.title.toLocaleLowerCase())

    return tabNames.indexOf(tabName)
  }, [tabName])
  function goBack() {
    navigate(`/hackathon`)
  }

  function handleTabChangeEventTracking(idx: number) {
    const tab = detailsTabConfig[idx]

    const targetPath = tab.getPath(details.id, tab.title.toLocaleLowerCase())

    navigate(targetPath)

    if (tab) {
      trackGoogleAnalyticsEvent('Hackathon Details', 'Tab click to change active tab', 'Change tab', {
        tab: tab.title,
        hackathon_name: details.title,
        hackathon_id: details.id
      })
    }
  }
  const activeClasses = 'border-b-[2px] border-primary-600 text-gray-900 font-medium'

  return (
    <div className="h-full flex-1 flex flex-col max-w-[960px] px-8 mx-auto w-full my-6 gap-2">
      {/* HACKATHON HEADER */}
      <div className="flex justify-between">
        <Button onClick={goBack} variant="primary-solid">
          <FaArrowLeft className="h-4 w-4 text-white" />
        </Button>

        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2">
            <FaDotCircle
              className={clsx({
                'w-4 h-4': true,
                'text-success-600': status === 'RUNNING',
                'text-red-600': status === 'ENDED',
                'text-gray-600': status === 'NOT_STARTED'
              })}
            />
            <span className="text-gray-900 font-medium text-sm">{statusText?.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-1">
            <h1 className="text-gray-900 font-medium text-sm">Hackathon</h1>
            <span>|</span>
            <h1 className="text-gray-900 font-medium text-sm">{details?.location}</h1>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6 py-4">
        <div className="flex flex-col gap-2">
          <img src={details.hackathonLogo} className="w-12 h-12 rounded-full" />
          <div className="flex flex-col">
            <h1 className="font-medium text-gray-900 text-lg">{details.title}</h1>
            <p className="font-normal text-gray-600 text-base">{details.shortDescription}</p>
          </div>
        </div>
        <div className="flex flex-col">
          <Button variant="primary-solid">Submit</Button>
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <Tab.Group onChange={handleTabChangeEventTracking} selectedIndex={selectedIndex}>
          <Tab.List className="flex text-gray-500 text-lg gap-10 border-b-[1px] border-gray-200">
            {detailsTabConfig.map((tab, index) => (
              <Tab className="focus-visible:outline-none" key={index}>
                {({ selected }) => (
                  <div
                    className={`flex items-center gap-2 py-[10px] px-4 justify-center ${selected ? activeClasses : ''}`}
                  >
                    <tab.Icon className="w-5 h-5" />
                    {tab.title}
                  </div>
                )}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className={'mt-4 flex flex-col flex-1'}>
            {detailsTabConfig.map((TabItem) => (
              <Tab.Panel className={'flex flex-col flex-1'}>
                <TabItem.Component />
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>

      {/* HACKATHON Body */}
    </div>
  )
}
