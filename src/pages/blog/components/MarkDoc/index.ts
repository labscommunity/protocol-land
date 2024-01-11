import { Config } from '@markdoc/markdoc'

import Heading from './Heading'
import Image from './Image'
import Link from './Link'
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
    }
  }
}

export const components = {
  Heading,
  Paragraph,
  Image,
  Link
}
