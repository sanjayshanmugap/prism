"use client"

import { useState, useEffect } from "react"
import { PrismOverlay } from "@/components/prism-overlay"
import { MicrophoneButton } from "@/components/microphone-button"

export default function HomePage() {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)
  const [isListening, setIsListening] = useState(false)

  // Simulate background content
  useEffect(() => {
    // Auto-show overlay for demo purposes
    const timer = setTimeout(() => {
      setIsOverlayVisible(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background video simulation */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />

      {/* Simulated video call participants */}
      <div className="absolute inset-0 flex">
        <div className="flex-1 relative">
          <div className="absolute bottom-4 left-4 glass-panel rounded-lg px-3 py-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-white text-sm font-medium">Roy Lee</span>
            </div>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="absolute bottom-4 right-4 glass-panel rounded-lg px-3 py-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-white text-sm font-medium">Neel Shanmugam</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo content overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white/60">
          <h1 className="text-4xl font-bold mb-4">Prism AI Demo</h1>
          <p className="text-lg">Voice-activated AI overlay interface</p>
          <p className="text-sm mt-2">Say "Hey Prism" or click the microphone</p>
        </div>
      </div>

      {/* Prism AI Overlay */}
      <PrismOverlay
        isVisible={isOverlayVisible}
        onVisibilityChange={setIsOverlayVisible}
        isListening={isListening}
        onListeningChange={setIsListening}
      />

      {/* Floating Microphone Button */}
      <MicrophoneButton
        isListening={isListening}
        onToggleListening={() => setIsListening(!isListening)}
        onActivateOverlay={() => setIsOverlayVisible(true)}
      />
    </div>
  )
}
