import SVG from 'react-inlinesvg'

import IconCommitOutline from '@/assets/icons/commit-outline.svg'
import IconDriveOutline from '@/assets/icons/drive-outline.svg'
import IconForkOutline from '@/assets/icons/fork-outline.svg'

const stats = [
  { icon: IconCommitOutline, name: '175 Commits' },
  { icon: IconForkOutline, name: '2 Branches' },
  { icon: IconDriveOutline, name: '4.78 MB' }
]

export default function RepoStats() {
  return (
    <div className="justify-start items-start gap-2.5 flex">
      {stats.map((stat, idx) => (
        <div key={`stat-${idx}`} className="px-1.5 py-1 bg-gray-200 rounded justify-start items-center gap-1 flex">
          <div className="w-4 h-4">
            <SVG className="w-4 h-4" src={stat.icon} />
          </div>
          <div className="text-gray-900 text-xs md:text-sm font-normal font-inter leading-tight">{stat.name}</div>
        </div>
      ))}
    </div>
  )
}
