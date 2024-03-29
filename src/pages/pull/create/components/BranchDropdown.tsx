import { Listbox, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { AiOutlineCaretDown } from 'react-icons/ai'

type Props = {
  label: string
  items: string[]
  selectedItem: string
  setSelectedItem: (item: string) => void
}

export default function BranchDropdown({ selectedItem, setSelectedItem, items, label }: Props) {
  return (
    <Listbox value={selectedItem} onChange={setSelectedItem}>
      <div className="relative mt-1">
        <Listbox.Button className="relative w-60 text-gray-900 flex gap-2 items-center justify-between cursor-default rounded-lg bg-white py-2 px-3 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
          <div className="flex gap-2 overflow-hidden">
            <Listbox.Label>{label}:</Listbox.Label>
            <span className="block truncate font-medium ">{selectedItem}</span>
          </div>
          <span>
            <AiOutlineCaretDown className="w-4 h-4" />
          </span>
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {items.map((item, idx) => (
              <Listbox.Option
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-primary-100 text-gray-900' : 'text-gray-900'
                  }`
                }
                key={idx}
                value={item}
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{item}</span>
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}
