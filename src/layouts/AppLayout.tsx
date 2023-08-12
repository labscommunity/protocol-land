import clsx from 'clsx'
import React from 'react'

import LeftBottomImg from '@/assets/images/bg/left_bottom.png'
import RightTopImg from '@/assets/images/bg/right_top.png'
import Navbar from '@/components/Navbar'

const style = {
  '--bg-left-btm-img-url': `url(${LeftBottomImg})`,
  '--bg-right-top-img-url': `url(${RightTopImg})`
} as React.CSSProperties
const afterClasses =
  'after:content-[""] before:z-[-1] after:bg-[image:var(--bg-left-btm-img-url)] after:bg-no-repeat after:bg-left-top after:left-0 after:bottom-0 after:absolute after:w-[472px] after:h-[354px]'
const beforeClasses =
  'before:content-[""] before:z-[-1] before:bg-[image:var(--bg-right-top-img-url)] before:bg-no-repeat before:bg-left-top before:right-0 before:top-0 before:absolute before:w-[587px] before:h-[705px]'
const layoutClasses =
  'z-[1] relative flex flex-col h-screen bg-[linear-gradient(135deg,rgba(215,230,255,1)_0%,rgba(243,219,246,1)_50%,rgba(240,220,247,1)_55%,rgba(217,227,255,1)_100%)]'

export default function AppLayout({ children }: { children: React.JSX.Element }) {
  return (
    <div style={style} className={clsx(layoutClasses, beforeClasses, afterClasses)}>
      <Navbar />
      {children}
    </div>
  )
}
