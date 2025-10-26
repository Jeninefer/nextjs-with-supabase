<<<<<<< HEAD
// ABACO Financial Intelligence Platform - Thread Summary Function
// Production-ready Supabase Edge Function

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface SummarizeRequest {
  threadId: string
  maxTokens?: number
  temperature?: number
}

interface SummarizeResponse {
  success: boolean
  summary?: string
  error?: string
  metadata: {
    threadId: string
    tokenCount: number
    processingTime: number
    traceId: string
  }
}
=======
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
>>>>>>> a420387e78678797632369e28629f802ce050805

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

<<<<<<< HEAD
// Environment variables (Edge Runtime compatible)
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
const openAiKey = Deno.env.get("OPENAI_API_KEY") ?? ""

async function summarizeThread(threadId: string, maxTokens: number = 500): Promise<string> {
  const supabase = createClient(supabaseUrl, serviceRoleKey)
  
  // Get thread messages
  const { data: messages, error } = await supabase
    .from('messages')
    .select('content, role, created_at')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Database error: ${error.message}`)
  }

  if (!messages || messages.length === 0) {
    throw new Error('No messages found for thread')
  }

  // Format messages for summarization
  const conversationText = messages
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n')

  // Call OpenAI for summarization
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Summarize the following financial analysis conversation concisely, focusing on key insights, recommendations, and decisions made.'
        },
        {
          role: 'user',
          content: conversationText
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.3
    })
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const result = await response.json()
  return result.choices[0]?.message?.content || 'No summary generated'
}

Deno.serve(async (req: Request): Promise<Response> => {
  const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const startTime = Date.now()

  // Handle CORS preflight
=======
serve(async (req) => {
>>>>>>> a420387e78678797632369e28629f802ce050805
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
<<<<<<< HEAD
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    const { threadId, maxTokens = 500 }: SummarizeRequest = await req.json()

    if (!threadId) {
      throw new Error('threadId is required')
    }

    console.log('🔍 [AI Toolkit Trace] Thread summarization started', {
      traceId,
      threadId,
      maxTokens,
      timestamp: new Date().toISOString(),
      platform: 'abaco_financial_intelligence'
    })

    const summary = await summarizeThread(threadId, maxTokens)
    const processingTime = Date.now() - startTime

    const response: SummarizeResponse = {
      success: true,
      summary,
      metadata: {
        threadId,
        tokenCount: summary.split(' ').length,
        processingTime,
        traceId
      }
    }

    console.log('🔍 [AI Toolkit Trace] Thread summarization completed', {
      traceId,
      threadId,
      processingTime,
      tokenCount: response.metadata.tokenCount,
      platform: 'abaco_financial_intelligence'
    })

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('🔍 [AI Toolkit Trace] Thread summarization error', {
      traceId,
      error: error.message,
      timestamp: new Date().toISOString(),
      platform: 'abaco_financial_intelligence'
    })

    const errorResponse: SummarizeResponse = {
      success: false,
      error: error.message,
      metadata: {
        threadId: '',
        tokenCount: 0,
        processingTime: Date.now() - startTime,
        traceId
      }
    }

    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
=======
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { threadId } = await req.json()
    
    // Use the supabaseClient for operations
    console.log('Processing thread:', threadId)
    
    return new Response(
      JSON.stringify({ success: true, threadId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
>>>>>>> a420387e78678797632369e28629f802ce050805
  }
})
