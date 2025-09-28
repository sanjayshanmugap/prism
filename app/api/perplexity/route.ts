import { NextRequest, NextResponse } from 'next/server'
import { callPerplexity, answerQuestion } from '@/lib/api/perplexity'

export async function POST(request: NextRequest) {
  try {
    const { question, context } = await request.json()

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    const result = await answerQuestion(question, context)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Perplexity API error:', error)
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    )
  }
}
