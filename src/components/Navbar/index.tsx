import UserProfileButton from './UserProfileButton'

export default function Navbar() {
  return (
    <div className="flex justify-between py-6 px-16">
      <h2 className="bg-[linear-gradient(90deg,rgba(170,64,255,1)_10%,rgba(169,69,246,1)_16%,rgba(223,91,216,1)_88%)] bg-clip-text text-transparent font-semibold text-3xl">
        Protocol Land
      </h2>

      <UserProfileButton />
    </div>
  )
}
