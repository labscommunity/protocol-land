import numeral from 'numeral'

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

export function formatNumberUsingNumeral(value: number) {
  if (value === 0) return '0'
  // Determine if the number has a fractional part when divided by the smallest unit (1000 for 'k', 1,000,000 for 'M', etc.)
  const scale = Math.floor(Math.log10(Math.abs(value)) / 3)
  const divisor = Math.pow(10, scale * 3)

  if (value % divisor === 0) {
    // No fractional part when rounded to the nearest thousand, million, etc.
    return numeral(value).format('0a')
  } else {
    // There is a fractional part, include one decimal place
    return numeral(value).format('0.0a')
  }
}

export function preventScientificNotationFloat(num: number) {
  // Convert to string and check for scientific notation
  let numStr = num.toString()
  if (numStr.includes('e') || numStr.includes('E')) {
    // If in scientific notation, convert it back to full form
    const [coefficient, exponent] = numStr.toLowerCase().split('e')
    const [integerPart, fractionalPart] = coefficient.split('.')
    const exponentInt = parseInt(exponent)

    if (exponentInt > 0) {
      if (fractionalPart) {
        numStr = integerPart + fractionalPart + '0'.repeat(exponentInt - fractionalPart.length)
      } else {
        numStr = integerPart + '0'.repeat(exponentInt)
      }
    } else if (exponentInt < 0) {
      numStr = '0.' + '0'.repeat(Math.abs(exponentInt) - 1) + (integerPart || '') + (fractionalPart || '')
    }
  }
  return numStr
}
