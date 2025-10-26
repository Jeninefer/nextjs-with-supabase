// filepath: /components/theme-switcher.tsx
// ABACO Financial Intelligence Platform - React 19 Compatible Theme Switcher
// Following AI Toolkit best practices

"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

// Simple icons to avoid lucide-react compatibility issues
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
)

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  
  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <SunIcon />
      </Button>
    )
  }
  
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    
    // AI Toolkit tracing for theme changes
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 [AI Toolkit Trace] ABACO Theme changed', {
        from: theme,
        to: newTheme,
        timestamp: new Date().toISOString(),
        platform: 'abaco_financial_intelligence'
      })
    }
  }
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
