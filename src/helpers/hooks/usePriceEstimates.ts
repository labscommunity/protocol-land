import React from 'react'

import { getArweaveUSD, getWinstonPriceForBytes } from '../prices'
import { winstonToAR } from '../winstonToAR'

export default function usePriceEstimates() {
  const [totalSize, setTotalSize] = React.useState('0 Bytes')
  const [costAR, setCostAR] = React.useState('0')
  const [costUSD, setCostUSD] = React.useState('0')

  async function calculateEstimates(fileSizes: number[]) {
    if (fileSizes.length === 0) return

    const totalFileSizeInBytes = fileSizes.reduce((prev, curr) => prev + curr, 0)
    const formattedSizeInfo = formatBytes(totalFileSizeInBytes)
    setTotalSize(formattedSizeInfo)

    const costInWinston = await getWinstonPriceForBytes(totalFileSizeInBytes)
    const costInAR = winstonToAR(costInWinston)
    setCostAR(costInAR.toPrecision(5))

    const costFor1ARInUSD = await getArweaveUSD()
    const costInUSD = costInAR * costFor1ARInUSD
    setCostUSD(costInUSD.toPrecision(5))
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const k = 1024
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return { totalSize, costAR, costUSD, calculateEstimates }
}
