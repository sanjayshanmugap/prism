"use client"

import { useState, useEffect } from "react"
import { Play, Pause, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VoiceWaveform } from "@/components/voice-waveform"

interface ControlBarProps {
  isListening: boolean
  onToggleListening: (listening: boolean) => void
  onToggleVisibility: () => void
  isLightBackground?: boolean
  isSpeaking?: boolean
}

export function ControlBar({ isListening, onToggleListening, onToggleVisibility, isLightBackground = false, isSpeaking: externalIsSpeaking = false }: ControlBarProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [speakingTime, setSpeakingTime] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Use external speaking state or internal state
  const actualIsSpeaking = externalIsSpeaking || isSpeaking

  // Timer effect for speaking duration
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isListening && actualIsSpeaking) {
      interval = setInterval(() => {
        setSpeakingTime(prev => prev + 1)
      }, 1000)
    } else if (!isListening) {
      // Reset timer when not listening
      setSpeakingTime(0)
      setIsSpeaking(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isListening, actualIsSpeaking])

  // Start speaking timer when listening starts
  useEffect(() => {
    if (isListening) {
      setIsSpeaking(true)
    } else {
      setIsSpeaking(false)
    }
  }, [isListening])

  return (
    <div className="fixed top-2 sm:top-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto max-w-[calc(100vw-2rem)]">
      <div className="glass-panel rounded-full px-3 sm:px-6 py-2 sm:py-3 flex items-center gap-2 sm:gap-4 flex-wrap">
        {/* Play/Pause */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsPlaying(!isPlaying)}
          className="text-gray-900 hover:bg-white/10 rounded-full w-8 h-8 p-0"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>

        {/* Voice Waveform */}
        {isListening && <VoiceWaveform />}

        {/* Speaking Timer */}
        <div className={`font-mono text-sm ${actualIsSpeaking ? 'text-gray-900' : 'text-gray-500'}`}>
          {formatTime(speakingTime)}
        </div>

        {/* Ask AI Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onToggleListening(!isListening)}
          className={`rounded-full px-4 py-1 text-sm font-medium transition-all ${
            isListening
              ? "bg-red-500 hover:bg-red-600 text-white listening-pulse"
              : "bg-gray-200 hover:bg-gray-300 text-gray-900"
          }`}
        >
          Ask AI
        </Button>

        {/* Keyboard Shortcut - Hidden on mobile */}
        <Badge variant="outline" className="text-gray-700 border-gray-300 bg-gray-100 hidden sm:inline-flex">
          ⌘ ⇧
        </Badge>

        {/* Show/Hide Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleVisibility}
          className="text-gray-900 hover:bg-white/10 rounded-full"
        >
          <span className="text-sm mr-1 sm:mr-2 hidden sm:inline">Show/Hide</span>
          <Eye className="w-4 h-4" />
        </Button>

        {/* Keyboard Shortcut - Hidden on mobile */}
        <Badge variant="outline" className="text-gray-700 border-gray-300 bg-gray-100 hidden sm:inline-flex">
          ⌘ \
        </Badge>
      </div>
    </div>
  )
}
