export function customFormatNumber(num: number, decimals: number = 12) {
  if (num === 0) {
    return '0'
  }
  // Check if the number is greater than or equal to 1 or less than or equal to -1
  if (Math.abs(num) >= 1) {
    return num
  }

  // Convert number to string with sufficient decimal places
  let numStr = num.toFixed(decimals)

  // Remove trailing zeros and potential trailing decimal point
  numStr = numStr.replace(/0+$/, '').replace(/\.$/, '')

  // Split the number into integer and decimal parts
  const parts = numStr.split('.')
  if (parts.length < 2) {
    // No decimal part exists
    return parseFloat(numStr).toPrecision(decimals)
  }

  const decimalPart = parts[1]
  let zerosAfterDecimal = 0

  // Count zeros after the decimal point before the first non-zero digit
  for (let i = 0; i < decimalPart.length; i++) {
    if (decimalPart[i] === '0') {
      zerosAfterDecimal++
    } else {
      break
    }
  }

  if (zerosAfterDecimal >= 3) {
    // Extract significant digits after leading zeros
    const significantDigits = decimalPart.substring(zerosAfterDecimal)
    // Format the number as per the requirement
    const result =
      parts[0] + '.0' + zerosAfterDecimal.toString().replace?.(/\d/, (m: any) => '₀₁₂₃₄₅₆₇₈₉'[m]) + significantDigits
    return result
  } else {
    // No leading zeros after decimal, return the number as is
    return parseFloat(numStr)
  }
}
