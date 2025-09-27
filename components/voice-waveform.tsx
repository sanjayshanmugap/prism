"use client"

import { useState } from "react"

export function VoiceWaveform() {
  const [bars] = useState(Array.from({ length: 5 }, (_, i) => i))

  return (
    <div className="flex items-center gap-1">
      {bars.map((bar) => (
        <div
          key={bar}
          className="w-1 bg-blue-400 rounded-full waveform-bar"
          style={{
            animationDelay: `${bar * 0.1}s`,
            height: "4px",
          }}
        />
      ))}
    </div>
  )
}
