import React from 'react'

import { Hackathon } from '@/types/hackathon'

type Props = {
  selectedHackathon: Hackathon
}
export default function PrizesTab({ selectedHackathon }: Props) {
  const prizes = Object.values(selectedHackathon.prizes)

  return (
    <div className="flex flex-col w-full">
      <div className="w-full grid grid-cols-3 gap-6">
        {prizes.map((prize, idx) => (
          <div key={idx} className="flex flex-col p-6 bg-white rounded-lg gap-4 border-[1px] border-gray-300">
            <div>
              <div className="relative flex items-center">
                <h1 className="font-medium text-gray-800 text-lg">⭐️ {prize.name}</h1>
              </div>
            </div>
            <div className="w-full">
              <div className="relative flex items-center">
                <h1 className="font-medium text-base">
                  ${prize.amount} in {prize.base}
                </h1>
              </div>
            </div>
            <div className="w-full">
              <div className="relative flex items-center">
                <p>{prize.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
