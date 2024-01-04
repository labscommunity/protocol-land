import SVG from 'react-inlinesvg'

import GitForkIcon from '@/assets/icons/git-fork.svg'
import GitIssueIcon from '@/assets/icons/git-issue.svg'
import GitPullRequestIcon from '@/assets/icons/git-pull-request.svg'
import UserProfileIcon from '@/assets/icons/user.svg'

const features = [
  {
    icon: GitIssueIcon,
    title: 'Issue tracking',
    description: 'Keep track of tasks, bugs, development for your project',
    className: 'md:w-64'
  },
  {
    icon: GitPullRequestIcon,
    title: 'Pull Requests',
    description: 'Submit changes to your repository hosted in Protocol.Land',
    className: 'md:w-60'
  },
  {
    icon: GitForkIcon,
    title: 'Forking',
    description: 'Seamlessly create a copy of your repository',
    className: 'md:w-56'
  },
  {
    icon: UserProfileIcon,
    title: 'User Profiles',
    description: 'Create your unique profile connected to your wallet address',
    className: 'md:w-60'
  }
]

export default function Features() {
  return (
    <div className="w-full py-16 md:py-28 flex-col justify-start items-start gap-20 inline-flex">
      <div className="self-stretch flex-col justify-start items-start gap-12 flex">
        <div className="self-stretch justify-center items-start gap-6 md:gap-8 inline-flex flex-col md:flex-row">
          {features.map((feature) => (
            <div
              key={`feature-${feature.title}`}
              className={`w-full ${feature.className} flex-col justify-start items-start gap-[10px] md:gap-6 inline-flex`}
            >
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 justify-start items-center gap-2.5 inline-flex">
                <div className="w-6 h-6 relative">
                  <SVG src={feature.icon} />
                </div>
              </div>
              <div className="self-stretch flex-col justify-start items-start gap-[10px] md:gap-4 flex">
                <div className="self-stretch text-white text-2xl font-bold font-inter leading-none lg:leading-loose">
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
  )
}
