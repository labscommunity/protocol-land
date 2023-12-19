export async function getArweaveUSD() {
  try {
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=arweave&vs_currencies=usd`)
    const data = await response.json()

    return data.arweave.usd as number
  } catch (error: any) {
    const response = await fetch(`https://api.redstone.finance/prices/?symbol=AR&provider=redstone&limit=1`)
    const data = await response.json()

    return data[0].value as number
  }
}

export async function getWinstonPriceForBytes(bytes: number) {
  try {
    const response = await fetch(`https://arweave.net/price/${bytes}`)
    const winston = await response.text()

    return +winston
  } catch (error: any) {
    throw new Error(error)
  }
}
