import Lottie from 'react-lottie'

import filesSearchAnimation from '@/assets/searching-files.json'

export default function CommitsDiffLoading() {
  return (
    <div className="w-full flex flex-col items-center  py-8">
      <Lottie
        options={{
          loop: true,
          autoplay: true,
          animationData: filesSearchAnimation,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
          }
        }}
        height={250}
        width={250}
      />
    </div>
  )
}
