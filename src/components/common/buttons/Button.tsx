import clsx from 'clsx'
import React from 'react'

import { ButtonProps } from './types'

const VARIANTS = {
  gradient:
    'bg-[linear-gradient(90deg,rgba(170,64,255,1)_10%,rgba(169,69,246,1)_16%,rgba(223,91,216,1)_88%)] text-base tracking-wide text-white',
  outline: 'text-[#4388f6] hover:bg-[#4388f6] hover:text-white border-[1.2px] border-[#4388f6]',
  ghost: 'hover:bg-[#c6dcff] text-[#4388f6] rounded-[8px]',
  link: 'hover:border-b border-[#4388f6] !px-0 !pb-1 text-[#4388f6]',
  solid: 'bg-[#4388f6] text-base tracking-wide text-white'
}

export default function Button<C extends React.ElementType = 'button'>(props: ButtonProps<C>) {
  const { children, as, className, variant, ...buttonProps } = props
  const Component = as || 'button'

  const buttonClasses = 'px-8 py-2'

  return (
    <Component
      className={clsx(className, buttonClasses, variant && VARIANTS[variant])}
      {...buttonProps}
    >
      {children}
    </Component>
  )
}
