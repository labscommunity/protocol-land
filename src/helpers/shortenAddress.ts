import { useGlobalStore } from '@/stores/globalStore'

export function shortenAddress(address: string, range = 4) {
  const user = useGlobalStore.getState().userState.allUsers.get(address)
  if (user?.username) {
    return user.username
  }
  return address.length > 11 ? address.slice(0, range) + '...' + address.slice(-range) : address
}
