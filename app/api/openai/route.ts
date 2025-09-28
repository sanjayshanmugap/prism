import { NextRequest, NextResponse } from 'next/server'
import { callOpenAI, generateLiveInsights, generateSuggestedActions, generateRelatedTopics } from '@/lib/api/openai'

export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json()

    if (type === 'live-insights') {
      const { transcript, pageContent } = data
      const insights = await generateLiveInsights(transcript, pageContent)
      return NextResponse.json({ insights })
    }

    if (type === 'suggested-actions') {
      const { pageContent } = data
      const actions = await generateSuggestedActions(pageContent)
      return NextResponse.json({ actions })
    }

    if (type === 'related-topics') {
      const { pageContent } = data
      const topics = await generateRelatedTopics(pageContent)
      return NextResponse.json({ topics })
    }

    if (type === 'chat') {
      const { messages } = data
      const response = await callOpenAI(messages)
      return NextResponse.json({ response })
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
  } catch (error) {
    console.error('OpenAI API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
