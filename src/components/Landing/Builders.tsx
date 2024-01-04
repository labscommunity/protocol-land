import SVG from 'react-inlinesvg'

import RepoCreate from '@/assets/images/repo-create.gif'

const features = [
  {
    title: 'Seamless Repository/Project Creation',
    description: 'Create a repo with one click and dive in without the hassle',
    className: 'border-l-4 border-0 border-sky-300'
  },
  {
    title: 'Transparent collaboration',
    description: 'Intuitive Issue Tracker & Pull Request System to make merges easy',
    className: ''
  },
  {
    title: 'Straightforward design',
    description: 'From a simple onboarding to cross-project collaboration',
    className: ''
  }
]

export default function Builders() {
  return (
    <div className="w-full py-16 lg:py-[60px] justify-start items-start flex">
      <div className="flex flex-col">
        <div className="flex flex-col gap-4">
          <div className="text-white text-base font-semibold font-inter leading-normal">Build</div>
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-20 justify-between">
            <div className="flex flex-col">
              <div>
                <div className="text-3xl lg:text-5xl font-bold font-lekton">
                  <span className="text-blue-300 leading-10">Built </span>
                  <span className="text-white leading-10">for builders</span>
                </div>
                <div className="text-white text-lg font-normal font-inter leading-relaxed">
                  Protocol.land is the go-to decentralized infrastructure whether you&aposre a solo developer, a startup
                  team, or a thriving community
                </div>
              </div>
              <div className="pt-6 lg:py-6">
                <div className="flex flex-col gap-8 py-2">
                  {features.map((feature, index) => (
                    <div
                      key={`builders-feature-${index}`}
                      className={`px-6 justify-start items-start gap-8 inline-flex ${feature.className}`}
                    >
                      <div className="grow shrink basis-0 flex-col justify-start items-start gap-1 inline-flex">
                        <div className="self-stretch text-white text-xl lg:text-2xl font-bold font-inter leading-loose">
                          {feature.title}
                        </div>
                        <div className="self-stretch text-white text-base font-normal font-inter leading-normal">
                          {feature.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pb-10 lg:pb-0 drop-shadow-default">
              <img className="rounded-2xl shadow" src={RepoCreate} alt="" />
            </div>
          </div>
        </div>
        <div className="pt-4 justify-center lg:justify-start items-start gap-4 inline-flex">
          <div className="justify-end items-center gap-4 flex">
            <div className="px-4 py-2.5 bg-cyan-700 rounded-lg shadow justify-center items-center gap-2 flex">
              <div className="text-white text-base font-medium font-inter leading-normal cursor-pointer">Jump In</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
