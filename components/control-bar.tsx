"use client"

import { useState } from "react"
import { Play, Pause, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VoiceWaveform } from "@/components/voice-waveform"

interface ControlBarProps {
  isListening: boolean
  onToggleListening: (listening: boolean) => void
  onToggleVisibility: () => void
}

export function ControlBar({ isListening, onToggleListening, onToggleVisibility }: ControlBarProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [timer, setTimer] = useState("00:18")

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto">
      <div className="glass-panel rounded-full px-6 py-3 flex items-center gap-4">
        {/* Play/Pause */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsPlaying(!isPlaying)}
          className="text-white hover:bg-white/10 rounded-full w-8 h-8 p-0"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>

        {/* Voice Waveform */}
        {isListening && <VoiceWaveform />}

        {/* Timer */}
        <div className="text-white font-mono text-sm">{timer}</div>

        {/* Ask AI Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onToggleListening(!isListening)}
          className={`rounded-full px-4 py-1 text-sm font-medium transition-all ${
            isListening
              ? "bg-red-500 hover:bg-red-600 text-white listening-pulse"
              : "bg-white/10 hover:bg-white/20 text-white"
          }`}
        >
          Ask AI
        </Button>

        {/* Keyboard Shortcut */}
        <Badge variant="outline" className="text-white border-white/20 bg-white/5">
          ⌘ ⇧
        </Badge>

        {/* Show/Hide Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleVisibility}
          className="text-white hover:bg-white/10 rounded-full"
        >
          <span className="text-sm mr-2">Show/Hide</span>
          <Eye className="w-4 h-4" />
        </Button>

        {/* Keyboard Shortcut */}
        <Badge variant="outline" className="text-white border-white/20 bg-white/5">
          ⌘ \
        </Badge>
      </div>
    </div>
  )
}
