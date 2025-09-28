"use client"

import { useVoice, useCedarStore } from "cedar-os"
import { Mic, MicOff, Volume2, AlertCircle, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function VoiceStatus() {
  const voice = useVoice()
  const messages = useCedarStore((state) => state.messages)

  const getStatusIcon = () => {
    if (voice.isListening) return <Mic className="w-4 h-4 text-red-500" />
    if (voice.isSpeaking) return <Volume2 className="w-4 h-4 text-green-500" />
    if (voice.voiceError) return <AlertCircle className="w-4 h-4 text-red-500" />
    if (voice.voicePermissionStatus === 'granted') return <CheckCircle className="w-4 h-4 text-green-500" />
    return <MicOff className="w-4 h-4 text-gray-400" />
  }

  const getStatusText = () => {
    if (voice.isListening) return "Listening..."
    if (voice.isSpeaking) return "Speaking..."
    if (voice.voiceError) return voice.voiceError
    if (voice.voicePermissionStatus === 'denied') return "Microphone access denied"
    if (voice.voicePermissionStatus === 'not-supported') return "Voice not supported"
    if (voice.voicePermissionStatus === 'granted') return "Voice ready"
    return "Voice permission needed"
  }

  const getStatusColor = () => {
    if (voice.isListening) return "text-red-500"
    if (voice.isSpeaking) return "text-green-500"
    if (voice.voiceError) return "text-red-500"
    if (voice.voicePermissionStatus === 'denied') return "text-red-500"
    if (voice.voicePermissionStatus === 'not-supported') return "text-orange-500"
    if (voice.voicePermissionStatus === 'granted') return "text-green-500"
    return "text-gray-500"
  }

  // Only show if voice is active, there's an error, or permission is needed
  if (!voice.isListening && !voice.isSpeaking && !voice.voiceError && 
      (voice.voicePermissionStatus === 'granted' || voice.voicePermissionStatus === 'prompt')) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-gray-200">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
