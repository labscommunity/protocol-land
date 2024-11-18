import { useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/common/buttons'
import { imgUrlFormatter } from '@/helpers/imgUrlFormatter'
import { BondingCurve, RepoToken } from '@/types/repository'

export default function Confirm({
  bondingCurve,
  token,
  onClose,
  onAction
}: {
  bondingCurve: BondingCurve
  token: RepoToken
  onClose: () => void
  onAction: () => void
}) {
  const { id } = useParams()
  const navigate = useNavigate()

  function handleGoToSettings() {
    if (!id) return
    onClose()
    navigate(`/repository/${id}/settings/token`)
  }

  return (
    <>
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col items-center w-full justify-center">
          <img src={imgUrlFormatter(token.tokenImage)} className="w-20 h-20 rounded-full" />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-500">Token Name</label>
            <p>{token.tokenName}</p>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-500">Token Ticker</label>
            <p>{token.tokenTicker}</p>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-500">Denomination</label>
            <p>{token.denomination}</p>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-500">Total Supply</label>
            <p>{token.totalSupply}</p>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-500">Funding Goal</label>
            <p>{bondingCurve.fundingGoal}</p>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-500">Reserve Token</label>
            <p>
              {bondingCurve.reserveToken.tokenName} - ({bondingCurve.reserveToken.tokenTicker})
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <Button className="w-full justify-center font-medium" onClick={onAction} variant="primary-solid">
          Tokenize repository
        </Button>
        <Button className="w-full justify-center font-medium" onClick={handleGoToSettings} variant="primary-outline">
          Go to settings
        </Button>
      </div>
    </>
  )
}
