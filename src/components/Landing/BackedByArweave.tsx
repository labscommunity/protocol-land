import SVG from 'react-inlinesvg'

import ArweaveIcon from '@/assets/icons/arweave.svg'
import CloudCheckIcon from '@/assets/icons/cloud-check.svg'
import FolderCodeIcon from '@/assets/icons/folder-code.svg'
import GraphBarIcon from '@/assets/icons/graph-bar.svg'
import Line from '@/assets/images/line.svg'
import { openInNewTab } from '@/helpers/openInNewTab'

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

        <div className="hidden lg:block absolute top-10 border-dotted w-[90%] h-[100px] -z-10 border-2 border-sky-500 border-b-0">
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

        <div className="flex lg:flex-row flex-col">
          {features.map((feature, index) => (
            <div key={`backed-feature-${index}`} className="flex flex-col lg:flex-row">
              <div
                className="flex flex-col p-5 lg:p-10 gap-4 lg:gap-6 max-w-[440px] flex-1 self-stretch rounded-2xl border-2 border-[#387C9E]"
                style={{
                  background: 'linear-gradient(180deg, rgba(56, 124, 158, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 p-2.5 bg-gray-50 rounded-lg border border-gray-200 justify-start items-center gap-2 inline-flex">
                    <SVG className="w-5 h-5" src={feature.icon} />
                  </div>
                  <div className="text-white text-base lg:text-xl font-bold font-lekton leading-7">{feature.title}</div>
                </div>
                <div className="text-white text-xl lg:text-3xl font-medium font-inter leading-9">
                  {feature.description}
                </div>
              </div>
              {index < features.length - 1 && (
                <div className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="lg:rotate-0 rotate-90 my-4"
                    width="41"
                    height="3"
                    viewBox="0 0 41 3"
                    fill="none"
                  >
                    <path
                      d="M0.666626 2.68799H2.66663V0.687988H0.666626V2.68799ZM6.66663 2.68799H10.6666V0.687988H6.66663V2.68799ZM14.6666 2.68799H18.6666V0.687988H14.6666V2.68799ZM22.6666 2.68799H26.6666V0.687988H22.6666V2.68799ZM30.6666 2.68799H34.6666V0.687988H30.6666V2.68799ZM38.6666 2.68799H40.6666V0.687988H38.6666V2.68799Z"
                      fill="#77C6ED"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        className="w-40 h-11 px-4 py-2.5 bg-[#397D9E] hover:opacity-95 rounded-lg shadow justify-center items-center gap-2 inline-flex text-white text-base font-medium font-inter leading-normal cursor-pointer"
        onClick={() => openInNewTab('https://viewblock.io/arweave/tx/OYL0nXU8UrQm9ekQB7vgXFuvM3LcVDsaSQfQ7-p7u7U')}
      >
        Explore Arweave
      </div>
    </div>
  )
}
