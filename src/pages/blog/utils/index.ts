import { Node } from '@markdoc/markdoc'
import { Parser } from 'htmlparser2'
import yaml from 'js-yaml'

import { IAuthor, IBlog, IStaticMetadata } from '@/types/blog'

import { blogDB } from './blog'

export async function fetchStaticMetadata(path: string) {
  const metaResponse = await fetch(path)
  const metaData = (await metaResponse.json()) as IStaticMetadata

  return metaData
}

export async function loadBlogPages(blogData: IBlog[]) {
  for (const blog of blogData) {
    await addPage(blog)
  }
}

async function getRemotePage(url: string) {
  return fetch(url).then((res) => {
    if (res.status === 200) {
      return res.text()
    }

    return 'Working on it, check back later ...'
  })
}

async function addPage(blog: IBlog) {
  const page = await getRemotePage(blog.file)

  const current = await blogDB.blog.get({ path: blog.href })
  if (current !== undefined) {
    if (current.body !== page) {
      await blogDB.blog.where({ path: current.path }).modify({ body: page })
    }
  } else {
    await blogDB.blog.add({
      path: blog.href,
      body: page
    })
  }
}

export function getParsedFrontmatter(ast: Node): MarkdownDocument {
  const frontmatter = getFrontmatter(ast) as MarkdownDocument

  return frontmatter
}

function getFrontmatter(ast: Node) {
  if (ast.attributes.frontmatter) {
    return yaml.load(ast.attributes.frontmatter)
  }
  return {}
}

export function processTokens(tokens: any) {
  const output = []

  const parser = new Parser({
    onopentag(name, attrs) {
      output.push({
        type: 'tag_open',
        nesting: 1,
        meta: {
          tag: 'html-tag',
          attributes: [
            { type: 'attribute', name: 'name', value: name },
            { type: 'attribute', name: 'attrs', value: attrs }
          ]
        }
      })
    },

    ontext(content) {
      if (typeof content === 'string' && content.trim().length > 0) output.push({ type: 'text', content })
    },

    onclosetag() {
      output.push({
        type: 'tag_close',
        nesting: -1,
        meta: { tag: 'html-tag' }
      })
    }
  })

  for (const token of tokens) {
    if (token.type.startsWith('html')) {
      parser.write(token.content)
      continue
    }

    if (token.type === 'inline') token.children = processTokens(token.children)

    output.push(token)
  }

  return output
}

export type MarkdownDocument = {
  title: string
  status: string
  author: IAuthor
  slug: string
  category: string
  coverImage: string
  pageTitle: string
  description: string
  publishedAt: string
}
