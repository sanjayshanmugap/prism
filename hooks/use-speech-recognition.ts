"use client"

import { useState, useEffect, useRef, useCallback } from 'react'

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

export interface UseSpeechRecognitionOptions {
  onResult?: (result: SpeechRecognitionResult) => void
  onError?: (error: string) => void
  continuous?: boolean
  interimResults?: boolean
  language?: string
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const finalTranscriptRef = useRef('')

  const {
    onResult,
    onError,
    continuous = true,
    interimResults = true,
    language = 'en-US'
  } = options

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setIsSupported(false)
      setError('Speech recognition is not supported in this browser')
      return
    }

    setIsSupported(true)
    
    // Initialize speech recognition
    const recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.lang = language
    
    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = ''
      let finalTranscript = finalTranscriptRef.current

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript

        if (result.isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      finalTranscriptRef.current = finalTranscript
      const currentTranscript = finalTranscript + interimTranscript
      setTranscript(currentTranscript)

      // Call the onResult callback
      if (onResult) {
        onResult({
          transcript: currentTranscript,
          confidence: event.results[event.results.length - 1]?.[0]?.confidence || 0,
          isFinal: event.results[event.results.length - 1]?.isFinal || false
        })
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = `Speech recognition error: ${event.error}`
      setError(errorMessage)
      setIsListening(false)
      
      if (onError) {
        onError(errorMessage)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [continuous, interimResults, language, onResult, onError])

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition not available')
      return
    }

    try {
      recognitionRef.current.start()
    } catch (err) {
      setError('Failed to start speech recognition')
    }
  }, [isSupported])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    finalTranscriptRef.current = ''
  }, [])

  return {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript
  }
}
