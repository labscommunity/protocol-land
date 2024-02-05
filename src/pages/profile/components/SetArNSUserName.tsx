import { Dialog, Listbox, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import React from 'react'
import { AiOutlineCheck } from 'react-icons/ai'
import { FiChevronDown } from 'react-icons/fi'
import SVG from 'react-inlinesvg'
import { Maybe } from 'yup'

import CloseCrossIcon from '@/assets/icons/close-cross.svg'
import { Button } from '@/components/common/buttons'

type Props = {
  closeModal: () => void
  arNSNamesArr: string[]
  isArNSName: boolean | undefined
  currentName: Maybe<string | undefined>
  onUsernameChange: (value: string, type: string) => void
  goBack: () => void
}

Button

export default function SetArNSUserName({
  closeModal,
  goBack,
  arNSNamesArr,
  isArNSName,
  currentName,
  onUsernameChange
}: Props) {
  const [currentValue, setCurrentValue] = React.useState(() => (isArNSName && currentName ? currentName : 'Select...'))

  async function handleContinueClick() {
    onUsernameChange(currentValue, 'arns')
    closeModal()
  }

  return (
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <Dialog.Panel className="w-full max-w-[368px] transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
        <div className="w-full flex justify-between align-middle">
          <Dialog.Title as="h3" className="text-xl font-medium text-gray-900">
            Set Username
          </Dialog.Title>
          <SVG onClick={closeModal} src={CloseCrossIcon} className="w-6 h-6 cursor-pointer" />
        </div>
        <div className="mt-6 flex flex-col gap-2.5">
          <div>
            <label htmlFor="title" className="block mb-1 text-sm font-medium text-gray-600">
              ArNS
            </label>
            <Listbox
              disabled={arNSNamesArr.length === 0}
              value={currentValue || 'Select...'}
              onChange={setCurrentValue}
            >
              <div className="relative">
                <Listbox.Button className="relative w-[320px] flex justify-between items-center cursor-default rounded-lg bg-white hover:bg-primary-50 hover:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] text-gray-500 border-[1px] border-gray-300 py-[10px] px-3 text-left focus:outline-none text-md font-medium">
                  {({ open, value }) => (
                    <>
                      <span className="block truncate">{value}</span>
                      {open && <FiChevronDown className="ml-2 -mr-1 h-5 w-5 rotate-180" aria-hidden="true" />}
                      {!open && <FiChevronDown className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />}
                    </>
                  )}
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="z-20 absolute mt-2 w-full max-h-60 overflow-auto rounded-lg bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.10)] focus:outline-none font-medium border-[1px] border-gray-300">
                    {arNSNamesArr.map((name, idx) => (
                      <Listbox.Option
                        key={idx}
                        className={({ active }) =>
                          `relative cursor-default select-none py-[10px] px-4 ${
                            active ? 'bg-primary-50 text-gray-900' : 'text-gray-700'
                          }`
                        }
                        value={name}
                      >
                        {({ selected }) => (
                          <span>
                            <span
                              className={`flex items-center justify-between truncate ${
                                selected ? 'font-medium' : 'font-normal'
                              }`}
                            >
                              {name}
                              <span className="flex items-center">
                                {name === currentName && isArNSName && (
                                  <span
                                    className={`border-[1px] border-primary-600 text-primary-600 rounded-full px-2 text-sm`}
                                  >
                                    current
                                  </span>
                                )}
                                {selected ? (
                                  <span className="flex items-center pl-3 text-primary-600">
                                    <AiOutlineCheck className="h-5 w-5" aria-hidden="true" />
                                  </span>
                                ) : null}
                              </span>
                            </span>
                          </span>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
        </div>
        <div className="w-full mt-4 flex flex-col gap-2">
          <Button
            // isLoading={isSubmitting}
            disabled={currentValue.length === 0}
            onClick={handleContinueClick}
            className="w-full justify-center font-medium"
            variant="primary-solid"
          >
            Continue
          </Button>
          <Button onClick={() => goBack()} className="w-full justify-center font-medium" variant="primary-outline">
            Go back
          </Button>
        </div>
      </Dialog.Panel>
    </Transition.Child>
  )
}
