"use client"

import { useState } from "react"
import { Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MicrophoneButtonProps {
  isListening: boolean
  onToggleListening: () => void
  onActivateOverlay: () => void
}

export function MicrophoneButton({ isListening, onToggleListening, onActivateOverlay }: MicrophoneButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    onToggleListening()
    onActivateOverlay()
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "w-16 h-16 rounded-full transition-all duration-300 border-2",
          isListening
            ? "bg-red-500 hover:bg-red-600 border-red-400 listening-pulse"
            : "bg-blue-500 hover:bg-blue-600 border-blue-400 pulse-glow",
          isHovered && "scale-110",
        )}
      >
        {isListening ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
      </Button>

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-20 right-0 glass-panel rounded-lg px-3 py-2 whitespace-nowrap">
          <p className="text-white text-sm">{isListening ? "Stop listening" : 'Say "Hey Prism" or click to start'}</p>
        </div>
      )}
    </div>
  )
}
