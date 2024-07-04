import { differenceInDays, formatDistanceToNow, isFuture, isPast } from 'date-fns/esm'

export function getHackathonStatus(startsAt: number, endsAt: number, setStatus: any) {
  const startDateObj = new Date(startsAt)
  const endDateObj = new Date(endsAt)
  if (isPast(endDateObj)) {
    setStatus('ENDED')
    return 'ENDED'
  }
  if (isFuture(startDateObj)) {
    setStatus('NOT_STARTED')
    const currentDateObj = new Date()
    const daysDifference = differenceInDays(startDateObj, currentDateObj)

    if (daysDifference > 1) {
      // If more than 24 hours remaining, return 'Ends in x days' format
      return `STARTS IN ${daysDifference} DAYS`
    } else {
      // If less than 24 hours remaining, return 'Ends in hh:mm:ss' format
      const timeRemaining = formatDistanceToNow(startDateObj, { includeSeconds: true })
      return `STARTS IN ${timeRemaining}`
    }
  }
  if (isPast(startDateObj) && isFuture(endDateObj)) {
    setStatus('RUNNING')
    const daysDifference = differenceInDays(startDateObj, endDateObj)

    if (daysDifference > 1) {
      // If more than 24 hours remaining, return 'Ends in x days' format
      return `ENDS IN ${daysDifference} DAYS`
    } else {
      // If less than 24 hours remaining, return 'Ends in hh:mm:ss' format
      const timeRemaining = formatDistanceToNow(endDateObj, { includeSeconds: true })
      return `ENDS IN ${timeRemaining}`
    }
  }

  return ''
}
