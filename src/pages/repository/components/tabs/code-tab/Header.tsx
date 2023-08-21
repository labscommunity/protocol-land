import { Listbox, Transition } from '@headlessui/react'
import React from 'react'
import { AiOutlineCheck, AiOutlinePlus } from 'react-icons/ai'
import { HiOutlineChevronUpDown } from 'react-icons/hi2'

import { Button } from '@/components/common/buttons'
import useBranch from '@/pages/repository/hooks/useBranch'

const people = [
  { id: 1, name: 'Durward Reynolds', unavailable: false },
  { id: 2, name: 'Kenton Towne', unavailable: false },
  { id: 3, name: 'Therese Wunsch', unavailable: false },
  { id: 4, name: 'Benedict Kessler', unavailable: true },
  { id: 5, name: 'Katelyn Rohan', unavailable: false }
]
export default function Header() {
  const { branches, currentBranch } = useBranch()

  const [selected, setSelected] = React.useState(people[0])

  return (
    <div className="flex justify-between">
      <Listbox value={selected} onChange={setSelected}>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full flex justify-center cursor-default rounded-lg text-[#4388f6] hover:bg-[#4388f6] hover:text-white border-[1.2px] border-[#4388f6] py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 text-md font-medium">
            <span className="block truncate">{currentBranch}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <HiOutlineChevronUpDown className="h-5 w-5 text-[inherit]" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={React.Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none font-medium">
              {branches &&
                branches.map((branch, idx) => (
                  <Listbox.Option
                    key={idx}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-[#4388f6] text-white' : 'text-liberty-dark-100'
                      }`
                    }
                    value={branch}
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {branch}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#4388f6]">
                            <AiOutlineCheck className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      <Button className="rounded-lg flex items-center py-[4px] px-4 font-medium gap-1" variant="solid">
        <AiOutlinePlus className="w-5 h-5" /> Add Files
      </Button>
    </div>
  )
}

//   <Button className="rounded-lg flex items-center py-[4px] px-4 font-medium gap-2" variant="outline">
//     <FiGitBranch /> main <FiChevronDown className="h-5 w-5" aria-hidden="true" />
//   </Button>
