import clsx from 'clsx'
import { useState } from 'react'

import CreateIssue from '@/assets/images/create-issues.gif'
import DragonDeploy from '@/assets/images/dragon-deploy.gif'
import RepoCreate from '@/assets/images/repo-create.gif'
import useAuth from '@/helpers/hooks/useAuth'

import { Button } from '../common/buttons'

const features = [
  {
    title: 'Seamless Repository/Project Creation',
    description: 'Create a repo with one click and dive in without the hassle',
    image: RepoCreate
  },
  {
    title: 'Transparent collaboration',
    description: 'Intuitive Issue Tracker & Pull Request System to make merges easy',
    image: CreateIssue
  },
  {
    title: 'Simple deployment',
    description: 'Host a static web page from your repo via Dragon Deploy',
    image: DragonDeploy
  }
]

export default function Builders() {
  const { handleConnectBtnClick } = useAuth()
  const [selectedIndex, setSelectedIndex] = useState(0)

  return (
    <div className="w-full py-16 lg:py-[60px] justify-start items-start flex">
      <div className="flex flex-col">
        <div className="flex flex-col gap-4">
          <div className="text-white text-base font-semibold font-inter leading-normal">Build</div>
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-20 justify-between">
            <div className="flex flex-col">
              <div>
                <div className="text-3xl lg:text-5xl font-bold font-lekton">
                  <span className="text-primary-400 leading-10">Built </span>
                  <span className="text-white leading-10">for builders</span>
                </div>
                <div className="text-white text-base font-normal font-inter leading-relaxed">
                  Protocol.land is the go-to decentralized infrastructure whether you're a solo developer, a startup
                  team, or a thriving community
                </div>
              </div>
              <div className="flex flex-col pt-6 lg:py-6 gap-6">
                <div className="flex flex-col gap-8 py-2">
                  {features.map((feature, index) => (
                    <div
                      key={`builders-feature-${index}`}
                      className={clsx(
                        `px-6 justify-start items-start gap-8 inline-flex cursor-pointer group`,
                        selectedIndex === index && 'border-l-4 border-0 border-sky-300'
                      )}
                      onClick={() => setSelectedIndex(index)}
                    >
                      <div className="grow shrink basis-0 flex-col justify-start items-start gap-1 inline-flex">
                        <div className="self-stretch text-white group-hover:text-primary-400 text-xl lg:text-2xl font-bold font-inter leading-loose">
                          {feature.title}
                        </div>
                        <div className="self-stretch text-white text-base font-normal font-inter leading-normal">
                          {feature.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 hidden lg:justify-start items-start gap-4 lg:inline-flex">
                  <Button variant="gradient-dark" className="px-4 py-2.5" onClick={handleConnectBtnClick}>
                    Jump In
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center drop-shadow-default">
              <img
                className="rounded-2xl shadow min-h-[336px]"
                src={features[selectedIndex].image}
                width={800}
                alt=""
              />
            </div>
            <div className="pt-4 justify-center lg:hidden items-start gap-4 inline-flex">
              <Button variant="gradient-dark" className="px-4 py-2.5" onClick={handleConnectBtnClick}>
                Jump In
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
