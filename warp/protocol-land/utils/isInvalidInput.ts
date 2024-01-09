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
  | 'email'
  | 'url'

// https://github.com/uuidjs/uuid/blob/main/src/regex.js
const UUID_REGEX =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i

const ADDRESS_REGEX = /^[a-z0-9-_]{43}$/i

//  https://github.com/colinhacks/zod/blob/3e4f71e857e75da722bd7e735b6d657a70682df2/src/types.ts#L567C1-L568C86
const EMAIL_REGEX = /^(?!\.)(?!.*\.\.)([A-Z0-9_+-.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{2,}$/i

// https://github.com/jquense/yup/blob/9e1df4938c1964a21e6ece0c458bb96dc5aff108/src/string.ts#L23C1-L25C1196
const URL_REGEX =
  /^((https?|ftp):)?\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i

function isUuid(input: any): boolean {
  return typeof input === 'string' && UUID_REGEX.test(input)
}

function isArweaveAddress(input: any): boolean {
  return typeof input === 'string' && ADDRESS_REGEX.test(input)
}

function isObject(input: any) {
  return typeof input === 'object' && input !== null && !Array.isArray(input)
}

function isEmail(input: any, skipEmptyStringCheck: boolean) {
  if (skipEmptyStringCheck && input === '') return true
  return typeof input === 'string' && EMAIL_REGEX.test(input)
}

function isURL(input: any, skipEmptyStringCheck: boolean) {
  if (skipEmptyStringCheck && input === '') return true
  return typeof input === 'string' && URL_REGEX.test(input)
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

  if (typesToCheck.includes('url')) {
    return !isURL(input, skipEmptyStringCheck)
  }

  if (typesToCheck.includes('email')) {
    return !isEmail(input, skipEmptyStringCheck)
  }

  return !typesToCheck.some((expectedType) => typeof input === expectedType)
}
