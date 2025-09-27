"use client"

import { useState, useEffect } from "react"
import { Minimize2, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ControlBar } from "@/components/control-bar"
import { LiveInsights } from "@/components/live-insights"
import { AIResponse } from "@/components/ai-response"
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

  // Auto-hide after inactivity
  useEffect(() => {
    if (!isVisible) return

    const timer = setTimeout(() => {
      if (!isListening) {
        onVisibilityChange(false)
      }
    }, 15000)

    return () => clearTimeout(timer)
  }, [isVisible, isListening, onVisibilityChange])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Control Bar */}
      <ControlBar
        isListening={isListening}
        onToggleListening={onListeningChange}
        onToggleVisibility={() => onVisibilityChange(!isVisible)}
      />

      {/* Main Overlay Panels */}
      <div className="absolute inset-0 flex items-start justify-between p-6 pt-20 pointer-events-none">
        {/* Live Insights Panel */}
        <div className={cn("w-96 transition-all duration-300 pointer-events-auto", isMinimized && "w-16")}>
          <LiveInsights isMinimized={isMinimized} />
        </div>

        {/* AI Response Panel */}
        <div className={cn("w-96 transition-all duration-300 pointer-events-auto", isMinimized && "w-16")}>
          <AIResponse isMinimized={isMinimized} />
        </div>
      </div>

      {/* Minimize/Maximize Control */}
      <div className="absolute top-24 right-6 pointer-events-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMinimized(!isMinimized)}
          className="glass-panel text-white hover:bg-white/10"
        >
          {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )
}
