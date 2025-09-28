export interface PerplexityResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export async function callPerplexity(
  question: string,
  context?: string
): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY || process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY
  
  if (!apiKey) {
    throw new Error('Perplexity API key not found. Please set PERPLEXITY_API_KEY in your environment variables.')
  }

  const messages = [
    {
      role: 'system',
      content: 'You are a helpful AI assistant that provides accurate, up-to-date information. Answer questions concisely and cite sources when relevant.'
    },
    {
      role: 'user',
      content: context ? `Context: ${context}\n\nQuestion: ${question}` : question
    }
  ]

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages,
      max_tokens: 1000,
      temperature: 0.2,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Perplexity API error: ${response.status} - ${error}`)
  }

  const data: PerplexityResponse = await response.json()
  return data.choices[0]?.message?.content || 'No response generated'
}

export async function answerQuestion(question: string, context?: string): Promise<{
  answer: string
  confidence: number
  sources?: string[]
}> {
  try {
    console.log('Perplexity: Attempting to answer question:', question)
    const answer = await callPerplexity(question, context)
    console.log('Perplexity: Received answer:', answer.substring(0, 100) + '...')
    
    // Simple confidence scoring based on answer length and content
    const confidence = Math.min(95, Math.max(60, answer.length / 10))
    
    return {
      answer,
      confidence: Math.round(confidence),
      sources: [] // Perplexity doesn't always return sources in a structured way
    }
  } catch (error) {
    console.error('Error answering question with Perplexity:', error)
    
    // Check if it's an API key error
    if (error instanceof Error && error.message.includes('API key')) {
      throw new Error('Perplexity API key not configured. Please set PERPLEXITY_API_KEY in your environment variables.')
    }
    
    throw error
  }
}
