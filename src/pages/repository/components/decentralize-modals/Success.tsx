import { Button } from '@/components/common/buttons'
import { imgUrlFormatter } from '@/helpers/imgUrlFormatter'
import { RepoToken } from '@/types/repository'

type Props = {
  onClose: () => void
  token: RepoToken
  onAction: () => void
}

export default function DecentralizeSuccess({ onClose, token, onAction }: Props) {
  return (
    <>
      <div className="mt-6 flex flex-col gap-2.5">
        <div className="flex flex-col items-center w-full justify-center gap-3">
          <img src={imgUrlFormatter(token.tokenImage)} className="w-20 h-20 rounded-full" />
          <div className="flex flex-col gap-1 items-center">
            <h1 className="text-lg font-medium text-gray-900">
              {token.tokenName} - {token.tokenTicker}
            </h1>
            <p className="text-gray-500 text-center">
              The repository has been successfully Tokenized. Now you can trade on the bonding curve.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <Button className="w-full justify-center font-medium" onClick={onAction} variant="primary-solid">
          Trade Now
        </Button>
        <Button className="w-full justify-center font-medium" onClick={onClose} variant="primary-outline">
          Close
        </Button>
      </div>
    </>
  )
}
