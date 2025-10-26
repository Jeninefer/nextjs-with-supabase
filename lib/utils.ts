<<<<<<< HEAD
// filepath: /lib/utils.ts
// ABACO Financial Intelligence Platform - Component Utilities
// Following AI Toolkit best practices with Azure Cosmos DB integration

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
=======
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
>>>>>>> a420387e78678797632369e28629f802ce050805

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

<<<<<<< HEAD
// AI Toolkit tracing utility for components
export function traceComponentRender(componentName: string, props?: any) {
  if (process.env.NODE_ENV !== 'production' && process.env.AITK_TRACE_ENABLED === 'true') {
    console.log('🔍 [AI Toolkit Trace] ABACO Component render', {
      component: componentName,
      props: props ? Object.keys(props) : [],
      timestamp: new Date().toISOString(),
      platform: 'abaco_financial_intelligence'
    })
  }
}

// Azure Cosmos DB partition key generator utility following HPK best practices
export function generatePartitionKey(
  tenantId: string, 
  segment: string, 
  date: string = new Date().toISOString().split('T')[0]
): string {
  return `${tenantId}/${segment}/${date}`
}

// Financial formatting utilities for ABACO platform
export function formatCurrency(
  amount: number, 
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatPercentage(
  value: number,
  decimals: number = 2
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

// Azure Cosmos DB document size checker (2MB limit compliance)
export function checkDocumentSize(document: any): { 
  sizeBytes: number; 
  isCompliant: boolean; 
  sizeMB: number 
} {
  const jsonString = JSON.stringify(document)
  const sizeBytes = new Blob([jsonString]).size
  const sizeMB = sizeBytes / (1024 * 1024)
  const isCompliant = sizeMB < 2.0 // Azure Cosmos DB 2MB limit
  
  return { sizeBytes, isCompliant, sizeMB }
}

// ABACO Financial Intelligence Platform tracing helper
export function createAbacoTrace(operation: string, metadata?: any) {
  return {
    traceId: `abaco_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    operation,
    platform: 'abaco_financial_intelligence',
    version: '2.0.0',
    metadata: metadata || {}
  }
}
=======
// If you have custom color utilities, update them:
// Instead of: import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette'
// Use: Access colors directly from Tailwind config
>>>>>>> a420387e78678797632369e28629f802ce050805
