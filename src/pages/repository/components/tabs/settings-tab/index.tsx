import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'

import { tabConfig } from './tabConfig'

const activeClasses = 'text-gray-900 font-medium'

export default function SettingsTab() {
  return (
    <div className="w-full px-2 pb-6 flex gap-8 flex-1">
      <TabGroup className={'flex w-full'} vertical>
        <TabList className={'text-gray-500 text-lg border-r-[1px] border-gray-200 flex flex-col px-2 w-[16%]'}>
          {tabConfig.map((tab) => (
            <Tab className="focus-visible:outline-none">
              {({ selected }) => (
                <div className={`flex items-center py-2  px-2 ${selected ? activeClasses : ''}`}>{tab.title}</div>
              )}
            </Tab>
          ))}
        </TabList>
        <TabPanels className={'w-full'}>
          {tabConfig.map((TabContent) => (
            <TabPanel className={'w-full px-8'}>
              <TabContent.Component />
            </TabPanel>
          ))}
        </TabPanels>
      </TabGroup>
    </div>
  )
}
