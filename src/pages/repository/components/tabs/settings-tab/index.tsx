import { Tab } from '@headlessui/react'

import { tabConfig } from './tabConfig'

const activeClasses = 'text-[#8a6bec] font-medium'

export default function SettingsTab() {
  return (
    <div className="w-full px-2 pb-6 flex gap-8 flex-1">
      <Tab.Group vertical>
        <Tab.List
          className={'text-liberty-dark-100 text-lg border-r-[1px] border-[#cbc9f6] flex flex-col px-2 w-[16%]'}
        >
          {tabConfig.map((tab) => (
            <Tab className="focus-visible:outline-none">
              {({ selected }) => (
                <div className={`flex items-center py-2  px-2 ${selected ? activeClasses : ''}`}>{tab.title}</div>
              )}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className={'w-full'}>
          {tabConfig.map((TabContent) => (
            <Tab.Panel className={'w-full'}>
              <TabContent.Component />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}
