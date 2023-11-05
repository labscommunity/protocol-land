import ReactGA4 from 'react-ga4'

import { useGlobalStore } from '@/stores/globalStore'

import { VITE_GA_TRACKING_ID } from '../constants'

const initializeGoogleAnalytics = () => {
  ReactGA4.initialize(VITE_GA_TRACKING_ID)
}

export const trackGoogleAnalyticsEvent = (category: string, action: string, label: string, data?: Record<any, any>) => {
  const user = useGlobalStore.getState().authState
  const auth = {
    user_address: user.address,
    user_loginMethod: user.method
  }

  ReactGA4.event({
    category,
    action,
    label,
    ...data,
    ...auth
  })
}

export const trackGoogleAnalyticsPageView = (hitType: string, page: string, title: string, data?: Record<any, any>) => {
  const user = useGlobalStore.getState().authState
  const auth = {
    user_address: user.address,
    user_loginMethod: user.method
  }

  ReactGA4.send({
    hitType,
    page,
    title,
    ...data,
    ...auth
  })
}

export default initializeGoogleAnalytics
