export function waitFor(delay: number) {
  return new Promise((res) => setTimeout(res, delay))
}
