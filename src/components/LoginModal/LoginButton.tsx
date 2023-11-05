import SVG from 'react-inlinesvg'

type LoginButtonProps = {
  text: string
  Icon: string
}
export default function LoginButton({ text, Icon }: LoginButtonProps) {
  return (
    <div className="cursor-pointer w-full rounded-md bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 p-[2px]">
      <div className="p-3 flex gap-2 rounded-md h-full w-full items-center justify-center bg-[rgba(38,38,44,1)] back">
        <SVG src={Icon} width={24} height={24} />
        <h1 className="text-xl text-[whitesmoke] font-medium">{text}</h1>
      </div>
    </div>
  )
}
