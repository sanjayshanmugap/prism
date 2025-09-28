import { NextRequest, NextResponse } from 'next/server'
import { voiceAgent } from '@/lib/mastra/agent'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, context, stream = false } = body

    if (!prompt) {
      return NextResponse.json({ error: 'No prompt provided' }, { status: 400 })
    }

    // Execute the Mastra agent
    const result = await voiceAgent.execute({
      prompt,
      context: context || {}
    })

    if (stream) {
      // For streaming responses, we'll return a simple response for now
      // In a full implementation, you'd set up proper streaming
      return NextResponse.json(result)
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Mastra agent error:', error)
    return NextResponse.json(
      { error: 'Failed to process request with Mastra agent' },
      { status: 500 }
    )
  }
}
