import SVG from 'react-inlinesvg'
import { useNavigate } from 'react-router-dom'

import LogoLight from '@/assets/pl-logo-light.svg'

import SearchBar from './SearchBar'
import UserProfileButton from './UserProfileButton'

export default function Navbar() {
  const navigate = useNavigate()

  function handleLogoClick() {
    navigate('/')
  }

  return (
    <div className="flex justify-between py-4 px-6 border-b-[1px] border-gray-300">
      <div className="flex items-center gap-2">
        <SVG className='text-primary-600' src={LogoLight} width={21} height={32} />
        <h2 onClick={handleLogoClick} className="cursor-pointer text-primary-600 font-bold text-2xl leading-[32px]">
          Protocol.Land
        </h2>
      </div>
      <div className="flex-1 w-full flex justify-end items-center gap-16">
        <SearchBar />
        <UserProfileButton />
      </div>
    </div>
  )
}
