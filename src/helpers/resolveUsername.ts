import { useGlobalStore } from '@/stores/globalStore'

import { shortenAddress } from './shortenAddress'

/**
 * Retrieves the username for a given address or returns the address itself if the username is not found.
 * @param address - The address to look up the username for.
 * @returns {string} - The username or the original address if a username is not found.
 */
export function resolveUsername(address: string): string {
  const user = useGlobalStore.getState().userState.allUsers.get(address)
  return user?.username ?? address
}

/**
 * Resolves a address to a username if available, otherwise shortens the address.
 *
 * This function checks the global store for a user object associated with the given address.
 * If a username is found, it returns the username. If not, it returns a shortened version
 * of the address.
 *
 * @param {string} address - The address to resolve.
 * @param {number} [range=4] - The number of characters to keep at the start and end of the address when shortened.
 * @returns {string} The username if found; otherwise, a shortened version of the address.
 */
export function resolveUsernameOrShorten(address: string, range: number = 4): string {
  const user = useGlobalStore.getState().userState.allUsers.get(address)
  if (user?.username) {
    return user.username
  }

  return shortenAddress(address, range)
}
