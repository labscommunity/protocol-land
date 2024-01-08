type KeyOfType<T> = keyof T

export function pickKeys<T, K extends Record<string, unknown>>(originalObject: T, keysToPick: KeyOfType<T>[]): K {
  return keysToPick.reduce((obj, key) => {
    if (Object.prototype.hasOwnProperty.call(originalObject, key)) {
      // @ts-ignore
      obj[key] = originalObject[key]
    }
    return obj
  }, {} as K)
}
