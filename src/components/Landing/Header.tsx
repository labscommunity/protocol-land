import SVG from 'react-inlinesvg'

import SpiralArrowIcon from '@/assets/icons/spiral-arrow.svg'
import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'
import useAuth from '@/helpers/hooks/useAuth'
import Banner from '@/pages/home/components/Banner'

import { Button } from '../common/buttons'
import { InteractiveRepo } from './InteractiveRepo'

export default function Header() {
  const { handleConnectBtnClick } = useAuth()

  function handleSeeDocsBtnClick() {
    trackGoogleAnalyticsEvent('Landing', 'See docs button click', 'See docs Button')
    window.open('https://docs.protocol.land', '_blank')
  }

  return (
    <div className="w-full py-16 md:pt-28 md:pb-10 flex-col justify-start items-center gap-14 inline-flex">
      <Banner />
      <div className="flex-col justify-start items-center gap-6 inline-flex">
        <div className="text-center text-primary-400 text-4xl md:text-6xl font-bold font-lekton leading-10">
          Code collaboration, <div className="inline-block underlined after:mb-[-1px] md:after:mb-0">reimagined</div>
        </div>

        <div className="text-center text-white text-base md:text-xl font-normal font-inter leading-loose">
          Decentralized, source controlled, code collaboration where you own your code.
        </div>

        <div className="pt-4 justify-start items-start gap-4 inline-flex">
          <div className="justify-end items-center gap-4 flex">
            <Button className="h-11 px-4 py-2.5" variant="gradient-dark" onClick={handleConnectBtnClick}>
              Create a repo
            </Button>
            <div
              className="px-4 py-2.5 rounded-lg shadow border border-white border-opacity-50 justify-center items-center gap-2 flex text-white text-base font-medium font-inter leading-normal cursor-pointer hover:text-gray-300 hover:border-primary-800"
              onClick={handleSeeDocsBtnClick}
            >
              See docs
            </div>
          </div>
        </div>
      </div>

      <div className="relative hidden md:block text-center text-primary-400 text-xl font-medium font-inter leading-loose">
        Try it below!
        <div className="absolute flex justify-center top-10 left-[40%]">
          <SVG src={SpiralArrowIcon} />
        </div>
      </div>

      <div className="relative drop-shadow-default w-full h-full">
        <InteractiveRepo />
      </div>
    </div>
  )
}
