import SVG from 'react-inlinesvg'

import CLabsIcon from '@/assets/icons/CLabs.svg'
import CLabsTextIcon from '@/assets/icons/CLabsText.svg'

export default function Footer() {
  return (
    <div
      className={`w-full flex flex-col justify-center items-center py-20 gap-10 bg-[url("/footer-background.svg")] bg-no-repeat bg-center`}
    >
      <div className="flex flex-col justify-center items-center">
        <div className="text-white text-base font-bold font-lekton leading-10">In collaboration with</div>
        <SVG src={CLabsTextIcon} />
      </div>

      <div
        className="w-full flex py-3 px-4 items-center justify-between gap-3 md:hidden"
        style={{
          background:
            'conic-gradient(from 183deg at 109.77% 53.65%, rgba(111, 62, 252, 0.50) 0deg, rgba(255, 255, 255, 0.50) 225deg)'
        }}
      >
        <div className="opacity-70 text-center text-white text-sm font-medium font-manrope leading-loose">Arweave</div>
        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        <div className="opacity-70 text-center text-white text-sm font-medium font-manrope leading-loose">
          Building on the Permaweb
        </div>
        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        <SVG className="w-8 h-8" src={CLabsIcon} />
      </div>

      <div className="flex flex-col">
        <div className="text-center text-white text-xl font-extralight leading-loose flex flex-col gap-10">
          <div className="flex flex-col">
            <span>Protocol.land © 2024</span>
            <span>All Rights Reserved</span>
          </div>
          <span className="cursor-pointer hover:underline">Privacy Policy</span>
        </div>
      </div>
    </div>
  )
}
