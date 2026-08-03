'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

interface LoadingContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  // Reset loading state when pathname changes (meaning the navigation complete)
  useEffect(() => {
    setIsLoading(false)
  }, [pathname])

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')

      if (anchor) {
        const href = anchor.getAttribute('href')
        const targetAttr = anchor.getAttribute('target')
        const downloadAttr = anchor.getAttribute('download')

        // 1. Ignore if event was prevented
        if (e.defaultPrevented) return

        // 2. Ignore if opening in new tab/window
        if (
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          targetAttr === '_blank'
        ) {
          return
        }

        // 3. Ignore download links
        if (downloadAttr !== null) return

        // 4. Ignore external links, mailto, tel, hashes
        if (
          !href ||
          href.startsWith('http') ||
          href.startsWith('https://') ||
          href.startsWith('mailto:') ||
          href.startsWith('tel:') ||
          href.startsWith('#')
        ) {
          return
        }

        // 5. Check if it's a dashboard route transition
        try {
          const targetUrl = new URL(href, window.location.href)
          const currentUrl = new URL(window.location.href)

          // Only show loader if we are navigating to a different path
          if (targetUrl.pathname === currentUrl.pathname) {
            return
          }

          // We check if it is part of dashboard routes
          const dashboardPrefixes = [
            '/admin',
            '/dashboard',
            '/my-items',
            '/notifications',
            '/matches',
            '/claims',
            '/profile',
            '/report'
          ]
          
          const isDashboardTransition = dashboardPrefixes.some(
            prefix => targetUrl.pathname === prefix || targetUrl.pathname.startsWith(prefix + '/')
          )

          if (isDashboardTransition) {
            setIsLoading(true)
          }
        } catch (err) {
          // Fallback if URL parsing fails
        }
      }
    }

    document.addEventListener('click', handleAnchorClick)
    return () => {
      document.removeEventListener('click', handleAnchorClick)
    }
  }, [])

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoader() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoader must be used within a LoadingProvider')
  }
  return context
}
