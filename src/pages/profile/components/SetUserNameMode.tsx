import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import SVG from 'react-inlinesvg'

import CloseCrossIcon from '@/assets/icons/close-cross.svg'

import { Mode } from './UsernameModal'

type Props = {
  closeModal: () => void
  setMode: (mode: Mode) => void
}

export default function SetUserNameMode({ closeModal, setMode }: Props) {
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
            Select Preferred Type
          </Dialog.Title>
          <SVG onClick={closeModal} src={CloseCrossIcon} className="w-6 h-6 cursor-pointer" />
        </div>
        <div className="flex flex-col w-full h-full gap-2 py-2">
          <div
            onClick={() => setMode('ARNS')}
            className="w-full h-full flex justify-center items-center py-8 hover:bg-primary-100 hover:rounded-xl cursor-pointer font-medium"
          >
            <h2 className="text-primary-700 text-xl">ArNS</h2>
          </div>
          <div className="flex py-1 items-center w-full text-gray-300 gap-2">
            <div className="h-[1px] bg-gray-300 w-full" />
            <span className="text-sm">OR</span>
            <div className="h-[1px] bg-gray-300 w-full" />
          </div>
          <div
            onClick={() => setMode('CUSTOM')}
            className="w-full h-full flex justify-center items-center py-8 hover:bg-primary-100 hover:rounded-xl cursor-pointer font-medium"
          >
            <h2 className="text-primary-700 text-xl">Custom</h2>
          </div>
        </div>
      </Dialog.Panel>
    </Transition.Child>
  )
}
