import { langNames, langs, LanguageName, loadLanguage } from '@uiw/codemirror-extensions-langs'
import map from 'lang-exts-map'
import { useMemo } from 'react'

export default function useLanguage(filename: string) {
  const extension = useMemo(() => filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2), [filename])

  const language = useMemo(() => {
    if (extension.length > 0) {
      const languageName = getLanguageName()
      const loadedLanguage = loadLanguage(languageName)
      if (loadedLanguage) {
        return loadedLanguage
      }
    }
    return langs.javascript({ jsx: true, typescript: true })
  }, [extension])

  function getLanguageName(): LanguageName {
    const languageNames = map.languages(extension) as LanguageName[]
    return (languageNames.find((name) => langNames.includes(name)) ?? extension) as LanguageName
  }

  return { language }
}
