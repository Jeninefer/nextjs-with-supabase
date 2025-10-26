// filepath: /components/ui/button.tsx
// ABACO Financial Intelligence Platform - React 19 Compatible Button Component
// Following AI Toolkit best practices

"use client"

import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
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
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, onClick, children, ...props }, ref) => {
    
    // AI Toolkit tracing for button interactions
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (process.env.NODE_ENV !== 'production' && process.env.AITK_TRACE_ENABLED === 'true') {
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
    
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
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

export { Button, buttonVariants }
