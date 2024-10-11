import { Button } from '@/components/common/buttons'

import { ERROR_MESSAGE_TYPES, ErrorMessageTypes } from './config'

export default function DecentralizeError({
  errorType,
  onActionClick
}: {
  errorType: ErrorMessageTypes
  onActionClick: () => void
}) {
  const { title, description, icon: Icon, actionText } = ERROR_MESSAGE_TYPES[errorType]

  return (
    <>
      <div className="mt-6 flex flex-col gap-2.5">
        <div className="flex flex-col items-center w-full justify-center gap-2">
          <Icon className="w-20 h-20 text-red-500" />
          <div className="flex flex-col items-center w-full justify-center gap-1">
            <h1 className="text-lg font-medium text-gray-900">{title || 'Error'}</h1>
            <p className="text-gray-500 text-center leading-[20px]">
              {description || 'An error occurred while trying to decentralize the repository.'}
            </p>
          </div>
        </div>
      </div>

      {onActionClick && (
        <div className="mt-6">
          <Button className="w-full justify-center font-medium" onClick={onActionClick} variant="primary-solid">
            {actionText}
          </Button>
        </div>
      )}
    </>
  )
}
