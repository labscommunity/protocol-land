import { Config, Tag } from '@markdoc/markdoc'

import CodeFence from './CodeFence'
import Heading from './Heading'
import Image from './Image'
import Link from './Link'
import List from './List'
import Paragraph from './Paragraph'

export const config: Config = {
  nodes: {
    paragraph: {
      render: 'Paragraph'
    },
    heading: {
      render: 'Heading',
      attributes: {
        level: { type: String }
      }
    },
    image: {
      render: 'Image',
      attributes: {
        title: { type: String },
        src: { type: String },
        alt: { type: String }
      }
    },
    link: {
      render: 'Link',
      attributes: {
        href: { type: String },
        title: { type: String }
      }
    },
    fence: {
      render: 'Fence',
      attributes: {
        language: {
          type: String
        }
      }
    },
    list: {
      render: 'List'
    }
  },
  tags: {
    'html-tag': {
      attributes: {
        name: { type: String, required: true },
        attrs: { type: Object }
      },
      transform(node, config) {
        const { name, attrs } = node.attributes
        const children = node.transformChildren(config)
        return new Tag(name, attrs, children)
      }
    }
  }
}

export const components = {
  Heading,
  Paragraph,
  Image,
  Link,
  Fence: CodeFence,
  List
}
