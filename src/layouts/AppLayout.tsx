import React from 'react'

import LeftBottomImg from '@/assets/images/bg/left_bottom.png'
import Navbar from '@/components/Navbar'

export default function AppLayout({ children }: { children: React.JSX.Element }) {
  const style = { '--image-url': `url(${LeftBottomImg})` } as React.CSSProperties

  return (
    <div
      style={style}
      className="flex flex-col before:content-[''] before:bg-[image:var(--image-url)] before:bg-no-repeat before:bg-left-top before:left-0 before:bottom-0 before:absolute before:w-[472px] before:h-[354px] h-screen bg-[linear-gradient(135deg,rgba(215,230,255,1)_0%,rgba(243,219,246,1)_50%,rgba(240,220,247,1)_55%,rgba(217,227,255,1)_100%)]"
    >
      <Navbar />
      {children}
    </div>
  )
}
