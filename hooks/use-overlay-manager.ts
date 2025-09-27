"use client"

import { useState, useCallback } from "react"

interface Position {
  x: number
  y: number
}

interface UseOverlayManagerReturn {
  isVisible: boolean
  mode: "floating" | "caption"
  position: Position
  isCollapsed: boolean
  showOverlay: () => void
  hideOverlay: () => void
  toggleCollapse: () => void
  setPosition: (pos: Position) => void
  setMode: (mode: "floating" | "caption") => void
}

export function useOverlayManager(): UseOverlayManagerReturn {
  const [isVisible, setIsVisible] = useState(false)
  const [mode, setMode] = useState<"floating" | "caption">("floating")
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [isCollapsed, setIsCollapsed] = useState(false)

  const showOverlay = useCallback(() => {
    setIsVisible(true)
  }, [])

  const hideOverlay = useCallback(() => {
    setIsVisible(false)
  }, [])

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [])

  return {
    isVisible,
    mode,
    position,
    isCollapsed,
    showOverlay,
    hideOverlay,
    toggleCollapse,
    setPosition,
    setMode,
  }
}
