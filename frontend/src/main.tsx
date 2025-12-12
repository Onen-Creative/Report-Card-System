import React, { useEffect, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { initOfflineDB, syncQueue } from '@/services/offline'
import { marksApi } from '@/services/api'
import { router, Loading } from './router'
import './index.css'

// Suppress extension-related errors
window.addEventListener('error', (e) => {
  if (e.message?.includes('disconnected port object') || e.filename?.includes('proxy.js')) {
    e.preventDefault()
    return false
  }
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AppProviders() {
  useEffect(() => {
    // Initialize offline DB
    initOfflineDB()

    // Setup sync callback
    syncQueue.setSyncCallback(async (marks) => {
      await marksApi.batchUpdate(marks)
    })

    // Start auto-sync
    if (import.meta.env.VITE_ENABLE_OFFLINE === 'true') {
      syncQueue.startAutoSync()
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<Loading />}>
        <RouterProvider router={router} />
      </Suspense>
    </QueryClientProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProviders />
  </React.StrictMode>,
)
