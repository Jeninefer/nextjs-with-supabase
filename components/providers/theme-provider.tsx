// filepath: /components/providers/theme-provider.tsx
// ABACO Financial Intelligence Platform - React 19 Compatible Theme Provider
// Following AI Toolkit best practices

"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // AI Toolkit tracing for theme provider initialization
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 [AI Toolkit Trace] ABACO ThemeProvider mounted', { 
        defaultTheme: props.defaultTheme,
        timestamp: new Date().toISOString(),
        platform: 'abaco_financial_intelligence'
      })
    }
  }, [props.defaultTheme])

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
