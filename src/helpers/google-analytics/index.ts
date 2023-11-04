import ReactGA4 from 'react-ga4'

import { useGlobalStore } from '@/stores/globalStore'

import { VITE_GA_TRACKING_ID } from '../constants'

const initializeGoogleAnalytics = () => {
  ReactGA4.initialize(VITE_GA_TRACKING_ID)
}

export const trackGoogleAnalyticsEvent = (category: string, action: string, label: string, data?: Record<any, any>) => {
  ReactGA4.event({
    category,
    action,
    label,
    ...data
  })
}

export const trackGoogleAnalyticsPageView = (hitType: string, page: string, title: string, data?: Record<any, any>) => {
  const user = useGlobalStore.getState().authState

  ReactGA4.send({
    hitType,
    page,
    title,
    user: user
      ? {
          address: user.address,
          loginMethod: user.method
        }
      : null,
    ...data
  })
}

export default initializeGoogleAnalytics
