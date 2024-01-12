import SVG from 'react-inlinesvg'

import ArweaveIcon from '@/assets/icons/arweave.svg'
import CloudCheckIcon from '@/assets/icons/cloud-check.svg'
import FolderCodeIcon from '@/assets/icons/folder-code.svg'
import GraphBarIcon from '@/assets/icons/graph-bar.svg'
import Line from '@/assets/images/line.svg'
import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'
import { openInNewTab } from '@/helpers/openInNewTab'

import { Button } from '../common/buttons'

const features = [
  {
    title: 'Simple back-up',
    description: 'Back-up existing code, on a platform backed by permanent storage',
    icon: FolderCodeIcon
  },
  {
    title: 'Full ownership',
    description: 'You code is fully owned by you, from creation to shipping',
    icon: CloudCheckIcon
  },
  {
    title: 'Transparent metrics',
    description: 'Immutable Contribution Graphs that cannot be altered',
    icon: GraphBarIcon
  }
]

export default function BackedByArweave() {
  function handleExploreArweaveBtnClick() {
    trackGoogleAnalyticsEvent('Landing', 'Explore Arweave button click', 'Explore Arweave Button')
    openInNewTab('https://viewblock.io/arweave/tx/OYL0nXU8UrQm9ekQB7vgXFuvM3LcVDsaSQfQ7-p7u7U')
  }

  return (
    <div className="w-full py-[60px] gap-[60px] flex flex-col items-center justify-center">
      <div className="flex flex-col gap-4 text-center">
        <div className="text-white text-base font-semibold font-inter leading-normal">Own</div>
        <div className="text-center text-white text-5xl font-bold font-lekton">
          <span className="leading-10">All stored permanently on </span>
          <span className="text-primary-400 text-5xl font-bold font-lekton leading-10">Arweave</span>
          <span className="text-white text-5xl font-bold font-lekton leading-10">, owned by you</span>
        </div>
        <div className="text-center text-white text-lg font-normal font-inter leading-relaxed">
          Complete transparency on how your code repos are being stored
        </div>
      </div>
      <div className="relative flex flex-col gap-[60px] justify-center items-center">
        <SVG
          className="w-20 h-20 p-4 bg-white rounded-full border border-zinc-500"
          style={{
            boxShadow: '0px 0px 20px -1.441px #77C6ED'
          }}
          src={ArweaveIcon}
        />

        <div className="absolute top-0 border-dotted h-[140px] -z-10 border-2 border-sky-500 border-b-0 border-l-0"></div>

        <div className="hidden min-[1300px]:block absolute top-10 border-dotted w-[90%] h-[100px] -z-10 border-2 border-sky-500 border-b-0">
          <div className="relative w-full h-full">
            <div className="absolute flex right-[20%] -top-[3px]">
              <SVG src={Line} />
              <div
                className="w-1 h-1 bg-white rounded-full"
                style={{
                  boxShadow: '0px 0px 3px 4px rgba(119, 198, 237, 0.5)'
                }}
              ></div>
            </div>

            <div className="absolute flex top-8 -left-[54px] rotate-90">
              <SVG src={Line} />
              <div
                className="w-1 h-1 bg-white rounded-full"
                style={{
                  boxShadow: '0px 0px 3px 4px rgba(119, 198, 237, 0.5)'
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex min-[1300px]:flex-row flex-col">
          {features.map((feature, index) => (
            <div key={`backed-feature-${index}`} className="flex flex-col min-[1300px]:flex-row">
              <div
                className="flex flex-col p-5 min-[1300px]:p-10 gap-4 min-[1300px]:gap-6 flex-1 self-stretch rounded-2xl border-2 border-[#387C9E]"
                style={{
                  background: 'linear-gradient(180deg, rgba(56, 124, 158, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 p-2.5 bg-gray-50 rounded-lg border border-gray-200 justify-start items-center gap-2 inline-flex">
                    <SVG className="w-5 h-5" src={feature.icon} />
                  </div>
                  <div className="text-white text-xl font-bold font-lekton">{feature.title}</div>
                </div>
                <div className="text-white text-[1.5rem] leading-[1.2] font-medium font-inter">
                  {feature.description}
                </div>
              </div>
              {index < features.length - 1 && (
                <div className="h-7 w-px min-[1300px]:w-[3vw] min-[1300px]:h-px border-[3px] min-[1300px]:border-t-0 border-l-0 border-dotted border-[#56ADD8] m-auto"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Button variant="gradient-dark" className="h-11 px-4 py-2.5" onClick={handleExploreArweaveBtnClick}>
        Explore Arweave
      </Button>
    </div>
  )
}
