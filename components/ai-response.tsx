"use client"

import { useState, useEffect } from "react"
import { Copy, ExternalLink, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AIResponseProps {
  isMinimized: boolean
}

export function AIResponse({ isMinimized }: AIResponseProps) {
  const [isTyping, setIsTyping] = useState(false)
  const [response, setResponse] = useState("")
  const [question] = useState("What are the differences between EBITDA and net income?")

  const fullResponse =
    "EBITDA is earnings before interest, taxes, depreciation, and amortization. Net income is profit after all expenses are deducted, giving a more complete picture of profitability."

  useEffect(() => {
    setIsTyping(true)
    let index = 0
    const timer = setInterval(() => {
      if (index < fullResponse.length) {
        setResponse(fullResponse.slice(0, index + 1))
        index++
      } else {
        setIsTyping(false)
        clearInterval(timer)
      }
    }, 30)

    return () => clearInterval(timer)
  }, [])

  if (isMinimized) {
    return (
      <div className="glass-panel rounded-xl p-4 w-16 h-16 flex items-center justify-center">
        <Sparkles className="w-6 h-6 text-cyan-400" />
      </div>
    )
  }

  return (
    <div className="glass-panel rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <h3 className="text-white font-semibold">AI response</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
        <p className="text-white/90 text-sm">{question}</p>
      </div>

      {/* Response */}
      <div className="space-y-3">
        <div className="text-white/90 text-sm leading-relaxed">
          {response}
          {isTyping && <span className="animate-pulse">|</span>}
        </div>

        {!isTyping && (
          <div className="flex items-center gap-2 pt-2">
            <Badge variant="outline" className="text-white/70 border-white/20 bg-white/5">
              95% confidence
            </Badge>
            <Button variant="ghost" size="sm" className="text-white/60 hover:text-white text-xs">
              <ExternalLink className="w-3 h-3 mr-1" />
              Sources
            </Button>
          </div>
        )}
      </div>

      {/* Related Topics */}
      {!isTyping && (
        <div className="space-y-2 pt-2 border-t border-white/10">
          <p className="text-white/60 text-xs font-medium">Related topics</p>
          <div className="flex flex-wrap gap-2">
            {["Financial metrics", "Profitability analysis", "Cash flow"].map((topic) => (
              <button
                key={topic}
                className="text-xs px-2 py-1 rounded-md bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
