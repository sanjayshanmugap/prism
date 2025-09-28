"use client"

import { useState, useEffect } from "react"
import { PrismOverlay } from "@/components/prism-overlay"
import { MicrophoneButton } from "@/components/microphone-button"
import { VoiceStatus } from "@/components/voice-status"
import { CedarProvider } from "@/components/cedar-provider"
import { useVoice } from "cedar-os"

export default function HomePage() {
  const [isOverlayVisible, setIsOverlayVisible] = useState(false)
  
  // Use CedarOS voice hook
  const voice = useVoice()

  // Simulate background content
  useEffect(() => {
    // Auto-show overlay for demo purposes
    const timer = setTimeout(() => {
      setIsOverlayVisible(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Keyboard shortcut for Command + \
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === '\\') {
        event.preventDefault()
        setIsOverlayVisible(!isOverlayVisible)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOverlayVisible])

  return (
    <CedarProvider>
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* CNN Article Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* CNN Header */}
          <div className="flex items-center mb-6">
            <div className="bg-red-600 text-white px-4 py-2 font-bold text-lg mr-4">CNN</div>
            <div className="text-gray-600 text-sm">Breaking News</div>
          </div>

          {/* Article Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Tech Giants Announce Major AI Breakthrough in Voice Recognition Technology
            </h1>
            <div className="flex items-center text-gray-600 text-sm mb-4">
              <span>By Sarah Chen</span>
              <span className="mx-2">•</span>
              <span>Updated 2:45 PM EST, December 15, 2024</span>
            </div>
            <div className="w-full h-96 bg-gray-200 rounded-lg mb-6 flex items-center justify-center">
              <span className="text-gray-500 text-lg">[Featured Image: AI Voice Technology Demo]</span>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-800 text-lg leading-relaxed mb-6">
              In a groundbreaking announcement today, leading technology companies unveiled a new generation of voice recognition systems that can understand context, emotion, and intent with unprecedented accuracy. The development represents a significant leap forward in human-computer interaction.
            </p>

            <p className="text-gray-800 text-lg leading-relaxed mb-6">
              The new AI system, demonstrated at a press conference in San Francisco, can process natural speech in real-time while maintaining context across extended conversations. Unlike previous voice assistants that required specific commands, this technology understands nuanced human communication patterns.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Key Features</h2>
            <ul className="list-disc pl-6 mb-6 text-gray-800">
              <li className="mb-2">Real-time voice processing with 99.7% accuracy</li>
              <li className="mb-2">Contextual understanding across multiple conversation turns</li>
              <li className="mb-2">Emotion recognition and appropriate response generation</li>
              <li className="mb-2">Multi-language support with seamless translation</li>
              <li className="mb-2">Privacy-first design with on-device processing</li>
            </ul>

            <p className="text-gray-800 text-lg leading-relaxed mb-6">
              Industry experts are calling this development a "game-changer" for accessibility, education, and workplace productivity. The technology could revolutionize how people interact with computers, especially for those with disabilities or language barriers.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Market Impact</h2>
            <p className="text-gray-800 text-lg leading-relaxed mb-6">
              Stock prices for major tech companies surged following the announcement, with voice technology stocks seeing particularly strong gains. Analysts predict this could open up new markets worth billions of dollars in the coming years.
            </p>

            <p className="text-gray-800 text-lg leading-relaxed mb-6">
              The technology is expected to be integrated into smartphones, smart home devices, and enterprise software within the next 18 months. Early beta testing with select partners has shown promising results, with users reporting significantly improved interaction experiences.
            </p>

            <div className="bg-gray-50 p-6 rounded-lg mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">What This Means for You</h3>
              <p className="text-gray-700">
                Consumers can expect more natural interactions with their devices, while businesses may see improved customer service capabilities and productivity tools. The technology also opens new possibilities for creative applications in entertainment and education.
              </p>
            </div>
          </div>
        </div>

        {/* Prism AI Overlay */}
        <PrismOverlay
          isVisible={isOverlayVisible}
          onVisibilityChange={setIsOverlayVisible}
          isListening={voice.isListening}
          onListeningChange={() => {}} // CedarOS manages this internally
        />

        {/* Voice Status */}
        <VoiceStatus />

        {/* Floating Microphone Button */}
        <MicrophoneButton
          isListening={voice.isListening}
          onToggleListening={() => {}} // CedarOS manages this internally
          onActivateOverlay={() => setIsOverlayVisible(true)}
        />
      </div>
    </CedarProvider>
  )
}