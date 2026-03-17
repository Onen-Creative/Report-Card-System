import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

interface WebVitalMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
}

const sendToBackend = (metric: WebVitalMetric) => {
  if (typeof window === 'undefined') return
  
  const token = localStorage.getItem('token')
  if (!token) return

  fetch('/api/v1/analytics/web-vitals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(metric),
    keepalive: true
  }).catch(() => {})
}

export function initWebVitals() {
  if (typeof window === 'undefined') return

  getCLS(sendToBackend)
  getFID(sendToBackend)
  getFCP(sendToBackend)
  getLCP(sendToBackend)
  getTTFB(sendToBackend)
}

export function trackCustomMetric(name: string, value: number, unit = 'ms') {
  if (typeof window === 'undefined') return

  const token = localStorage.getItem('token')
  if (!token) return

  const metric = {
    name: `custom_${name}`,
    value,
    rating: 'good' as const,
    delta: value,
    id: `${name}_${Date.now()}`
  }

  fetch('/api/v1/analytics/web-vitals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(metric),
    keepalive: true
  }).catch(() => {})
}

// Performance monitoring hooks
export function usePerformanceMonitor() {
  const trackPageLoad = (pageName: string) => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const loadTime = endTime - startTime
      trackCustomMetric(`page_load_${pageName}`, loadTime)
    }
  }

  const trackUserAction = (action: string) => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const actionTime = endTime - startTime
      trackCustomMetric(`user_action_${action}`, actionTime)
    }
  }

  const trackAPICall = (endpoint: string) => {
    const startTime = performance.now()
    
    return (success: boolean) => {
      const endTime = performance.now()
      const apiTime = endTime - startTime
      trackCustomMetric(`api_${endpoint}_${success ? 'success' : 'error'}`, apiTime)
    }
  }

  return {
    trackPageLoad,
    trackUserAction,
    trackAPICall,
  }
}