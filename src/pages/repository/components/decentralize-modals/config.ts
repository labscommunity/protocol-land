import { MdError } from 'react-icons/md'

export const ERROR_MESSAGE_TYPES = {
  'error-generic': {
    title: 'Error',
    description: 'An error occurred while trying to decentralize the repository.',
    icon: MdError,
    actionText: 'Try Again'
  },
  'error-no-token': {
    title: 'Incomplete Token Settings',
    description: 'You need to complete the token settings to decentralize the repository.',
    icon: MdError,
    actionText: 'Complete Token Settings'
  }
}

export type ErrorMessageTypes = keyof typeof ERROR_MESSAGE_TYPES
