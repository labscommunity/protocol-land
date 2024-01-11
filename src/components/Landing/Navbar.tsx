import clsx from 'clsx'
import React from 'react'
import { AiOutlineClose } from 'react-icons/ai'
import { RxHamburgerMenu } from 'react-icons/rx'
import SVG from 'react-inlinesvg'
import { useNavigate } from 'react-router-dom'

import Logo from '@/assets/images/p-logo.svg'
import useAuth from '@/helpers/hooks/useAuth'

import { Button } from '../common/buttons'
import WhitelistModal from '../Navbar/WhitelistModal'

const NAV_ITEMS = [
  {
    name: 'Home',
    path: '/'
  },
  {
    name: 'Blog',
    path: '/blog'
  },
  {
    name: 'Docs',
    path: 'https://docs.protocol.land',
    external: true
  }
]

export default function Navbar() {
  const { connected, address, whitelistModalOpen, setWhitelistModalOpen, handleConnectBtnClick } = useAuth()
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false)
  const navigate = useNavigate()

  function createNavItemClickHandler(path: string, external: boolean = false) {
    return function handleClick() {
      if (external) {
        window.open(path, '_blank')
      } else {
        navigate(path)
      }
    }
  }

  function toggleMobileNavOpen() {
    setIsMobileNavOpen((prev) => !prev)
  }

  return (
    <>
      <div className="w-full h-16 md:h-20 px-5 md:px-6 py-4 justify-between items-center inline-flex">
        <div onClick={createNavItemClickHandler('/')} className="justify-start items-center gap-2 flex cursor-pointer">
          <div className="w-5 h-8 relative">
            <SVG src={Logo} />
          </div>
          <div className="text-white text-2xl font-bold font-lekton leading-7 md:leading-loose">Protocol.Land</div>
        </div>
        <div className="hidden gap-6 font-inter text-xl text-white items-center sm:flex">
          {NAV_ITEMS.map((item) => (
            <span
              onClick={createNavItemClickHandler(item.path, item.external)}
              className="cursor-pointer hover:text-primary-400"
            >
              {item.name}
            </span>
          ))}
        </div>
        <div className="sm:hidden flex justify-end items-center">
          {!isMobileNavOpen && <RxHamburgerMenu onClick={toggleMobileNavOpen} className="text-white h-8 w-8" />}
          {isMobileNavOpen && <AiOutlineClose onClick={toggleMobileNavOpen} className="text-white h-8 w-8" />}
        </div>
        <div className="hidden justify-end items-center gap-4 sm:flex">
          <Button
            className="h-11 px-4 py-2.5"
            onClick={handleConnectBtnClick}
            variant="gradient-dark"
            isLoading={connected || !!address}
            loadingText="Connecting..."
          >
            Connect Wallet
          </Button>
          <WhitelistModal isOpen={whitelistModalOpen} setIsOpen={setWhitelistModalOpen} />
        </div>
      </div>
      <div
        className={clsx('w-full items-center flex flex-col gap-6', {
          'max-h-[500px] py-6 transition-all duration-300 ease-in': isMobileNavOpen,
          'max-h-[0px] py-0 overflow-hidden transition-all duration-300 ease-out': !isMobileNavOpen
        })}
      >
        <div className="gap-6 font-inter text-xl text-white items-center flex flex-col">
          {NAV_ITEMS.map((item) => (
            <span
              onClick={createNavItemClickHandler(item.path, item.external)}
              className="cursor-pointer hover:text-primary-400"
            >
              {item.name}
            </span>
          ))}
        </div>
        <Button
          className="h-11 px-4 py-2.5"
          onClick={handleConnectBtnClick}
          variant="gradient-dark"
          isLoading={connected || !!address}
          loadingText="Connecting..."
        >
          Connect Wallet
        </Button>
        <WhitelistModal isOpen={whitelistModalOpen} setIsOpen={setWhitelistModalOpen} />
      </div>
    </>
  )
}
