import React from 'react'
import { BiSearch } from 'react-icons/bi'
import { useNavigate } from 'react-router-dom'
import { FadeLoader } from 'react-spinners'

import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'

import Dropdown from './components/filters/Dropdown'
import HackathonItem from './components/HackathonItem'

export default function Hackathon() {
  const navigate = useNavigate()
  const [hackathons, status, fetchAllHackathons] = useGlobalStore((state) => [
    state.hackathonState.hackathons,
    state.hackathonState.status,
    state.hackathonActions.fetchAllHackathons
  ])

  React.useEffect(() => {
    fetchAllHackathons()
  }, [])

  function handleCreateHackathonClick() {
    navigate('/hackathon/create')
  }
  return (
    <div className="h-full flex-1 flex flex-col max-w-[960px] px-8 mx-auto w-full my-6 gap-2">
      <div className="w-full flex justify-between gap-6 mb-6">
        <div className="flex items-center w-full p-2 shadow-sm rounded-[8px] bg-white border-primary-300 hover:border-primary-600 focus-within:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] hover:bg-primary-50 border-[1px]">
          <BiSearch className="w-6 h-6 text-primary-600 relative top-[1px]" />
          <input
            type="text"
            disabled
            placeholder="Find your first hackathon"
            className="w-full pl-2 text-base outline-none font-medium focus:outline-none bg-transparent text-primary-900 placeholder:text-primary-600"
          />
        </div>
        <Button variant="primary-solid" className="max-w-[178px] px-4 w-full justify-center font-medium">
          Search
        </Button>
      </div>
      <div className="flex flex-col w-full">
        <div className="flex justify-between">
          <div className="flex gap-4 w-3/4 flex-wrap">
            <Dropdown name="Location" />
            <Dropdown name="Status" />
            <Dropdown name="Duration" />
            <Dropdown name="Level" />
            <Dropdown name="Organizer" />
          </div>
          <div className="flex flex-col w-1/4 items-end justify-between">
            <Dropdown name="Sort By" />
            <Dropdown name="Category" />
          </div>
        </div>
      </div>
      <div className="w-full border-b-[1px] border-gray-200 mt-4" />

      <div className="flex flex-col w-full gap-4">
        <div className="py-2 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-600">Showing {hackathons.length || 0} results</h1>
          <div>
            <Button onClick={handleCreateHackathonClick} variant="primary-solid">
              Create Hackathon
            </Button>
          </div>
        </div>
        <div className="flex flex-col w-full gap-4">
          {/* hackathon items here */}
          {status === 'PENDING' && (
            <div className="min-h-[200px] flex items-center justify-center w-full">
              <FadeLoader color="#56ADD9" />
            </div>
          )}
          {hackathons.length === 0 && status !== 'PENDING' && (
            <div className="w-full py-16 flex justify-center items-center">
              <h1 className="text-gray-600 text-2xl font-thin tracking-wider">No Hackathons at the moment</h1>
            </div>
          )}
          {hackathons.map((item) => {
            return <HackathonItem details={item} />
          })}
        </div>
      </div>
    </div>
  )
}
