import UserProfileButton from './UserProfileButton'

export default function Navbar() {
  return (
    <div className="flex justify-between py-6 px-16">
      <h2 className="bg-[radial-gradient(circle_at_left_top,rgb(255,0,120),rgb(255,183,32)_100%)] bg-clip-text text-transparent text-3xl">
        Protocol Land
      </h2>

      <UserProfileButton />
    </div>
  )
}
