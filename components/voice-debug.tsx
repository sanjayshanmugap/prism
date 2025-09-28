"use client"

import { useVoice, useCedarStore } from "cedar-os"
import { useState, useEffect, useCallback } from "react"

export function VoiceDebug() {
  const voice = useVoice()
  const store = useCedarStore()
  const [isVisible, setIsVisible] = useState(false)

  // Toggle visibility with Ctrl+D
  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault()
        toggleVisibility()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleVisibility])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/90 text-white p-4 rounded-lg max-w-md text-xs font-mono">
      <div className="mb-2 font-bold">Voice Debug (Ctrl+D to toggle)</div>
      
      <div className="space-y-1">
        <div>isListening: {voice.isListening ? 'true' : 'false'}</div>
        <div>isSpeaking: {voice.isSpeaking ? 'true' : 'false'}</div>
        <div>voicePermissionStatus: {voice.voicePermissionStatus}</div>
        <div>voiceError: {voice.voiceError || 'null'}</div>
        <div>isVoiceEnabled: {voice.isVoiceEnabled ? 'true' : 'false'}</div>
        <div>voiceEndpoint: {store.voiceEndpoint || 'not set'}</div>
        <div>messages count: {store.messages.length}</div>
        <div>latest message: {store.messages[store.messages.length - 1]?.type || 'none'}</div>
      </div>
    </div>
  )
}