import SVG from 'react-inlinesvg'

import Logo from '@/assets/images/p-logo.svg'
import useAuth from '@/helpers/hooks/useAuth'

import { Button } from '../common/buttons'
import WhitelistModal from '../Navbar/WhitelistModal'

export default function Navbar() {
  const { whitelistModalOpen, setWhitelistModalOpen, handleConnectBtnClick } = useAuth()

  return (
    <div className="w-full h-16 md:h-20 px-0 md:px-6 py-4 justify-between items-center inline-flex">
      <div className="justify-start items-center gap-2 flex cursor-pointer">
        <div className="w-5 h-8 relative">
          <SVG src={Logo} />
        </div>
        <div className="text-white text-2xl font-bold font-lekton leading-7 md:leading-loose">Protocol.Land</div>
      </div>
      <div className="justify-end items-center gap-4 flex">
        <Button className="h-11 px-4 py-2.5" onClick={handleConnectBtnClick} variant="gradient-dark">
          Connect Wallet
        </Button>
        <WhitelistModal isOpen={whitelistModalOpen} setIsOpen={setWhitelistModalOpen} />
      </div>
    </div>
  )
}
