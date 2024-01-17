import clsx from 'clsx'
import { Dispatch, SetStateAction } from 'react'
import { FaCodeFork } from 'react-icons/fa6'

import { Button } from '@/components/common/buttons'
import { useGlobalStore } from '@/stores/globalStore'
import { Activity } from '@/types/explore'
import { Repo } from '@/types/repository'

interface ForkButtonProps {
  activity: Activity
  setIsForkModalOpen: Dispatch<SetStateAction<boolean>>
  setRepo: Dispatch<SetStateAction<Repo | undefined>>
}

export default function ForkButton({ activity, setIsForkModalOpen, setRepo }: ForkButtonProps) {
  const [connectedAddress] = useGlobalStore((state) => [state.authState.address])
  const disabled = activity.repo.owner === connectedAddress || !connectedAddress
  const forkCount = Object.keys(activity.repo.forks).length

  return (
    <div>
      <Button
        className="!px-3 !py-0 flex gap-2"
        variant="primary-outline"
        onClick={() => {
          setRepo(activity.repo)
          setIsForkModalOpen(true)
        }}
        disabled={disabled}
      >
        <FaCodeFork className="w-[14px] h-[14px]" />
        <span>Fork</span>
        <div
          className={clsx(
            'border h-full pl-2 border-r-0 border-t-0 border-b-0',
            disabled ? 'border-gray-400' : 'border-primary-700'
          )}
        >
          {forkCount}
        </div>
      </Button>
    </div>
  )
}
