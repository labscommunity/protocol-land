import BigNumber from 'bignumber.js'

export function computeCirculatingSupply(balances: Record<string, string>) {
  const totalSupplyBn = Object.values(balances).reduce(
    (sum, balanceStr) => BigNumber(balanceStr).plus(sum),
    BigNumber(0)
  )

  const percentages: Record<string, string> = {}

  for (const [address, balanceStr] of Object.entries(balances)) {
    const balanceBn = BigNumber(balanceStr)
    percentages[address] = balanceBn.dividedBy(totalSupplyBn).multipliedBy(100).toFixed()
  }

  return {
    circulatingSupply: totalSupplyBn.toFixed(),
    percentages: percentages
  }
}

export function allocateTokens(balances: Record<string, string>, tokens: string) {
  const result: Record<string, string> = {}

  for (const [address, percentage] of Object.entries(balances)) {
    result[address as keyof typeof result] = BigNumber(tokens).multipliedBy(percentage).dividedBy(100).toFixed()
  }

  return result
}

/**
 * 1) Compute exact fractional allocations.
 * 2) Round each to an integer.
 * 3) Fix remainder by adjusting one address's allocation.
 */
export function allocateTokensByRatioWithRemainder(balances: Record<string, string>, totalAllocStr: string) {
  const totalAlloc = new BigNumber(totalAllocStr)

  // 1) Sum the old balances to find total supply
  let totalSupply = new BigNumber(0)
  for (const balanceStr of Object.values(balances)) {
    totalSupply = totalSupply.plus(balanceStr)
  }

  // Edge case: if totalSupply is 0, everyone gets 0
  if (totalSupply.isZero()) {
    const resultAllZero: Record<string, string> = {}
    for (const address of Object.keys(balances)) {
      resultAllZero[address] = '0'
    }
    return resultAllZero
  }

  // 2) Compute exact fractional allocations (no rounding yet)
  const allocationsExact: Record<string, string> = {}
  for (const [address, balanceStr] of Object.entries(balances)) {
    const ratio = new BigNumber(balanceStr).dividedBy(totalSupply)
    allocationsExact[address] = ratio.multipliedBy(totalAlloc).toFixed()
  }

  // 3) Convert each to an integer using floor or round.
  //    Keep track of the sum of these integer allocations.
  const allocationsInteger: Record<string, string> = {}
  let sumOfRounded = new BigNumber(0)

  for (const [address, allocBN] of Object.entries(allocationsExact)) {
    // Round down or to nearest integer.
    // Typically floor is used in token scenarios to avoid "over-minting".
    const rounded = BigNumber(allocBN).integerValue(BigNumber.ROUND_FLOOR)
    allocationsInteger[address] = rounded.toFixed()
    sumOfRounded = sumOfRounded.plus(rounded)
  }

  // 4) Distribute remainder (difference) to one or more addresses
  //    so total matches exactly.
  //    remainder can be negative (if we overshot) or positive (if we undershot).
  const remainder = new BigNumber(totalAlloc).minus(sumOfRounded)

  if (!remainder.isZero()) {
    // For simplicity, just add remainder to the largest holder
    // or choose any logic you like (e.g., first holder, random holder, etc.)
    const biggestHolder = Object.keys(allocationsInteger)[0] // e.g. first in the list
    allocationsInteger[biggestHolder] = BigNumber(allocationsInteger[biggestHolder]).plus(remainder).toFixed()
  }

  // 5) Convert final allocations to string
  const finalAllocations: Record<string, string> = {}
  for (const [address, allocBN] of Object.entries(allocationsInteger)) {
    finalAllocations[address] = allocBN
  }

  return finalAllocations
}
