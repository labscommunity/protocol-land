import { Handle, Position } from '@xyflow/react'
import clsx from 'clsx'
import { memo } from 'react'

import { TreeNodeData } from './types'

export const CustomNode = memo(({ data }: { data: TreeNodeData }) => {
  function handleNodeClick() {
    window.open(`/#/repository/${data.id}`, '_blank')
  }
  return (
    <div
      className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400 w-[400px] relative cursor-pointer"
      onClick={handleNodeClick}
    >
      <div className="flex w-full gap-1">
        <div className="rounded-full w-12 h-12 flex justify-center items-center bg-gray-100 text-lg font-bold">SK</div>
        <div className="ml-2 flex-1">
          <div className="line-clamp-1 text-lg font-semibold">{data.name}</div>
          <div className="text-gray-500 italic line-clamp-1">
            test test test test test test test test test test test tgest test test
          </div>
        </div>

        {data.isCurrentRepo && (
          <div className="absolute bottom-[-38px] w-full flex items-center justify-center left-0 text-lg font-semibold">
            You
          </div>
        )}
        {data.origin && (
          <div className="absolute bottom-[-38px] w-full flex items-center justify-center left-0 text-lg font-semibold">
            Origin
          </div>
        )}
      </div>
      <div className="w-full flex mt-2 items-center gap-2 py-1">
        {data.primary && (
          <div className={'bg-primary-700 text-white px-4 py-[1.5px] rounded-full text-base font-medium'}>Primary</div>
        )}
        <div
          className={clsx('bg-gray-200 px-4 py-[1.5px] rounded-full text-base text-gray-800 font-medium', {
            'bg-primary-700 text-white': data.decentralized === true,
            'bg-gray-200 text-gray-800': data.decentralized === false
          })}
        >
          {data.decentralized ? 'Decentralized' : 'Centralized'}
        </div>
        {data.decentralized && data.token && data.token.processId && (
          <div className="bg-gray-200 px-4 py-[1.5px] rounded-full text-base text-gray-800 font-medium">
            ${data.token.tokenTicker}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="h-14 !bg-primary-700 rounded-l-lg" />
      <Handle type="source" position={Position.Right} className="h-14 !bg-primary-700 rounded-r-lg" />
    </div>
  )
})
