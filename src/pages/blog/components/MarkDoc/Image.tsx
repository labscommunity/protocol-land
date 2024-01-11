type ImageProps = {
  src: string
  alt: string
}
export default function Image({ src, alt }: ImageProps) {
  return (
    <div className="rounded-[15px] overflow-hidden w-full relative">
      <img className="object-cover object-center w-full h-full" src={src} alt={alt} />
    </div>
  )
}
