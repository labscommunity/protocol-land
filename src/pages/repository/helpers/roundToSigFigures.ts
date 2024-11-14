export function roundToSignificantFigures(num: number, sig: number) {
  if (num === 0) {
    return 0
  }
  const d = Math.ceil(Math.log10(Math.abs(num)))
  const power = sig - d
  const mult = Math.pow(10, power)
  return Math.floor(num * mult + 0.5) / mult
}
