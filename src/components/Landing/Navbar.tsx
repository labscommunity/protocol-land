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

  return (
    <div className="w-full h-16 md:h-20 px-0 md:px-6 py-4 justify-between items-center inline-flex">
      <div onClick={createNavItemClickHandler('/')} className="justify-start items-center gap-2 flex cursor-pointer">
        <div className="w-5 h-8 relative">
          <SVG src={Logo} />
        </div>
        <div className="text-white text-2xl font-bold font-lekton leading-7 md:leading-loose">Protocol.Land</div>
      </div>
      <div className="flex gap-6 font-inter text-xl text-white items-center">
        {NAV_ITEMS.map((item) => (
          <span onClick={createNavItemClickHandler(item.path, item.external)} className="cursor-pointer hover:text-primary-400">
            {item.name}
          </span>
        ))}
      </div>
      <div className="justify-end items-center gap-4 flex">
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
  )
}
