import React from 'react'

import Button from '../Button'
import LoginModal from '../LoginModal'

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false)

  function openModal() {
    setIsOpen(true)
  }

  return (
    <div className="flex justify-between py-6 px-16">
      <h2 className="bg-[radial-gradient(circle_at_left_top,rgb(255,0,120),rgb(255,183,32)_100%)] bg-clip-text text-transparent text-3xl">
        Protocol Land
      </h2>
      <Button onClick={openModal} text="Login" />
      <LoginModal isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  )
}
