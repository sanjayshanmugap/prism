import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Test environment variables
    const openaiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
    const perplexityKey = process.env.PERPLEXITY_API_KEY || process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY
    
    return NextResponse.json({
      openai: {
        configured: !!openaiKey,
        keyLength: openaiKey ? openaiKey.length : 0
      },
      perplexity: {
        configured: !!perplexityKey,
        keyLength: perplexityKey ? perplexityKey.length : 0
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test API error:', error)
    return NextResponse.json(
      { error: 'Test failed' },
      { status: 500 }
    )
  }
}
