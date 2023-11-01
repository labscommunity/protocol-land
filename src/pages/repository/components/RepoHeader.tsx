import SVG from 'react-inlinesvg'

import IconCloneOutline from '@/assets/icons/clone-outline.svg'
import IconCommitOutline from '@/assets/icons/commit-outline.svg'
import IconDriveOutline from '@/assets/icons/drive-outline.svg'
import IconForkOutline from '@/assets/icons/fork-outline.svg'
import IconStarOutline from '@/assets/icons/star-outline.svg'
import IconTagOutline from '@/assets/icons/tag-outline.svg'
import { Button } from '@/components/common/buttons'
import { Repo } from '@/types/repository'

import useRepository from '../hooks/useRepository'
import RepoHeaderLoading from './RepoHeaderLoading'

type Props = {
  repo: Repo | Record<PropertyKey, never>
  isLoading: boolean
}

export default function RepoHeader({ repo, isLoading }: Props) {
  const { downloadRepository } = useRepository(repo?.name)

  if (isLoading) {
    return <RepoHeaderLoading />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between">
        <div className="flex gap-4 items-center">
          <div className="bg-white rounded-full w-12 h-12 flex justify-center items-center border-[1px] border-gray-300">
            <h4 className="text-2xl font-bold tracking-wide text-gray-900">SK</h4>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{repo.name}</h1>
            <p className="text-gray-900 text-base">
              <span className="text-gray-600">Transaction ID:</span> {repo.dataTxId}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-start gap-4">
          <Button className="rounded-[20px] flex gap-2 items-center" variant="secondary">
            <SVG className="w-5 h-5" src={IconStarOutline} />
            <span className="text-gray-900 font-medium">10</span>
          </Button>
          <Button className="rounded-[20px] flex gap-2 items-center" variant="secondary">
            <SVG src={IconForkOutline} />
            <span className="text-gray-900 font-medium">Fork</span>
          </Button>
          <Button onClick={downloadRepository} className="rounded-[20px] flex gap-2 items-center" variant="secondary">
            <SVG src={IconCloneOutline} />
            <span className="text-gray-900 font-medium">Clone</span>
          </Button>
        </div>
      </div>
      <div className="flex gap-3 items-center text-gray-900">
        <div className="flex gap-1 items-center px-4 py-1 bg-gray-200 rounded-[4px] cursor-default">
          <SVG src={IconCommitOutline} />
          <p>100 Commit</p>
        </div>
        <div className="flex gap-1 items-center px-4 py-1 bg-gray-200 rounded-[4px] cursor-default">
          <SVG src={IconForkOutline} />
          <p>100 Branches</p>
        </div>
        <div className="flex gap-1 items-center px-4 py-1 bg-gray-200 rounded-[4px] cursor-default">
          <SVG src={IconTagOutline} />
          <p>100 Tags</p>
        </div>
        <div className="flex gap-1 items-center px-4 py-1 bg-gray-200 rounded-[4px] cursor-default">
          <SVG src={IconDriveOutline} />
          <p>1.1 MB</p>
        </div>
      </div>
      <div>
        <p className="text-gray-600">{repo.description}</p>
      </div>
    </div>
  )
}
