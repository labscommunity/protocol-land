export function extractMessage(text: string) {
  // This regex looks for a pattern that starts with a colon (escaping it since it's a special character in regex),
  // followed by any character (.) zero or more times (*) in a non-greedy way (?),
  // until it hits an exclamation mark. We're capturing the content between the colon and the exclamation mark.
  const regex = /:\s*([^:!]+)!/
  const match = text.match(regex)

  // If a match is found, return the captured group, which is the message.
  // Else, return an empty string or null to indicate no match was found.
  return match ? match[1].trim() : text
}
