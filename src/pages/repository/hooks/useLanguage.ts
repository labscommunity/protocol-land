import { langNames, langs, loadLanguage } from '@uiw/codemirror-extensions-langs'
import map from 'lang-map'
import { useMemo } from 'react'

type LanguageName = (typeof langNames)[number]

export default function useLanguage(filename: string) {
  const language = useMemo(() => {
    const extension = filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
    if (extension.length > 0) {
      const languageName = getLanguageName(extension)
      console.log(languageName, extension)
      if (languageName) {
        return loadLanguage(languageName)
      }
    }
    return langs.javascript({ jsx: true, typescript: true })
  }, [filename])

  function getLanguageName(extension: string): LanguageName | undefined {
    const languageNames = map.languages(extension) as LanguageName[]
    return languageNames.find((name) => langNames.includes(name))
  }

  return { language }
}
