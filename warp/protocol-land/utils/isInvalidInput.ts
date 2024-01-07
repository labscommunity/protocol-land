type ExpectedType =
  | 'string'
  | 'number'
  | 'bigint'
  | 'boolean'
  | 'symbol'
  | 'object'
  | 'function'
  | 'array'
  | 'uuid'
  | 'arweave-address'

const REGEX =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i

const ADDRESS_REGEX = /^[a-z0-9-_]{43}$/i

function isUuid(input: any): boolean {
  return typeof input === 'string' && REGEX.test(input)
}

function isArweaveAddress(input: any): boolean {
  return typeof input === 'string' && ADDRESS_REGEX.test(input)
}

function isObject(input: any) {
  return typeof input === 'object' && input !== null && !Array.isArray(input)
}

/**
 * Checks if the given input is invalid based on its type, comparing it against one or more expected types.
 *
 * @param input - The input value to be validated.
 * @param expectedTypes - The expected type(s) against which the input type is compared. It can be a single type or an array of types.
 *                        Defaults to ['string'] if not provided.
 * @param skipEmptyStringCheck - Whether to skip empty string checking. Defaults to false.
 * @returns True if the input is invalid otherwise false.
 */
export const isInvalidInput = (
  input: any,
  expectedTypes: ExpectedType | ExpectedType[] = ['string'],
  skipEmptyStringCheck: boolean = false
) => {
  if (input === null || input === undefined || (input === '' && !skipEmptyStringCheck)) {
    return true
  }

  const typesToCheck = Array.isArray(expectedTypes) ? expectedTypes : [expectedTypes]

  if (typesToCheck.includes('object')) {
    return !isObject(input)
  }

  if (typesToCheck.includes('array')) {
    return !Array.isArray(input)
  }

  if (typesToCheck.includes('uuid')) {
    return !isUuid(input)
  }

  if (typesToCheck.includes('arweave-address')) {
    return !isArweaveAddress(input)
  }

  return !typesToCheck.some((expectedType) => typeof input === expectedType)
}
