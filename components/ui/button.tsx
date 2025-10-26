// filepath: /components/ui/button.tsx
// ABACO Financial Intelligence Platform - React 19 Compatible Button Component
// Following AI Toolkit best practices

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "financial"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const buttonVariants = {
  variant: {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500", 
    outline: "border border-blue-600 bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500",
    ghost: "hover:bg-gray-100 text-gray-900 focus:ring-2 focus:ring-gray-500",
    link: "text-blue-600 underline-offset-4 hover:underline focus:ring-2 focus:ring-blue-500",
    financial: "bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500"
  },
  size: {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8 text-lg", 
    icon: "h-10 w-10 p-0"
  }
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", onClick, children, ...props }, ref) => {
    
    // AI Toolkit tracing for button interactions
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔍 [AI Toolkit Trace] ABACO Button clicked', {
          variant,
          size,
          timestamp: new Date().toISOString(),
          platform: 'abaco_financial_intelligence'
        })
      }
      
      if (onClick) {
        onClick(event)
      }
    }
    
    const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
    const variantClasses = buttonVariants.variant[variant]
    const sizeClasses = buttonVariants.size[size]
    
    return (
      <button
        className={cn(baseClasses, variantClasses, sizeClasses, className)}
        ref={ref}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
export type { ButtonProps }
