import SVG from 'react-inlinesvg'

import Logo from '@/assets/images/p-logo.svg'

export default function Navbar() {
  return (
    <div className="w-full h-16 md:h-20 px-0 md:px-6 py-4 justify-between items-center inline-flex">
      <div className="justify-start items-center gap-2 flex cursor-pointer">
        <div className="w-5 h-8 relative">
          <SVG src={Logo} />
        </div>
        <div className="text-white text-2xl font-bold font-lekton leading-7 md:leading-loose">Protocol.Land</div>
      </div>
      <div className="justify-end items-center gap-4 flex">
        <div
          className="h-11 px-4 py-2.5 justify-center items-center gap-2 inline-flex rounded-lg"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.50)',
            background: 'linear-gradient(275deg, rgba(255, 255, 255, 0.50) -23.79%, rgba(255, 255, 255, 0.17) 141.13%)',
            boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="text-white text-sm md:text-base font-medium font-inter leading-normal cursor-pointer">
            Connect Wallet
          </div>
        </div>
      </div>
    </div>
  )
}
