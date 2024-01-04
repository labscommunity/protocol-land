import SVG from 'react-inlinesvg'

import Developer1 from '@/assets/images/developer1.png'
import Developer2 from '@/assets/images/developer2.png'
import Developer3 from '@/assets/images/developer3.png'
import Developer4 from '@/assets/images/developer4.png'
import Earth from '@/assets/images/earth.svg'
import PLDiscord from '@/assets/images/pl-discord.png'
import ProfilePage from '@/assets/images/profile-page.png'

export default function DeveloperCommunity() {
  return (
    <div className="w-full py-[60px]">
      <div className="flex flex-col lg:flex-row justify-between">
        <div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row gap-3 text-white text-3xl lg:text-5xl font-bold font-lekton leading-10">
              <div className="order-2 lg:order-1">
                Engage with a developer community{' '}
                <div className="hidden lg:inline-block align-middle">
                  <div className="flex flex-row order-1 lg:order-2 -space-x-2">
                    {[Developer1, Developer2, Developer3, Developer4].map((developer, index) => (
                      <img
                        key={`developer-${index}`}
                        className="w-6 h-6 lg:w-12 lg:h-12 rounded-full"
                        src={developer}
                        alt=""
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-row order-1 lg:order-2 lg:hidden -space-x-2">
                {[Developer1, Developer2, Developer3, Developer4].map((developer, index) => (
                  <img
                    key={`developer-${index}`}
                    className="w-6 h-6 lg:w-12 lg:h-12 rounded-full"
                    src={developer}
                    alt=""
                  />
                ))}
              </div>
            </div>
            <div className="hidden lg:block text-white text-lg font-normal font-inter leading-relaxed">
              Built for builders, by builders. Our community is here to assist you with technical queries, conceptual
              doubt, or just to chat.{' '}
            </div>
            <div className="block lg:hidden text-white text-lg font-normal font-inter leading-relaxed">
              Discover innovative projects and earn tokens for your contributions. Your expertise doesn’t just shape the
              future, it’s rewarded in real time.
            </div>
          </div>
          <div className="flex py-[35px]">
            <div className="flex flex-col gap-4 lg:gap-10">
              <div className="text-white text-xl lg:text-2xl font-bold font-inter leading-loose">
                Collaborate with builders from leading projects
              </div>
              <div className="text-white text-xl lg:text-2xl font-bold font-inter leading-loose">
                Build industry standard experience
              </div>
              <div className="text-white text-xl lg:text-2xl font-bold font-inter leading-loose">
                Receive support from real people
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-40 h-11 px-4 py-2.5 bg-cyan-700 rounded-lg shadow text-white text-base font-medium font-inter leading-normal cursor-pointer">
              Join the Discord
            </div>
          </div>
        </div>
        <div>
          <div className="relative flex w-full h-full">
            <div className="w-full flex justify-center">
              <div className="relative w-[231px] h-[229px] lg:w-[487px] lg:h-[483px]">
                <img
                  className="flex absolute rounded-xl -right-8 -top-2 lg:right-0 w-36 h-24 lg:w-96 lg:h-60 z-10"
                  src={ProfilePage}
                  alt=""
                />

                <img
                  className="flex absolute rounded-xl bottom-16 -left-4 lg:bottom-24 lg:-left-6 w-32 h-9 lg:w-72 lg:h-20 z-10"
                  src={PLDiscord}
                  alt=""
                />
                <div className="relative">
                  <SVG src={Earth} />
                  <div className="absolute w-full h-full right-[36%] lg:right-[25%] bottom-24 lg:bottom-8 -z-10">
                    <svg
                      className="h-[481px] max-w-[100vw] lg:h-[681px] lg:w-[681px]"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 681 681"
                      fill="none"
                    >
                      <path
                        d="M0.143799 340.032C0.143799 152.255 152.367 0.0322266 340.144 0.0322266C527.921 0.0322266 680.144 152.255 680.144 340.032C680.144 527.809 527.921 680.032 340.144 680.032C152.367 680.032 0.143799 527.809 0.143799 340.032Z"
                        fill="url(#paint0_radial_301_2025)"
                      />
                      <defs>
                        <radialGradient
                          id="paint0_radial_301_2025"
                          cx="0"
                          cy="0"
                          r="1"
                          gradientUnits="userSpaceOnUse"
                          gradientTransform="translate(340.144 340.032) rotate(90) scale(340)"
                        >
                          <stop stopColor="#6DABD5" />
                          <stop offset="1" stopColor="#071C37" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center pt-6 lg:hidden">
        <div className="w-40 h-11 px-4 py-2.5 bg-cyan-700 rounded-lg shadow text-white text-base font-medium font-inter leading-normal">
          Join the Discord
        </div>
      </div>
    </div>
  )
}
