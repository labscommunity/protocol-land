export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      if (timeout !== null) {
        clearTimeout(timeout)
        func(...args)
      }
    }

    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}
