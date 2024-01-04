import SVG from 'react-inlinesvg'

import SpiralArrowIcon from '@/assets/icons/spiral-arrow.svg'
import Repo from '@/assets/images/Repo.svg'

export default function Header() {
  return (
    <div className="w-full py-16 md:pt-28 md:pb-10 flex-col justify-start items-center gap-14 inline-flex">
      <div className="flex-col justify-start items-center gap-6 inline-flex">
        <div className="text-center text-blue-300 text-4xl md:text-6xl font-bold font-lekton leading-10">
          Code collaboration, <span className="underlined after:mb-[-3px] md:after:mb-0">reimagined</span>
        </div>

        <div className="text-center text-white text-base md:text-xl font-normal font-inter leading-loose">
          Decentralized, source controlled, code collaboration where you own your code.
        </div>

        <div className="pt-4 justify-start items-start gap-4 inline-flex">
          <div className="justify-end items-center gap-4 flex">
            <div
              className="px-4 py-2.5 rounded-lg justify-center items-center gap-2 flex"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.50)',
                background:
                  'linear-gradient(275deg, rgba(255, 255, 255, 0.50) -23.79%, rgba(255, 255, 255, 0.00) 141.13%)',
                boxShadow: '0px 2px 4px 0px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="text-white text-base font-medium font-inter leading-normal cursor-pointer">
                Create a repo
              </div>
            </div>
            <div className="px-4 py-2.5 rounded-lg shadow border border-white border-opacity-50 justify-center items-center gap-2 flex">
              <div className="text-white text-base font-medium font-inter leading-normal cursor-pointer">See docs</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative hidden md:block text-center text-blue-300 text-xl font-medium font-inter leading-loose">
        Try it below!
        <div className="absolute flex justify-center top-10 left-[40%]">
          <SVG src={SpiralArrowIcon} />
        </div>
      </div>

      <div className="relative drop-shadow-default">
        <SVG src={Repo} className="w-full h-full" />
      </div>
    </div>
  )
}
