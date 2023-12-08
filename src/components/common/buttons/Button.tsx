import clsx from 'clsx'
import React from 'react'

import { ButtonProps } from './types'

const VARIANTS = {
  gradient: 'bg-primary-600 text-base tracking-wide text-white',
  outline: 'text-[#4388f6] hover:bg-[#4388f6] hover:text-white border-[1.2px] border-[#4388f6]',
  ghost: 'hover:bg-[#c6dcff] text-[#4388f6] rounded-[8px]',
  link: '!px-0 !pb-1 text-[#4388f6]',
  solid: 'bg-[#4388f6] text-base tracking-wide text-white',
  'primary-solid':
    'bg-primary-600 text-white hover:bg-primary-500 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)] active:bg-primary-700 active:shadow-[0px_2px_6px_0px_rgba(0,0,0,0.05)]',
  'primary-outline':
    'border-[1.5px] border-primary-600 disabled:border-gray-300 bg-white text-primary-700 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)] hover:bg-primary-50 active:bg-primary-100 active:shadow-[0px_2px_6px_0px_rgba(0,0,0,0.05)]',
  secondary:
    'border-[1px] bg-white border-gray-300 text-gray-900 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)] hover:bg-gray-50 active:shadow-[0px_2px_6px_0px_rgba(0,0,0,0.05)] active:bg-gray-100'
}

export default function Button<C extends React.ElementType = 'button'>(props: ButtonProps<C>) {
  const { children, as, className, variant, ...buttonProps } = props
  const Component = as || 'button'

  const buttonClasses =
    'px-4 py-[10px] rounded-[8px] disabled:bg-[#E0E0E0] disabled:shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)] disabled:text-[#A6A6A6] flex items-center'

  return (
    <Component className={clsx(buttonClasses, variant && VARIANTS[variant], className)} {...buttonProps}>
      {props.isLoading && (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5"
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
          Processing
        </>
      )}
      {!props.isLoading && children}
    </Component>
  )
}
