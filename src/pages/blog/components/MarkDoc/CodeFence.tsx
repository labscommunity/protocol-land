import SyntaxHighlighter from 'react-syntax-highlighter'
import { atelierLakesideLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'

type Props = {
  language: string
  children: string
}

export default function CodeFence({ children, language }: Props) {
  return (
    <div className="rounded-md overflow-hidden my-12 [&>pre]:!p-4">
      <SyntaxHighlighter key={language} language={language} style={atelierLakesideLight}>
        {children}
      </SyntaxHighlighter>
    </div>
  )
}
