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
    <Component className={clsx(buttonClasses, variant && VARIANTS[variant], className)} {...buttonProps}>
      {props.isLoading && (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </>
      )}
      {!props.isLoading && children}
    </Component>
  )
}
