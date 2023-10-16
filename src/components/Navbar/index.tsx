import { useNavigate } from 'react-router-dom'

import SearchBar from './SearchBar'
import UserProfileButton from './UserProfileButton'

export default function Navbar() {
  const navigate = useNavigate()

  function handleLogoClick() {
    navigate('/')
  }

  return (
    <div className="flex justify-between py-4 px-16 border-b-[1px] border-[#cbc9f6]">
      <h2
        onClick={handleLogoClick}
        className="cursor-pointer px-2 bg-[linear-gradient(90deg,rgba(170,64,255,1)_10%,rgba(169,69,246,1)_16%,rgba(223,91,216,1)_88%)] bg-clip-text text-transparent font-semibold text-3xl"
      >
        Protocol Land
      </h2>
      <div className="flex-1 w-full flex justify-end items-center gap-16">
        <SearchBar />
        <UserProfileButton />
      </div>
    </div>
  )
}
