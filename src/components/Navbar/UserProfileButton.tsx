import { Menu, Transition } from '@headlessui/react'
import { useActiveAddress, useConnection, useProfileModal, useStrategy } from 'arweave-wallet-kit'
import { Fragment, useEffect, useRef } from 'react'
import { AiFillProfile, AiOutlineProfile } from 'react-icons/ai'
import { BiLogOutCircle, BiSolidLogOutCircle } from 'react-icons/bi'
import { FaUser } from 'react-icons/fa'
import { FiChevronDown } from 'react-icons/fi'

import { useGlobalStore } from '../../store/globalStore'
import Button from '../Button'

export default function UserProfileButton() {
  const [login, logout] = useGlobalStore((state) => [state.login, state.logout])
  const { connected, connect, disconnect } = useConnection()
  const profileModal = useProfileModal()
  const address = useActiveAddress()
  const strategy = useStrategy()

  const connectedRef = useRef(false)

  useEffect(() => {
    if (connected && address && strategy) {
      login({
        isLoggedIn: true,
        address,
        method: strategy
      })

      connectedRef.current = true
    }

    if (connectedRef.current === true && connected === false) {
      logout()
      connectedRef.current = false
    }
  }, [connected, address, strategy])

  function openProfileModal() {
    profileModal.setOpen(true)
  }

  if (!connected) return <Button onClick={connect} text="Login" />
  return (
    <Menu as="div" className="relative inline-block text-left">
      {({ open }) => (
        <>
          <div>
            <Menu.Button
              className={`inline-flex w-full hover:text-[rgb(222,143,23)] justify-center rounded-md bg-black bg-opacity-20 px-6 py-3 text-sm font-medium ${
                open ? `text-[rgb(222,143,23)]` : `text-white`
              } hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
            >
              <FaUser className="h-4 w-4" />
              <FiChevronDown className="ml-2 -mr-1 h-5 w-5" aria-hidden="true" />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-[#ccc] divide-opacity-60 rounded-md bg-[rgba(38,38,44,1)] shadow-lg ring-1 ring-[#ccc] ring-opacity-20 focus:outline-none">
              <div className="px-1 py-1 ">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-black bg-opacity-20 text-[rgb(222,143,23)]' : 'text-[whitesmoke]'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      onClick={openProfileModal}
                    >
                      {active ? (
                        <AiFillProfile className="mr-2 h-5 w-5 text-[rgb(222,143,23)]" aria-hidden="true" />
                      ) : (
                        <AiOutlineProfile className="mr-2 h-5 w-5" aria-hidden="true" />
                      )}
                      Profile
                    </button>
                  )}
                </Menu.Item>
              </div>

              <div className="px-1 py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active ? 'bg-black bg-opacity-20 text-[rgb(222,143,23)]' : 'text-[whitesmoke]'
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                      onClick={disconnect}
                    >
                      {active ? (
                        <BiSolidLogOutCircle className="mr-2 h-5 w-5 text-[rgb(222,143,23)]" aria-hidden="true" />
                      ) : (
                        <BiLogOutCircle className="mr-2 h-5 w-5" aria-hidden="true" />
                      )}
                      Logout
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  )
}
