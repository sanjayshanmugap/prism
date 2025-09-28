"use client"

import { useState } from "react"
import { useVoice } from "cedar-os"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Mic, Volume2 } from "lucide-react"

export function VoiceSettings() {
  const [isOpen, setIsOpen] = useState(false)
  const voice = useVoice()

  const languageOptions = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'es-ES', label: 'Spanish' },
    { value: 'fr-FR', label: 'French' },
    { value: 'de-DE', label: 'German' },
    { value: 'it-IT', label: 'Italian' },
    { value: 'pt-BR', label: 'Portuguese (Brazil)' },
    { value: 'ja-JP', label: 'Japanese' },
    { value: 'ko-KR', label: 'Korean' },
    { value: 'zh-CN', label: 'Chinese (Simplified)' },
  ]

  const voiceOptions = [
    { value: 'alloy', label: 'Alloy' },
    { value: 'echo', label: 'Echo' },
    { value: 'fable', label: 'Fable' },
    { value: 'onyx', label: 'Onyx' },
    { value: 'nova', label: 'Nova' },
    { value: 'shimmer', label: 'Shimmer' },
  ]

  const handleLanguageChange = (value: string) => {
    voice.updateVoiceSettings({ language: value })
  }

  const handleVoiceChange = (value: string) => {
    voice.updateVoiceSettings({ voice: value })
  }

  const handleTestVoice = async () => {
    if (voice.voicePermissionStatus === 'prompt') {
      await voice.requestVoicePermission()
    }
    
    if (voice.voicePermissionStatus === 'granted') {
      voice.toggleVoice()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm hover:bg-white/95"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Voice Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <Select
              value={voice.voiceSettings.language}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice
            </label>
            <Select
              value={voice.voiceSettings.voice}
              onValueChange={handleVoiceChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {voiceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Voice Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4" />
                <span>Permission: {voice.voicePermissionStatus}</span>
              </div>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <span>Listening: {voice.isListening ? 'Yes' : 'No'}</span>
              </div>
              {voice.voiceError && (
                <div className="text-red-600 text-xs">
                  Error: {voice.voiceError}
                </div>
              )}
            </div>
          </div>

          {/* Test Voice Button */}
          <Button
            onClick={handleTestVoice}
            className="w-full"
            disabled={voice.voicePermissionStatus === 'denied' || voice.voicePermissionStatus === 'not-supported'}
          >
            {voice.isListening ? 'Stop Test' : 'Test Voice'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
