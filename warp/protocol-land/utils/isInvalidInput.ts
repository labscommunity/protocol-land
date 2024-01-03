type ExpectedType = 'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'object' | 'function' | 'array'

/**
 * Checks if the given input is invalid based on its type, comparing it against one or more expected types.
 *
 * @param input - The input value to be validated.
 * @param expectedTypes - The expected type(s) against which the input type is compared. It can be a single type or an array of types.
 *                        Defaults to ['string'] if not provided.
 * @returns True if the input is invalid otherwise false.
 */
export const isInvalidInput = (input: any, expectedTypes: ExpectedType | ExpectedType[] = ['string']) =>
  !input ||
  !(Array.isArray(expectedTypes) ? expectedTypes : [expectedTypes]).some((expectedType) =>
    expectedType === 'array' ? Array.isArray(input) : typeof input === expectedType
  )
