import { useGlobalStore } from '@/stores/globalStore'

/**
 * Retrieves the username for a given address or returns the address itself if the username is not found.
 * @param address - The address to look up the username for.
 * @returns {string} - The username or the original address if a username is not found.
 */
export function resolveUsername(address: string): string {
  const user = useGlobalStore.getState().userState.allUsers.get(address)
  return user?.username ?? address
}
