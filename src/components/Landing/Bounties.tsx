import { useNavigate } from 'react-router-dom'

import AddBounty from '@/assets/images/add-bounty.png'
import Reward from '@/assets/images/reward.png'
import RewardCompleted from '@/assets/images/reward-completed.png'
import { trackGoogleAnalyticsEvent } from '@/helpers/google-analytics'

const items = [
  {
    title: 'Create repos and bounties, all in one place',
    image: AddBounty
  },
  {
    title: 'Earn manage bounty submissions',
    image: Reward
  },
  {
    title: 'Get paid the instant your PR is accepted',
    image: RewardCompleted
  }
]
export default function Bounties() {
  const navigate = useNavigate()

  function handleExploreProjectsBtnClick() {
    trackGoogleAnalyticsEvent('Landing', 'Explore Projects button click', 'Explore Projects Button')
    navigate('/repository/6ace6247-d267-463d-b5bd-7e50d98c3693')
  }

  function handleLearnMoreBtnClick() {
    trackGoogleAnalyticsEvent('Landing', 'Learn more button click', 'Learn more Button')
    window.open('https://docs.protocol.land', '_blank')
  }

  return (
    <div className="w-full flex flex-col items-center justify-center py-16 gap-10 md:py-[60px] md:gap-[60px]">
      <div className="flex items-center justify-center gap-4 flex-col">
        <div className="text-white text-base font-semibold font-inter leading-normal">Bounties</div>
        <div className="text-center">
          <span className="text-primary-400 text-3xl md:text-5xl font-bold font-lekton leading-10">Earn </span>
          <span className="text-white text-3xl md:text-5xl font-bold font-lekton leading-10">from your work</span>
        </div>
        <div className="text-center text-white text-lg font-normal font-inter leading-relaxed">
          Your contributions don’t just shape the future, they’re rewarded in real time. Whether it’s open source
          projects, repository maintenance, or code reviews 
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        {items.map((item, idx) => (
          <div
            key={`bounty-${idx}`}
            className="p-5 md:p-10 rounded-2xl border border-sky-300 border-opacity-20 flex-col justify-center items-center gap-6 flex"
            style={{
              background: 'linear-gradient(180deg, rgba(56, 124, 158, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%)'
            }}
          >
            <div className="text-center text-white text-xl md:text-2xl font-bold font-inter flex-1 xl:leading-loose">
              {item.title}
            </div>

            <div className="bg-white bg-opacity-20 rounded-lg">
              <img className="bg-opacity-20 rounded-lg" src={item.image} alt="" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col md:flex-row justify-center items-center md:h-14 pt-4 gap-4">
        <div
          className="px-4 py-2.5 bg-[#397D9E] hover:bg-[#285E7B] hover:text-gray-300 rounded-lg shadow justify-center items-center gap-2 flex text-white text-base font-medium font-inter leading-normal cursor-pointer"
          onClick={handleExploreProjectsBtnClick}
        >
          Explore projects
        </div>
        <div
          className="px-4 py-2.5 rounded-lg shadow border justify-center items-center gap-2 flex text-white text-base font-medium font-inter leading-normal cursor-pointer hover:border-primary-800 hover:text-gray-300"
          onClick={handleLearnMoreBtnClick}
        >
          Learn more
        </div>
      </div>
    </div>
  )
}
