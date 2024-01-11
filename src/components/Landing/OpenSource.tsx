import SVG from 'react-inlinesvg'

import Line from '@/assets/images/line.svg'
import PLRepo from '@/assets/images/pl-repo.png'
import PLViewblock from '@/assets/images/pl-viewblock.png'

export default function OpenSource() {
  return (
    <div className="w-full py-16 lg:py-[60px] flex-col justify-center items-center gap-10 lg:gap-14 flex">
      <div className="flex-col justify-start items-center gap-4 flex">
        <div className="text-center text-white text-3xl lg:text-5xl font-bold font-lekton leading-10">
          Open-source, from platform to on-chain
        </div>
      </div>
      <div className="w-full relative justify-center items-center flex flex-col lg:flex-row lg:px-10">
        <div className="flex flex-col gap-2 w-full lg:w-[45%]">
          <div className="bg-gray-50 rounded-lg shadow flex-col justify-start items-center flex drop-shadow-default">
            <img className="w-full h-full rounded-lg" src={PLRepo} alt="" />
          </div>
          <div className="hidden lg:block text-center text-white text-base font-normal font-inter leading-tight">
            Platform (Protocol.Land)
          </div>
        </div>

        <div className="h-7 w-px lg:w-[10%] lg:h-px border-2 lg:border-t-0 border-l-0 border-dotted border-[#56ADD8] relative">
          <SVG className="hidden lg:block absolute right-4 top-[-1px]" src={Line} />
          <div
            className="hidden lg:block w-[6px] h-[6px] bg-white rounded-full shadow blur-none absolute right-2 top-[-1.5px]"
            style={{
              boxShadow: '0px 0px 8px 7px rgba(119, 198, 237, 0.5)'
            }}
          ></div>
        </div>

        <div className="flex flex-col gap-2 w-full lg:w-[45%]">
          <div className="bg-gray-50 rounded-lg shadow flex-col justify-start items-center flex drop-shadow-default">
            <img className="w-full h-full rounded-lg" src={PLViewblock} alt="" />
          </div>
          <div className="hidden lg:block text-center text-white text-base font-normal font-inter leading-tight">
            On-chain (Arscan)
          </div>
        </div>
      </div>
    </div>
  )
}
