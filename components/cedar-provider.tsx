"use client"

import { CedarCopilot } from 'cedar-os'
import { useMemo } from 'react'

export function CedarProvider({ children }: { children: React.ReactNode }) {
  // Keep the original llmProvider configuration for now
  // The Mastra integration will be handled through the voice endpoint
  const llmProvider = useMemo(() => ({
    provider: 'openai' as const,
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  }), [])

  const voiceSettings = useMemo(() => ({
    language: 'en-US',
    voiceId: 'alloy' as const,
    useBrowserTTS: false,
    autoAddToMessages: true,
    pitch: 1.0,
    rate: 1.0,
    volume: 1.0,
    endpoint: '/api/voice', // This endpoint now uses Mastra agent
  }), [])

  // Don't render CedarCopilot if API key is missing
  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    console.warn('NEXT_PUBLIC_OPENAI_API_KEY is not set. Voice features will not work.')
    return <>{children}</>
  }

  return (
    <CedarCopilot
      llmProvider={llmProvider}
      voiceSettings={voiceSettings}
    >
      {children}
    </CedarCopilot>
  )
}