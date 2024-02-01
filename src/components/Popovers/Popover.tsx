import { arrow, flip, offset, useFloating } from '@floating-ui/react-dom'
import { Popover as HeadlessPopover } from '@headlessui/react'
import clsx from 'clsx'
import React from 'react'

interface PopoverProps {
  PopoverTrigger: React.ReactNode
  children: React.ReactNode
  openCallback?: () => void
}

export default function Popover({ PopoverTrigger, children, openCallback }: PopoverProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const timeout = React.useRef<NodeJS.Timeout>()
  const arrowRef = React.useRef(null)
  const {
    refs,
    floatingStyles,
    placement,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} }
  } = useFloating({
    placement: 'top-start',
    middleware: [offset(5), flip(), arrow({ element: arrowRef })]
  })

  function clearCurrentTimeout() {
    if (timeout.current) {
      clearTimeout(timeout.current)
    }
  }

  function openPopover() {
    clearCurrentTimeout()
    if (openCallback) {
      openCallback()
    }
    setIsOpen(true)
  }

  function closePopover() {
    timeout.current = setTimeout(() => {
      setIsOpen(false)
      clearCurrentTimeout()
    }, 100)
  }

  const staticSide: any = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right'
  }[placement.split('-')[0]]

  return (
    <HeadlessPopover as="span">
      {() => (
        <>
          <HeadlessPopover.Button
            ref={refs.setReference}
            onMouseEnter={() => openPopover()}
            onMouseLeave={() => closePopover()}
          >
            {PopoverTrigger}
          </HeadlessPopover.Button>

          {isOpen && (
            <HeadlessPopover.Panel
              ref={refs.setFloating}
              onMouseEnter={openPopover}
              onMouseLeave={closePopover}
              style={floatingStyles}
              className="w-[22rem] max-w-sm px-4 sm:px-0"
              static
            >
              <div className="overflow-hidden rounded-lg border border-gray-300">{children}</div>
              <div
                ref={arrowRef}
                style={{
                  left: arrowX != null ? `${arrowX}px` : '',
                  top: arrowY != null ? `${arrowY}px` : '',
                  [staticSide]: '-5px'
                }}
                className={clsx(
                  'bg-gray-50 absolute h-[10px] w-[10px] shadow-lg border border-gray-300 rotate-45',
                  staticSide === 'bottom' ? 'border-l-0 border-t-0' : 'border-r-0 border-b-0'
                )}
              ></div>
            </HeadlessPopover.Panel>
          )}
        </>
      )}
    </HeadlessPopover>
  )
}
