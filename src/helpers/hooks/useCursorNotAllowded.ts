import clsx from 'clsx'

export default function useCursorNotAllowed(isSubmitting: boolean) {
  const cursorNotAllowed = clsx({ 'cursor-not-allowed': isSubmitting })
  const closeModalCursor = isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'
  return { cursorNotAllowed, closeModalCursor }
}
