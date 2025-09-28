"use client"

import { useState, useEffect } from "react"
import { Minimize2, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ControlBar } from "@/components/control-bar"
import { LiveInsights } from "@/components/live-insights"
import { AIResponse } from "@/components/ai-response"
import { useBackgroundBrightness } from "@/hooks/use-background-brightness"
import { useCedarVoice } from "@/hooks/use-cedar-voice"
import { CedarVoiceIndicator } from "@/components/cedar-voice-indicator"
import { cn } from "@/lib/utils"

interface PrismOverlayProps {
  isVisible: boolean
  onVisibilityChange: (visible: boolean) => void
  isListening: boolean
  onListeningChange: (listening: boolean) => void
}

export function PrismOverlay({ isVisible, onVisibilityChange, isListening, onListeningChange }: PrismOverlayProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [persistedInsights, setPersistedInsights] = useState<string[]>([])
  const [persistedActions, setPersistedActions] = useState<Array<{text: string, type: string, active: boolean}>>([])
  const [persistedTopics, setPersistedTopics] = useState<string[]>([])
  const isLightBackground = useBackgroundBrightness()

  const handleActionClick = (action: string) => {
    // Set the action as the current question to trigger AI response
    setCurrentQuestion(action)
  }

  const handleInsightsUpdate = (insights: string[]) => {
    setPersistedInsights(insights)
  }

  const handleActionsUpdate = (actions: Array<{text: string, type: string, active: boolean}>) => {
    setPersistedActions(actions)
  }

  const handleTopicsUpdate = (topics: string[]) => {
    setPersistedTopics(topics)
  }

  // CedarOS Voice setup
  const cedarVoice = useCedarVoice()

  // Sync CedarOS voice with component state
  useEffect(() => {
    setTranscript(cedarVoice.transcript)
    setIsSpeaking(cedarVoice.isListening)
    
    // Update parent listening state
    if (cedarVoice.isListening !== isListening) {
      onListeningChange(cedarVoice.isListening)
    }
  }, [cedarVoice.transcript, cedarVoice.isListening, isListening, onListeningChange])

  // Handle voice toggle
  const handleVoiceToggle = () => {
    cedarVoice.toggleVoice()
  }

  // Process transcript for questions
  useEffect(() => {
    if (cedarVoice.transcript && cedarVoice.transcript.length > 10) {
      // Check if it's a question (contains question words or ends with ?)
      const isQuestion = /^(what|how|why|when|where|who|which|can|could|would|should|is|are|do|does|did)\b/i.test(cedarVoice.transcript.trim()) || 
                        cedarVoice.transcript.trim().endsWith('?')
      
      if (isQuestion) {
        setCurrentQuestion(cedarVoice.transcript)
      }
    }
  }, [cedarVoice.transcript])

  // Auto-stop speaking state after 3 seconds of no transcript changes
  useEffect(() => {
    if (isSpeaking) {
      const timeout = setTimeout(() => {
        setIsSpeaking(false)
      }, 3000)
      
      return () => clearTimeout(timeout)
    }
  }, [transcript, isSpeaking])

  // Removed auto-hide timer - overlay only closes via user action

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Control Bar */}
      <ControlBar
        isListening={isListening}
        onToggleListening={handleVoiceToggle}
        onToggleVisibility={() => onVisibilityChange(!isVisible)}
        isLightBackground={isLightBackground}
        isSpeaking={isSpeaking}
      />

      {/* CedarOS Voice Indicator */}
      <CedarVoiceIndicator
        voiceState={{
          isListening: cedarVoice.isListening,
          isSpeaking: cedarVoice.isSpeaking,
          voiceError: cedarVoice.voiceError,
          voicePermissionStatus: cedarVoice.voicePermissionStatus
        }}
      />

      {/* Main Overlay Panels */}
      <div className="absolute inset-0 flex flex-col lg:flex-row items-start justify-between p-2 sm:p-4 lg:p-6 pt-16 sm:pt-20 pointer-events-none gap-4">
        {/* Live Insights Panel */}
        <div className={cn(
          "w-full lg:w-80 xl:w-96 transition-all duration-300 pointer-events-auto max-h-[calc(100vh-8rem)] overflow-y-auto",
          isMinimized && "w-16 h-16"
        )}>
          <LiveInsights 
            isMinimized={isMinimized} 
            isLightBackground={isLightBackground}
            transcript={transcript}
            isListening={isListening}
            onActionClick={handleActionClick}
            onInsightsUpdate={handleInsightsUpdate}
            onActionsUpdate={handleActionsUpdate}
            persistedInsights={persistedInsights}
            persistedActions={persistedActions}
          />
        </div>

        {/* AI Response Panel */}
        <div className={cn(
          "w-full lg:w-80 xl:w-96 transition-all duration-300 pointer-events-auto max-h-[calc(100vh-8rem)] overflow-y-auto",
          isMinimized && "w-16 h-16"
        )}>
          <AIResponse 
            isMinimized={isMinimized} 
            isLightBackground={isLightBackground}
            question={currentQuestion}
            context={transcript}
            onTopicsUpdate={handleTopicsUpdate}
            persistedTopics={persistedTopics}
          />
        </div>
      </div>

      {/* Minimize/Maximize Control */}
      <div className="absolute top-16 sm:top-24 right-2 sm:right-6 pointer-events-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMinimized(!isMinimized)}
          className="glass-panel hover:bg-white/10 text-gray-900"
        >
          {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )
}
