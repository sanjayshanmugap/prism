export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export async function callOpenAI(
  messages: OpenAIMessage[],
  model: string = 'gpt-3.5-turbo'
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please set OPENAI_API_KEY in your environment variables.')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${response.status} - ${error}`)
  }

  const data: OpenAIResponse = await response.json()
  return data.choices[0]?.message?.content || 'No response generated'
}

export async function generateLiveInsights(transcript: string, pageContent?: string): Promise<string[]> {
  const messages: OpenAIMessage[] = [
    {
      role: 'system',
      content: 'You are an AI assistant that provides live insights during conversations. Analyze the conversation transcript and page content to provide 2-3 brief, actionable insights about the current discussion topic, key points being made, or suggested follow-up questions. Keep each insight under 50 words and make them relevant to the current context.'
    },
    {
      role: 'user',
      content: `Analyze this conversation transcript and provide live insights:\n\nConversation: ${transcript}\n\n${pageContent ? `Page Context: ${pageContent}` : ''}`
    }
  ]

  try {
    const response = await callOpenAI(messages)
    // Split response into individual insights
    return response.split('\n').filter(insight => insight.trim().length > 0).slice(0, 3)
  } catch (error) {
    console.error('Error generating live insights:', error)
    return ['Unable to generate insights at this time.']
  }
}

export async function generateSuggestedActions(pageContent: string): Promise<Array<{text: string, type: string}>> {
  const messages: OpenAIMessage[] = [
    {
      role: 'system',
      content: 'You are an AI assistant that generates suggested actions based on page content. Create 4-5 actionable suggestions that a user might want to do based on the content they are viewing. Each action should be specific, relevant, and actionable. Return ONLY a JSON array of objects with "text" and "type" fields. Do not include any markdown formatting, code blocks, or additional text. Example: [{"text": "What is this article about?", "type": "question"}, {"text": "Summarize the key points", "type": "action"}]'
    },
    {
      role: 'user',
      content: `Based on this page content, suggest 4-5 actionable items:\n\n${pageContent}`
    }
  ]

  try {
    const response = await callOpenAI(messages)
    
    // Clean the response to remove any markdown or code block formatting
    let cleanResponse = response.trim()
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    
    // Try to parse as JSON
    try {
      const actions = JSON.parse(cleanResponse)
      if (Array.isArray(actions)) {
        return actions.filter(action => 
          action && 
          typeof action.text === 'string' && 
          typeof action.type === 'string' &&
          action.text.trim().length > 0
        ).slice(0, 5)
      }
    } catch (parseError) {
      console.warn('Failed to parse JSON response, using fallback parsing:', parseError)
    }
    
    // Fallback: parse text response
    const lines = cleanResponse.split('\n').filter(line => line.trim().length > 0)
    return lines.slice(0, 5).map((line, index) => ({
      text: line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').replace(/^["']|["']$/g, '').trim(),
      type: index < 2 ? 'question' : 'action'
    }))
  } catch (error) {
    console.error('Error generating suggested actions:', error)
    return [
      { text: 'What is this article about?', type: 'question' },
      { text: 'Summarize the key points', type: 'action' },
      { text: 'Find related information', type: 'action' },
      { text: 'Explain the main concepts', type: 'question' }
    ]
  }
}

export async function generateRelatedTopics(pageContent: string): Promise<string[]> {
  const messages: OpenAIMessage[] = [
    {
      role: 'system',
      content: 'You are an AI assistant that generates related topics based on page content. Analyze the content and suggest 3-5 related topics or keywords that would be relevant for further exploration. Each topic should be 1-3 words and highly relevant to the content.'
    },
    {
      role: 'user',
      content: `Based on this page content, suggest related topics:\n\n${pageContent}`
    }
  ]

  try {
    const response = await callOpenAI(messages)
    // Split response into individual topics
    return response.split('\n')
      .map(topic => topic.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim())
      .filter(topic => topic.length > 0)
      .slice(0, 5)
  } catch (error) {
    console.error('Error generating related topics:', error)
    return ['Technology', 'AI', 'Innovation']
  }
}
