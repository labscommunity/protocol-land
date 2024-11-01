import React, { useState } from 'react'
import { FaAngleRight } from 'react-icons/fa'
import { MdOutlineClose } from 'react-icons/md'

export default function Banner() {
  const [showBanner, setShowBanner] = useState(true)
  function handleCloseBanner() {
    setShowBanner(false)
  }

  if (!showBanner) return null
  return (
    <div className="py-4 min-w-[100vw] flex absolute top-[1.4%] left-0 bg-primary-600">
      <div className="px-8 w-full flex justify-center items-center gap-4">
        <h1 className="text-lg text-center font-medium text-white  bg-opacity-60 rounded-lg">
          Sign up for Protocol.Land's Builder Program Powered by AO Ventures! Nov 14 - Dec 12
        </h1>
        <span
          onClick={() => window.open('https://www.aoventures.io/protocol-land-builder-program', '_blank')}
          className="text-white text-lg font-medium underline flex items-center gap-1 cursor-pointer"
        >
          Learn more <FaAngleRight />
        </span>
      </div>
      <div className="px-8 absolute right-0 top-2 cursor-pointer" onClick={handleCloseBanner}>
        <MdOutlineClose className="text-white text-xl" />
      </div>
    </div>
  )
}
