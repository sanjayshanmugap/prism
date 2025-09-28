"use client"

import { useState, useEffect } from "react"

export function useBackgroundBrightness() {
  const [isLightBackground, setIsLightBackground] = useState(false)

  useEffect(() => {
    const checkBackgroundBrightness = () => {
      // Get the computed background color of the body element
      const bodyElement = document.body
      const computedStyle = window.getComputedStyle(bodyElement)
      const backgroundColor = computedStyle.backgroundColor

      // Parse RGB values
      const rgbMatch = backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
      if (rgbMatch) {
        const [, r, g, b] = rgbMatch.map(Number)
        
        // Calculate brightness using luminance formula
        const brightness = (r * 299 + g * 587 + b * 114) / 1000
        
        // Consider background light if brightness > 128 (out of 255)
        setIsLightBackground(brightness > 128)
      } else {
        // Default to dark if we can't determine the background
        setIsLightBackground(false)
      }
    }

    // Check initially
    checkBackgroundBrightness()

    // Set up a mutation observer to watch for background changes
    const observer = new MutationObserver(checkBackgroundBrightness)
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'style']
    })

    // Also listen for window resize in case of responsive changes
    window.addEventListener('resize', checkBackgroundBrightness)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', checkBackgroundBrightness)
    }
  }, [])

  return isLightBackground
}
