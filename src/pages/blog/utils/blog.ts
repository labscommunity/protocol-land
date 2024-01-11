import Dexie, { Table } from 'dexie'

import { IArticle } from '@/types/blog'

class BlogDB extends Dexie {
  blog!: Table<IArticle, number>

  constructor() {
    super('BlogDB')
    this.version(1).stores({
      blog: '++id, &path'
    })
  }
}

export const blogDB = new BlogDB()
