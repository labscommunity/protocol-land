import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { Maybe } from 'yup'

import { ArNSNames } from '@/types/user'

import SetArNSUserName from './SetArNSUserName'
import SetCustomUserName from './SetCustomUserName'
import SetUserNameMode from './SetUserNameMode'

type NewRepoModalProps = {
  setIsOpen: (val: boolean) => void
  isOpen: boolean
  arNSNames: ArNSNames | undefined
  isArNSName: boolean | undefined
  currentName: Maybe<string | undefined>
  onUsernameChange: (value: string) => void
}

export type Mode = 'ARNS' | 'CUSTOM' | 'NONE'

export default function UsernameModal({
  setIsOpen,
  isOpen,
  arNSNames = {},
  isArNSName,
  currentName = '',
  onUsernameChange
}: NewRepoModalProps) {
  const [mode, setMode] = useState<Mode>('NONE')

  function closeModal() {
    setIsOpen(false)
    setMode('NONE')
  }

  function handleModeChange(mode: Mode) {
    setMode(mode)
  }

  function handleModeGoBack() {
    setMode('NONE')
  }

  const arNSNamesArr = Object.keys(arNSNames)

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center text-center">
            {mode === 'NONE' && <SetUserNameMode setMode={handleModeChange} closeModal={closeModal} />}
            {mode === 'ARNS' && (
              <SetArNSUserName
                arNSNamesArr={arNSNamesArr}
                currentName={currentName}
                isArNSName={isArNSName}
                onUsernameChange={onUsernameChange}
                closeModal={closeModal}
                goBack={handleModeGoBack}
              />
            )}
            {mode === 'CUSTOM' && (
              <SetCustomUserName
                closeModal={closeModal}
                onUsernameChange={onUsernameChange}
                goBack={handleModeGoBack}
              />
            )}
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
