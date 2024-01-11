import { Helmet } from 'react-helmet-async'

type Props = {
  title: string
  description: string
  type: string
  image?: string
}

export const Seo = ({ title, description, type, image }: Props) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      <meta name="twitter:card" content={type} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  )
}
