import { openai } from '@ai-sdk/openai'

// Create a Mastra agent for voice processing and AI responses
export const voiceAgent = {
  name: 'Voice Processing Agent',
  instructions: `You are an intelligent AI assistant that processes voice input and provides contextual responses. 
  
  Your capabilities:
  1. Analyze transcribed voice input for intent, sentiment, and key topics
  2. Extract actionable insights and suggestions
  3. Identify potential follow-up questions or actions
  4. Provide helpful, conversational responses
  5. Maintain context awareness across conversations
  
  When processing voice input, focus on:
  - Understanding the user's intent and needs
  - Extracting key information and topics
  - Suggesting relevant actions or next steps
  - Providing helpful insights based on the content
  
  Always respond in a helpful, conversational tone.`,
  model: 'gpt-4o-mini',
  async execute(input: { prompt: string; additionalContext?: any }) {
    const { prompt, additionalContext } = input
    
    console.log('Processing voice input with Mastra agent:', prompt)
    console.log('Additional context:', additionalContext)
    
    // Process user intent from clean prompt
    console.log('User wants:', prompt)
    
    // Access structured context programmatically
    if (additionalContext?.audioFile) {
      console.log('Audio file info:', additionalContext.audioFile)
    }
    
    // Use OpenAI directly for LLM processing
    try {
      const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Analyze this voice transcription and provide:
1. A helpful response to the user
2. Key insights extracted from the content
3. Suggested actions or follow-up items
4. Main topics discussed

Voice input: "${prompt}"

Respond in JSON format:
{
  "response": "Your helpful response here",
  "insights": ["insight1", "insight2"],
  "actions": ["action1", "action2"],
  "topics": ["topic1", "topic2"]
}`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const responseText = data.choices[0]?.message?.content || ''
      
      // Parse the LLM response
      const parsedResponse = JSON.parse(responseText || '{}')
      
      return {
        response: parsedResponse.response || responseText,
        insights: parsedResponse.insights || [],
        actions: parsedResponse.actions || [],
        topics: parsedResponse.topics || []
      }
      
    } catch (error) {
      console.error('Error processing with LLM:', error)
      
      // Fallback response
      return {
        response: `I heard you say: "${prompt}". How can I help you with that?`,
        insights: ['Voice input received'],
        actions: ['Please provide more details if needed'],
        topics: ['General inquiry']
      }
    }
  },
}

// Export the agent for use in API routes
export default voiceAgent
