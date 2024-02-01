import {
  arrow,
  autoUpdate,
  flip,
  FloatingFocusManager,
  offset,
  safePolygon,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useTransitionStyles
} from '@floating-ui/react'
import clsx from 'clsx'
import React from 'react'

interface PopoverProps {
  PopoverTrigger: React.ReactNode
  children: React.ReactNode
}

export default function Popover({ PopoverTrigger, children }: PopoverProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const arrowRef = React.useRef(null)
  const {
    refs,
    floatingStyles,
    placement,
    context,
    middlewareData: { arrow: { x: arrowX, y: arrowY } = {} }
  } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'top-start',
    middleware: [offset({ mainAxis: 5, alignmentAxis: -20 }), flip(), arrow({ element: arrowRef })],
    whileElementsMounted: autoUpdate
  })
  const focus = useFocus(context)
  const hover = useHover(context, { handleClose: safePolygon(), restMs: 100 })
  const { isMounted, styles } = useTransitionStyles(context)
  const { getReferenceProps, getFloatingProps } = useInteractions([focus, hover])
  const staticSide = React.useMemo(() => {
    return {
      top: 'bottom',
      right: 'left',
      bottom: 'top',
      left: 'right'
    }[placement.split('-')[0]]
  }, [placement])

  return (
    <>
      <div className="inline-block" ref={refs.setReference} {...getReferenceProps()}>
        {PopoverTrigger}
      </div>

      {isMounted && (
        <FloatingFocusManager context={context} modal={false} initialFocus={-1} returnFocus={false}>
          <div
            ref={refs.setFloating}
            style={{ ...floatingStyles, ...styles }}
            className="w-[22rem] max-w-sm px-4 sm:px-0"
            {...getFloatingProps()}
          >
            <div className="overflow-hidden shadow rounded-md border border-gray-300">{children}</div>
            <div
              ref={arrowRef}
              style={{
                left: arrowX != null ? `${arrowX}px` : '',
                top: arrowY != null ? `${arrowY}px` : '',
                [staticSide!]: '-5px'
              }}
              className={clsx(
                'bg-white absolute h-[10px] w-[10px] border border-gray-300 rotate-45',
                staticSide === 'bottom' ? 'border-l-0 border-t-0' : 'border-r-0 border-b-0'
              )}
            ></div>
          </div>
        </FloatingFocusManager>
      )}
    </>
  )
}
