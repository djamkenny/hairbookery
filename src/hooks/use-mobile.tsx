
import * as React from "react"

// Define multiple breakpoints for better responsiveness
export const BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Initialize with current window width on mount
    if (typeof window !== 'undefined') {
      return window.innerWidth < BREAKPOINTS.md
    }
    // Default to false for SSR
    return false
  })

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Use ResizeObserver for better performance
    const handleResize = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md)
    }
    
    // Set initial value
    handleResize()
    
    // Add event listener
    window.addEventListener('resize', handleResize)
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isMobile
}

// Add a new hook for more granular breakpoint checking
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<string>(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth
      if (width < BREAKPOINTS.xs) return 'xxs'
      if (width < BREAKPOINTS.sm) return 'xs'
      if (width < BREAKPOINTS.md) return 'sm'
      if (width < BREAKPOINTS.lg) return 'md'
      if (width < BREAKPOINTS.xl) return 'lg'
      return 'xl'
    }
    return 'md' // Default for SSR
  })

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      const width = window.innerWidth
      if (width < BREAKPOINTS.xs) setBreakpoint('xxs')
      else if (width < BREAKPOINTS.sm) setBreakpoint('xs')
      else if (width < BREAKPOINTS.md) setBreakpoint('sm')
      else if (width < BREAKPOINTS.lg) setBreakpoint('md')
      else if (width < BREAKPOINTS.xl) setBreakpoint('lg')
      else setBreakpoint('xl')
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return breakpoint
}
