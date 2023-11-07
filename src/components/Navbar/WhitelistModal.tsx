import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { BsDiscord } from 'react-icons/bs'
import SVG from 'react-inlinesvg'

import CloseCrossIcon from '@/assets/icons/close-cross.svg'
import { Button } from '@/components/common/buttons'

type WhitelistModalProps = {
  setIsOpen: (val: boolean) => void
  isOpen: boolean
}

export default function WhitelistModal({ setIsOpen, isOpen }: WhitelistModalProps) {
  function closeModal() {
    setIsOpen(false)
  }

  function handleDiscordClick() {
    window.open('https://discord.gg/5bgrgMvb', '_blank')
  }

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
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-[368px] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="w-full flex justify-between align-middle">
                  <Dialog.Title as="h3" className="text-xl font-medium text-gray-900">
                    You’re almost part of beta
                  </Dialog.Title>
                  <SVG onClick={closeModal} src={CloseCrossIcon} className="w-6 h-6 cursor-pointer" />
                </div>
                <div className="mt-6 flex flex-col gap-2.5">
                  <p>Before you can proceed, the Protocol.Land team needs to grant you access.</p>
                  <p>Join our Discord below and ask for an invite in #protocol-land.</p>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={handleDiscordClick}
                    className="w-full justify-center font-medium gap-2"
                    variant="primary-solid"
                  >
                    <BsDiscord className="w-5 h-5 text-white" />
                    Discord
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
