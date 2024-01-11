export interface IStaticMetadata {
  blog: IBlog[]
}

export interface IBlog {
  id?: number
  title: string
  status: string
  href: string
  file: string
  featured: boolean
  author: IAuthor
  description: string
  coverImage: string
  transparentThumbnail: string
  publishedAt: string
  category: string
}

export interface IAuthor {
  name: string
  avatar: string
  twitter: string
}

export interface IArticle {
  id?: number
  path: string
  body: string
}
