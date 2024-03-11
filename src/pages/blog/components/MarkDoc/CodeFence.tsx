import 'prismjs'
import 'prismjs/themes/prism.css'

import Prism from 'react-prism'

type Props = {
  language: string
  children: JSX.Element
}

export default function CodeFence({ children, language }: Props) {
  return (
    <Prism key={language} component="pre" className={`language-${language}`}>
      {children}
    </Prism>
  )
}
