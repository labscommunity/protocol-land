import { langNames } from '@uiw/codemirror-extensions-langs'
import map from 'lang-map'

type Language = (typeof langNames)[number]

export function getLanguage(extension: string): Language {
  const languages = map.languages(extension) as Language[]
  const language = languages.find((lng: Language) => langNames.includes(lng))
  console.log('Language: ', language)
  if (language) return language
  return 'javascript'
}
