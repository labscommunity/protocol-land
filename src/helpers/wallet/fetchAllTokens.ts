export async function fetchAllUserTokens() {
  const tokens = await (window.arweaveWallet as any).userTokens({ fetchBalance: false })
  const aoPIDMirror = 'Pi-WmAQp2-mh-oWH9lWpz5EthlUDj_W0IusAv-RXhRk'
  const aoOriginalPID = 'm3PaWzK4PTG9lAaqYQPaPdOcXdO8hYqi5Fe9NWqXd0w'

  const formattedTokens = tokens.map((token: any) => ({
    tokenName: token.Name,
    tokenTicker: token.Ticker,
    tokenImage: token.Logo,
    processId: token.processId === aoOriginalPID ? aoPIDMirror : token.processId,
    denomination: token.Denomination.toString()
  }))

  return formattedTokens
}
