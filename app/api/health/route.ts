// filepath: /app/api/health/route.ts
// ABACO Financial Intelligence Platform - Health Check Endpoint
// Following AI Toolkit best practices with comprehensive tracing

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export const dynamic = 'force-dynamic'

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  version: string
  platform: string
  traceId: string
  checks: {
    database: {
      status: 'pass' | 'fail'
      latency?: number
      error?: string
    }
    environment: {
      status: 'pass' | 'fail'
      configured: string[]
      missing: string[]
    }
    ai_toolkit: {
      status: 'pass'
      tracing_enabled: boolean
    }
  }
  uptime: number
}

export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  const traceId = `health_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const startTime = Date.now()
  
  console.log('🔍 [AI Toolkit Trace] Health check initiated', {
    traceId,
    timestamp: new Date().toISOString(),
    platform: 'abaco_financial_intelligence',
    operation: 'health_check'
  })

  const response: HealthCheckResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    platform: 'abaco_financial_intelligence',
    traceId,
    checks: {
      database: { status: 'pass' },
      environment: { status: 'pass', configured: [], missing: [] },
      ai_toolkit: { status: 'pass', tracing_enabled: true }
    },
    uptime: process.uptime()
  }

  // Check database connection
  try {
    const supabase = createClient()
    const dbStartTime = Date.now()
    
    const { error } = await supabase
      .from('user_profiles')
      .select('count(*)', { count: 'exact', head: true })
    
    const dbLatency = Date.now() - dbStartTime
    
    if (error) {
      response.checks.database = {
        status: 'fail',
        latency: dbLatency,
        error: error.message
      }
      response.status = 'degraded'
    } else {
      response.checks.database = {
        status: 'pass',
        latency: dbLatency
      }
    }
  } catch (error) {
    response.checks.database = {
      status: 'fail',
      error: error instanceof Error ? error.message : 'Unknown database error'
    }
    response.status = 'unhealthy'
  }

  // Check environment configuration
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]
  
  const optionalEnvVars = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'AZURE_COSMOS_DB_ENDPOINT',
    'OPENAI_API_KEY'
  ]

  const configured: string[] = []
  const missing: string[] = []

  for (const envVar of requiredEnvVars) {
    if (process.env[envVar]) {
      configured.push(envVar)
    } else {
      missing.push(envVar)
      response.status = 'unhealthy'
    }
  }

  for (const envVar of optionalEnvVars) {
    if (process.env[envVar]) {
      configured.push(envVar)
    }
  }

  response.checks.environment = {
    status: missing.length === 0 ? 'pass' : 'fail',
    configured,
    missing
  }

  const processingTime = Date.now() - startTime

  console.log('🔍 [AI Toolkit Trace] Health check completed', {
    traceId,
    status: response.status,
    processingTime,
    databaseLatency: response.checks.database.latency,
    timestamp: new Date().toISOString(),
    platform: 'abaco_financial_intelligence'
  })

  const statusCode = response.status === 'healthy' ? 200 : 
                    response.status === 'degraded' ? 200 : 503

  return NextResponse.json(response, { status: statusCode })
}
