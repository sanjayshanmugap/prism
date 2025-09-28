"use client"

import { useState, useEffect } from "react"
import { Copy, ExternalLink, X, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getPageContentSummary } from "@/lib/utils/page-content"

interface AIResponseProps {
  isMinimized: boolean
  isLightBackground?: boolean
  question?: string
  context?: string
  onTopicsUpdate?: (topics: string[]) => void
  persistedTopics?: string[]
}

export function AIResponse({ 
  isMinimized, 
  isLightBackground = false, 
  question = '', 
  context = '',
  onTopicsUpdate,
  persistedTopics = []
}: AIResponseProps) {
  const [isTyping, setIsTyping] = useState(false)
  const [response, setResponse] = useState("")
  const [confidence, setConfidence] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState("")
  const [relatedTopics, setRelatedTopics] = useState<string[]>(persistedTopics)
  const [isLoadingTopics, setIsLoadingTopics] = useState(false)
  const [pageContent, setPageContent] = useState<string>('')

  // Update local state when persisted data changes
  useEffect(() => {
    if (persistedTopics.length > 0) {
      setRelatedTopics(persistedTopics)
    }
  }, [persistedTopics])

  // Load page content and generate related topics on mount
  useEffect(() => {
    const loadPageContent = async () => {
      try {
        const content = getPageContentSummary()
        setPageContent(content)
        
        // Generate related topics based on page content
        setIsLoadingTopics(true)
        const response = await fetch('/api/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'related-topics',
            data: { pageContent: content }
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const newTopics = data.topics || []
          setRelatedTopics(newTopics)
          if (onTopicsUpdate) {
            onTopicsUpdate(newTopics)
          }
        }
      } catch (err) {
        console.error('Error loading page content:', err)
        setRelatedTopics(['Technology', 'AI', 'Innovation'])
      } finally {
        setIsLoadingTopics(false)
      }
    }

    loadPageContent()
  }, [])

  // Generate AI response when question changes
  useEffect(() => {
    if (!question || question.length < 10) return

    const generateResponse = async () => {
      // Clear all state immediately to prevent glitches
      setIsLoading(true)
      setIsTyping(false)
      setError(null)
      setResponse("")
      setConfidence(0)
      setCurrentQuestion(question)

      // Small delay to ensure state is cleared before starting
      await new Promise(resolve => setTimeout(resolve, 100))

      setIsTyping(true)

      try {
        console.log('Sending question to Perplexity:', question)
        let response = await fetch('/api/perplexity', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question,
            context
          }),
        })

        console.log('Perplexity response status:', response.status)
        
        // If Perplexity fails, try OpenAI as fallback
        if (!response.ok) {
          console.log('Perplexity failed, trying OpenAI fallback...')
          response = await fetch('/api/openai', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'chat',
              data: {
                messages: [
                  {
                    role: 'system',
                    content: 'You are a helpful AI assistant. Answer the user\'s question based on the provided context.'
                  },
                  {
                    role: 'user',
                    content: context ? `Context: ${context}\n\nQuestion: ${question}` : question
                  }
                ]
              }
            }),
          })
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error('Both APIs failed:', response.status, errorText)
            throw new Error(`API Error: ${response.status} - ${errorText}`)
          }
        }

        const data = await response.json()
        console.log('API response data:', data)
        
        // Handle different response formats
        let answer = ''
        let confidence = 0
        
        if (data.answer) {
          // Perplexity response format
          answer = data.answer
          confidence = data.confidence || 85
        } else if (data.response) {
          // OpenAI response format
          answer = data.response
          confidence = 80
        } else {
          throw new Error('Unexpected response format')
        }
        
        setConfidence(confidence)
        
        // Simulate typing effect
        let index = 0
        const timer = setInterval(() => {
          if (index < answer.length) {
            setResponse(answer.slice(0, index + 1))
            index++
          } else {
            setIsTyping(false)
            clearInterval(timer)
          }
        }, 20)

        return () => clearInterval(timer)
      } catch (err) {
        console.error('Error generating response:', err)
        setError(`Failed to generate response: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setResponse('Sorry, I encountered an error while processing your question. Please try again.')
        setIsTyping(false)
      } finally {
        setIsLoading(false)
      }
    }

    generateResponse()
  }, [question, context])

  // Show default content if no question
  const displayQuestion = currentQuestion || question || "Ask a question to get an AI-powered response"
  const displayResponse = response || "I'm ready to answer your questions. Start speaking or type a question."

  if (isMinimized) {
    return (
      <div className="glass-panel rounded-xl p-4 w-16 h-16 flex items-center justify-center">
        <Sparkles className="w-6 h-6 text-cyan-400" />
      </div>
    )
  }

  return (
    <div className="glass-panel rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLoading || isTyping ? 'bg-blue-500 animate-pulse' : 'bg-red-500'}`} />
          <h3 className="text-gray-900 font-semibold">AI response</h3>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Question */}
      <div className="bg-gray-100 border-gray-200 rounded-lg p-3 border">
        <p className="text-gray-800 text-sm">{displayQuestion}</p>
      </div>

      {/* Response */}
      <div className="space-y-3">
        <div className="text-gray-800 text-sm leading-relaxed">
          {displayResponse}
          {isTyping && <span className="animate-pulse">|</span>}
        </div>

        {error && (
          <div className="text-red-500 text-xs">{error}</div>
        )}

        {!isTyping && !isLoading && confidence > 0 && (
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className="text-gray-600 border-gray-300 bg-gray-100">
              {confidence}% confidence
            </Badge>
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 text-xs">
              <ExternalLink className="w-3 h-3 mr-1" />
              Sources
            </Button>
          </div>
        )}
      </div>

      {/* Related Topics */}
      {!isTyping && (
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <p className="text-gray-600 text-xs font-medium">Related topics</p>
            {isLoadingTopics && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
          </div>
          <div className="flex flex-wrap gap-2">
            {relatedTopics.map((topic) => (
              <button
                key={topic}
                className="text-xs px-2 py-1 rounded-md transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
