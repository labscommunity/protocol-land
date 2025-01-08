import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import React from 'react'

import Header from './components/Header'
import { rootTabConfig } from './config/rootTabConfig'

export default function OrganizationPage() {
  return (
    <div className="h-full flex-1 flex flex-col max-w-[1280px] px-8 mx-auto w-full mb-6 gap-2">
      <Header />
      <div className="flex-grow container mx-auto py-6 px-4">
        <TabGroup>
          <TabList className={'h-10 inline-flex items-center justify-center rounded-md bg-[hsl(240,4.8%,95.9%)] p-1'}>
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
