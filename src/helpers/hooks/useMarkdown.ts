import React from 'react'

const renderableExtensions = [
  '.md',
  '.livemd',
  '.markdown',
  '.mdown',
  '.mdwn',
  '.mkd',
  '.mkdn',
  '.mkdown',
  '.ronn',
  '.scd',
  '.workbook',
  '.litcoffee',
  '.coffee.md',
  '.textile',
  '.rdoc',
  '.org',
  '.creole',
  '.mediawiki',
  '.wiki',
  '.wikitext',
  '.asciidoc',
  '.adoc',
  '.asc',
  '.rst',
  '.rest',
  '.rest.txt',
  '.rst.txt',
  '.pod',
  '.pod6'
]

export default function useMarkdown(filename: string) {
  const isMarkdown = React.useMemo(() => {
    const extension = filename.split('.').pop()?.toLowerCase()
    return renderableExtensions.includes(extension ? `.${extension}` : '')
  }, [filename])

  return { isMarkdown }
}
