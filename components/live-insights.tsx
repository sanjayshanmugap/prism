"use client"

import { useState } from "react"
import { Sparkles, FileText, Copy, CheckCircle, MessageSquare, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LiveInsightsProps {
  isMinimized: boolean
}

export function LiveInsights({ isMinimized }: LiveInsightsProps) {
  const [insights] = useState([
    "The conversation is shifting towards a discussion of common financial terms.",
    "You were asked to explain the difference between EBITDA and net income.",
  ])

  const [actions] = useState([
    { icon: FileText, text: "Define EBITDA", active: false },
    { icon: CheckCircle, text: "What are the differences between EBITDA and net income?", active: true },
    { icon: MessageSquare, text: "Suggest follow-up questions", active: false },
    { icon: Plus, text: "What should I say next?", active: false },
  ])

  if (isMinimized) {
    return (
      <div className="glass-panel rounded-xl p-4 w-16 h-16 flex items-center justify-center">
        <Sparkles className="w-6 h-6 text-blue-400" />
      </div>
    )
  }

  return (
    <div className="glass-panel rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-blue-400" />
        <h3 className="text-white font-semibold">Live insights</h3>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
            <FileText className="w-4 h-4" />
            <span className="ml-1 text-sm">Show transcript</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Current Topic */}
      <div className="space-y-3">
        <h4 className="text-white font-medium">Financial terms discussion</h4>
        <div className="space-y-2">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
              <p className="text-white/80 text-sm leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <h4 className="text-white font-medium">Actions</h4>
        <div className="space-y-2">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={index}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                  action.active
                    ? "bg-red-500/20 border border-red-500/30 text-white"
                    : "hover:bg-white/5 text-white/70 hover:text-white",
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{action.text}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
