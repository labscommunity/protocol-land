export function extractMessage(text: string) {
  // This regex aims to ignore any bracketed content that immediately precedes the message.
  // It looks for:
  // 1. The last colon in the text followed by optional whitespace (\s*),
  // 2. Optionally any bracketed content with optional leading and trailing whitespaces (\s*\[[^\]]*\]\s*),
  // 3. Finally, it captures the remaining text, which should be the error message.
  const regex = /:\s*(?:\s*\[[^\]]*\]\s*)?([^:]+)$/
  const match = text.match(regex)

  // If a match is found, return the captured group (the error message).
  // Else, return text
  return match ? match[1].trim() : text
}
