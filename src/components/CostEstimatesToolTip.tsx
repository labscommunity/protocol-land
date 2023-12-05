import React from 'react'

import usePriceEstimates from '@/helpers/hooks/usePriceEstimates'

type Props = {
  customToolTipInfoText?: string
  customTitle?: string
  fileSizes: number[]
}

const DEFAULT_INFO_TEXT = 'This is an approximate cost for this transaction.'
const DEFAULT_TITLE = 'Cost estimates'

export default function CostEstimatesToolTip({
  customToolTipInfoText = DEFAULT_INFO_TEXT,
  customTitle = DEFAULT_TITLE,
  fileSizes
}: Props) {
  const [showPriceBox, setShowPriceBox] = React.useState(false)
  const { calculateEstimates, costAR, costUSD, totalSize } = usePriceEstimates()

  React.useEffect(() => {
    if (fileSizes.length > 0 && fileSizes[0] !== 0) {
      calculateEstimates(fileSizes)
    }
  }, [fileSizes])

  function handleToolTipHover(value: boolean) {
    setShowPriceBox(value)
  }

  return (
    <div className="flex w-full">
      <a
        tabIndex={0}
        role="link"
        aria-label="tooltip 1"
        className="focus:outline-none relative focus:ring-gray-300 rounded-full focus:ring-offset-2 focus:ring-2 focus:bg-gray-200 mt-20 md:mt-0"
      >
        <div
          onMouseOver={() => handleToolTipHover(true)}
          onFocus={() => handleToolTipHover(true)}
          onMouseOut={() => handleToolTipHover(false)}
          className="flex gap-1 cursor-pointer items-center"
        >
          <span className="text-primary-600 font-medium text-sm">{customTitle}</span>
          <div>
            <svg
              aria-haspopup="true"
              xmlns="http://www.w3.org/2000/svg"
              className="icon icon-tabler icon-tabler-info-circle"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="#56ADD9"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path stroke="none" d="M0 0h24v24H0z" />
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
              <polyline points="11 12 12 12 12 16 13 16" />
            </svg>
          </div>
        </div>
        {showPriceBox && (
          <div
            id="tooltip1"
            role="tooltip"
            className="border-gray-100 border-[1px] z-20 -mt-20 w-72 absolute transition duration-150 ease-in-out left-[110%] top-[140%] shadow-lg bg-white p-4 rounded"
          >
            <svg
              className="absolute left-0 -ml-2 bottom-0 top-0 h-full"
              width="9px"
              height="16px"
              viewBox="0 0 9 16"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
            >
              <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="Tooltips-" transform="translate(-874.000000, -1029.000000)" fill="#FFFFFF">
                  <g id="Group-3-Copy-16" transform="translate(850.000000, 975.000000)">
                    <g id="Group-2" transform="translate(24.000000, 0.000000)">
                      <polygon
                        id="Triangle"
                        transform="translate(4.500000, 62.000000) rotate(-90.000000) translate(-4.500000, -62.000000) "
                        points="4.5 57.5 12.5 66.5 -3.5 66.5"
                      ></polygon>
                    </g>
                  </g>
                </g>
              </g>
            </svg>
            <div className="flex justify-between items-center">
              <p className="text-sm font-bold text-gray-800">Cost Estimates</p>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <p className="text-xs leading-4 text-gray-600">
                Size: <span className="font-medium">{totalSize || '0 Bytes'}</span>
              </p>
              <p className="text-xs leading-4 text-gray-600">
                Cost: <span className="font-medium">~{costAR || 0.0} AR</span>{' '}
                <span className="font-medium">{`(~$${costUSD || 0.0} USD)`}</span>
              </p>
            </div>
            <div className="flex justify-between mt-2">
              <p className='before:content-["*"] before:px-[1px] before:text-red-400 before:absolute relative before:left-[-7px] before:top-[-2px] text-xs text-gray-500 leading-3'>
                {customToolTipInfoText}
              </p>
            </div>
          </div>
        )}
      </a>
    </div>
  )
}
