"use client"

import { useState, useEffect, useCallback } from 'react'

// CedarOS Voice State Interface
interface VoiceState {
  isListening: boolean
  isSpeaking: boolean
  voicePermissionStatus: 'granted' | 'denied' | 'prompt' | 'not-supported'
  voiceError: string | null
  voiceSettings: {
    language: string
    voice: string
  }
}

// CedarOS Voice Methods Interface
interface VoiceMethods {
  checkVoiceSupport: () => boolean
  requestVoicePermission: () => Promise<void>
  toggleVoice: () => void
  startListening: () => void
  stopListening: () => void
  updateVoiceSettings: (settings: Partial<VoiceState['voiceSettings']>) => void
  resetVoiceState: () => void
  setVoiceEndpoint: (endpoint: string) => void
}

// Combined Voice Hook Interface
export interface UseCedarVoiceReturn extends VoiceState, VoiceMethods {
  transcript: string
  isSupported: boolean
}

export function useCedarVoice(): UseCedarVoiceReturn {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    voicePermissionStatus: 'prompt',
    voiceError: null,
    voiceSettings: {
      language: 'en-US',
      voice: 'alloy'
    }
  })

  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)

  // Check browser support
  const checkVoiceSupport = useCallback(() => {
    const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    setIsSupported(supported)
    return supported
  }, [])

  // Request microphone permission
  const requestVoicePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      setVoiceState(prev => ({
        ...prev,
        voicePermissionStatus: 'granted',
        voiceError: null
      }))
    } catch (error) {
      setVoiceState(prev => ({
        ...prev,
        voicePermissionStatus: 'denied',
        voiceError: 'Microphone permission denied'
      }))
    }
  }, [])

  // Toggle voice recording
  const toggleVoice = useCallback(() => {
    if (voiceState.voicePermissionStatus !== 'granted') {
      requestVoicePermission()
      return
    }

    if (voiceState.isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [voiceState.voicePermissionStatus, voiceState.isListening, requestVoicePermission])

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported || voiceState.voicePermissionStatus !== 'granted') {
      return
    }

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = voiceState.voiceSettings.language

    recognition.onstart = () => {
      setVoiceState(prev => ({
        ...prev,
        isListening: true,
        voiceError: null
      }))
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript

        if (result.isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript(finalTranscript + interimTranscript)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setVoiceState(prev => ({
        ...prev,
        isListening: false,
        voiceError: `Speech recognition error: ${event.error}`
      }))
    }

    recognition.onend = () => {
      setVoiceState(prev => ({
        ...prev,
        isListening: false
      }))
    }

    recognition.start()
  }, [isSupported, voiceState.voicePermissionStatus, voiceState.voiceSettings.language])

  // Stop listening
  const stopListening = useCallback(() => {
    setVoiceState(prev => ({
      ...prev,
      isListening: false
    }))
  }, [])

  // Update voice settings
  const updateVoiceSettings = useCallback((settings: Partial<VoiceState['voiceSettings']>) => {
    setVoiceState(prev => ({
      ...prev,
      voiceSettings: {
        ...prev.voiceSettings,
        ...settings
      }
    }))
  }, [])

  // Reset voice state
  const resetVoiceState = useCallback(() => {
    setVoiceState({
      isListening: false,
      isSpeaking: false,
      voicePermissionStatus: 'prompt',
      voiceError: null,
      voiceSettings: {
        language: 'en-US',
        voice: 'alloy'
      }
    })
    setTranscript('')
  }, [])

  // Set voice endpoint (placeholder for future WebSocket integration)
  const setVoiceEndpoint = useCallback((endpoint: string) => {
    console.log('Voice endpoint set:', endpoint)
    // Future implementation for WebSocket voice streaming
  }, [])

  // Check support on mount
  useEffect(() => {
    checkVoiceSupport()
  }, [checkVoiceSupport])

  return {
    ...voiceState,
    transcript,
    isSupported,
    checkVoiceSupport,
    requestVoicePermission,
    toggleVoice,
    startListening,
    stopListening,
    updateVoiceSettings,
    resetVoiceState,
    setVoiceEndpoint
  }
}
