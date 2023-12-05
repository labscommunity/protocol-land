import * as amplitude from '@amplitude/analytics-browser'
import ReactGA4 from 'react-ga4'

import { useGlobalStore } from '@/stores/globalStore'

import { AMPLITUDE_TRACKING_ID, VITE_GA_TRACKING_ID } from '../constants'

const initializeGoogleAnalytics = () => {
  if (import.meta.env.MODE === 'development') return

  amplitude.init(AMPLITUDE_TRACKING_ID)

  ReactGA4.initialize(VITE_GA_TRACKING_ID)
}

export const trackGoogleAnalyticsEvent = (category: string, action: string, label: string, data?: Record<any, any>) => {
  if (import.meta.env.MODE === 'development') return

  const user = useGlobalStore.getState().authState
  const auth = {
    user_address: user.address,
    user_loginMethod: user.method
  }

  if (category === 'Auth' && action === 'Post connect button click' && label === 'Login' && data?.address) {
    amplitude.setUserId(data.address)
  }

  amplitude.track(category, {
    action,
    label,
    ...data,
    ...auth
  })

  ReactGA4.event({
    category,
    action,
    label,
    ...data,
    ...auth
  })
}

export const trackGoogleAnalyticsPageView = (hitType: string, page: string, title: string, data?: Record<any, any>) => {
  if (import.meta.env.MODE === 'development') return

  const user = useGlobalStore.getState().authState
  const auth = {
    user_address: user.address,
    user_loginMethod: user.method
  }

  amplitude.track('page_view', {
    page,
    title,
    ...data,
    ...auth
  })

  ReactGA4.send({
    hitType,
    page,
    title,
    ...data,
    ...auth
  })
}

export default initializeGoogleAnalytics
