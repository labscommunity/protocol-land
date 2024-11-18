import { Transition } from '@headlessui/react'
import Progress from '@ramonak/react-progress-bar'
import { Fragment } from 'react'
import Lottie from 'react-lottie'

import mintLoadingAnimation from '@/assets/coin-minting-loading.json'

type Props = {
  progress: number
  text?: string
}

export default function Loading({ progress = 0, text = 'Processing...' }: Props) {
  return (
    <Transition appear show={true} as={Fragment}>
      <div className="mt-6 py-10 flex flex-col gap-7">
        <div className="flex flex-col items-center w-full justify-center gap-3">
          <Lottie
            options={{
              loop: true,
              autoplay: true,
              animationData: mintLoadingAnimation,
              rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice'
              }
            }}
            height={150}
            width={'70%'}
          />
        </div>
        <div className="flex flex-col w-full gap-2 px-4">
          <Progress height="18px" labelClassName="text-white text-sm pr-2" bgColor="#56ADD9" completed={progress} />
          <p className="text-gray-600 text-center text-md font-medium">{text}</p>
          <span className="text-gray-500 text-center text-sm font-normal">Do not close or refresh this page</span>
        </div>
      </div>
    </Transition>
  )
}
