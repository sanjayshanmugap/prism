"use client"

import { useState, useEffect } from "react"
import { Sparkles, FileText, Copy, CheckCircle, MessageSquare, Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getPageContentSummary } from "@/lib/utils/page-content"

interface LiveInsightsProps {
  isMinimized: boolean
  isLightBackground?: boolean
  transcript?: string
  isListening?: boolean
  onActionClick?: (action: string) => void
  onInsightsUpdate?: (insights: string[]) => void
  onActionsUpdate?: (actions: Array<{text: string, type: string, active: boolean}>) => void
  persistedInsights?: string[]
  persistedActions?: Array<{text: string, type: string, active: boolean}>
}

export function LiveInsights({ 
  isMinimized, 
  isLightBackground = false, 
  transcript = '', 
  isListening = false, 
  onActionClick,
  onInsightsUpdate,
  onActionsUpdate,
  persistedInsights = [],
  persistedActions = []
}: LiveInsightsProps) {
  const [insights, setInsights] = useState<string[]>(persistedInsights)
  const [actions, setActions] = useState<Array<{text: string, type: string, active: boolean}>>(persistedActions)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingActions, setIsLoadingActions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pageContent, setPageContent] = useState<string>('')

  // Update local state when persisted data changes
  useEffect(() => {
    if (persistedInsights.length > 0) {
      setInsights(persistedInsights)
    }
  }, [persistedInsights])

  useEffect(() => {
    if (persistedActions.length > 0) {
      setActions(persistedActions)
    }
  }, [persistedActions])

  // Load page content and generate actions on mount
  useEffect(() => {
    const loadPageContent = async () => {
      try {
        const content = getPageContentSummary()
        setPageContent(content)
        
        // Generate suggested actions based on page content
        setIsLoadingActions(true)
        const response = await fetch('/api/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'suggested-actions',
            data: { pageContent: content }
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const newActions = data.actions.map((action: any, index: number) => ({
            ...action,
            active: index === 0 // First action is active by default
          }))
          setActions(newActions)
          if (onActionsUpdate) {
            onActionsUpdate(newActions)
          }
        }
      } catch (err) {
        console.error('Error loading page content:', err)
        // Fallback actions
        setActions([
          { text: 'What is this article about?', type: 'question', active: true },
          { text: 'Summarize the key points', type: 'action', active: false },
          { text: 'Find related information', type: 'action', active: false },
          { text: 'Explain the main concepts', type: 'question', active: false }
        ])
      } finally {
        setIsLoadingActions(false)
      }
    }

    loadPageContent()
  }, [])

  // Generate insights when transcript changes or on initial load
  useEffect(() => {
    const generateInsights = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'live-insights',
            data: { 
              transcript: transcript || 'User is viewing this page',
              pageContent 
            }
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to generate insights')
        }

        const data = await response.json()
        const newInsights = data.insights || []
        setInsights(newInsights)
        if (onInsightsUpdate) {
          onInsightsUpdate(newInsights)
        }
      } catch (err) {
        console.error('Error generating insights:', err)
        setError('Failed to generate insights')
        setInsights(['Unable to generate insights at this time.'])
      } finally {
        setIsLoading(false)
      }
    }

    // Generate insights immediately if we have page content, or debounce if we have transcript
    if (pageContent && !transcript) {
      generateInsights()
    } else if (transcript && transcript.length >= 50) {
      const timeoutId = setTimeout(generateInsights, 2000)
      return () => clearTimeout(timeoutId)
    }
  }, [transcript, pageContent])

  const handleActionClick = (action: {text: string, type: string, active: boolean}) => {
    // Update active state
    setActions(prev => prev.map(a => ({
      ...a,
      active: a.text === action.text
    })))
    
    // Call the parent callback
    if (onActionClick) {
      onActionClick(action.text)
    }
  }

  // Show default insights if no transcript
  const displayInsights = insights.length > 0 ? insights : [
    "Start speaking to generate live insights about your conversation.",
    "The AI will analyze your speech and provide relevant suggestions.",
  ]

  if (isMinimized) {
    return (
      <div className="glass-panel rounded-xl p-4 w-16 h-16 flex items-center justify-center">
        <Sparkles className="w-6 h-6 text-blue-400" />
      </div>
    )
  }

  return (
    <div className="glass-panel rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-blue-400" />
        <h3 className="text-gray-900 font-semibold">Live insights</h3>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            <FileText className="w-4 h-4" />
            <span className="ml-1 text-sm">Show transcript</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Current Topic */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="text-gray-900 font-medium">
            {isListening ? 'Live Analysis' : 'Conversation Insights'}
          </h4>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
        </div>
        <div className="space-y-2">
          {displayInsights.map((insight, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
              <p className="text-gray-700 text-sm leading-relaxed">{insight}</p>
            </div>
          ))}
          {error && (
            <div className="text-red-500 text-xs mt-2">{error}</div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h4 className="text-gray-900 font-medium">Suggested Actions</h4>
          {isLoadingActions && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
        </div>
        <div className="space-y-2">
          {actions.map((action, index) => {
            const getIcon = (type: string) => {
              switch (type) {
                case 'question': return MessageSquare
                case 'action': return CheckCircle
                default: return Plus
              }
            }
            const Icon = getIcon(action.type)
            
            return (
              <button
                key={index}
                onClick={() => handleActionClick(action)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                  action.active
                    ? "bg-red-500/20 border border-red-500/30 text-gray-900"
                    : "hover:bg-gray-100 text-gray-700 hover:text-gray-900",
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{action.text}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
