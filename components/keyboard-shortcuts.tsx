"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Keyboard, Mic, Eye, Settings } from "lucide-react"

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)
  const [shortcuts, setShortcuts] = useState<Array<{key: string, description: string, icon: React.ReactNode}>>([])

  useEffect(() => {
    setShortcuts([
      {
        key: "⌘ + \\",
        description: "Toggle overlay visibility",
        icon: <Eye className="w-4 h-4" />
      },
      {
        key: "M",
        description: "Toggle microphone (when not typing)",
        icon: <Mic className="w-4 h-4" />
      },
      {
        key: "Tab",
        description: "Focus chat input",
        icon: <Keyboard className="w-4 h-4" />
      },
      {
        key: "Escape",
        description: "Unfocus chat input",
        icon: <Keyboard className="w-4 h-4" />
      }
    ])
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="fixed top-4 right-16 z-50 bg-white/90 backdrop-blur-sm hover:bg-white/95"
        >
          <Keyboard className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {shortcut.icon}
                <span className="text-sm font-medium">{shortcut.description}</span>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {shortcut.key}
              </Badge>
            </div>
          ))}
          
          <div className="text-xs text-gray-500 mt-4">
            Note: Voice shortcuts only work when not typing in input fields
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
