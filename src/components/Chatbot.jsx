import { useEffect } from 'react'

const BOTPRESS_INJECT_URL =
  'https://cdn.botpress.cloud/webchat/v3.6/inject.js'
const BOTPRESS_CONFIG_URL =
  'https://files.bpcontent.cloud/2026/03/26/13/20260326135313-NCTZUAO7.js'

/**
 * Dynamically loads the Botpress webchat widget.
 * Handles cleanup on unmount to prevent duplicate bubbles during Vite HMR.
 */
export default function Chatbot() {
  useEffect(() => {
    // --- Guard: prevent duplicate injection ---
    if (document.getElementById('bp-inject')) return

    // 1. Inject the main Botpress webchat runtime
    const injectScript = document.createElement('script')
    injectScript.id = 'bp-inject'
    injectScript.src = BOTPRESS_INJECT_URL
    injectScript.async = true
    
    injectScript.onload = () => {
      // 2. Inject the bot-specific configuration after runtime is loaded
      const configScript = document.createElement('script')
      configScript.id = 'bp-config'
      configScript.src = BOTPRESS_CONFIG_URL
      configScript.defer = true
      document.body.appendChild(configScript)
    }
    
    document.body.appendChild(injectScript)

    // --- Cleanup on unmount (HMR / route tear-down) ---
    return () => {
      // Remove injected script tags
      document.getElementById('bp-inject')?.remove()
      document.getElementById('bp-config')?.remove()

      // Remove any DOM elements Botpress appended (widget container, iframes, etc.)
      document
        .querySelectorAll('[id^="bp-web-widget"], [class^="bpw"]')
        .forEach((el) => el.remove())

      // Tear down the global Botpress runtime if it exposed a destroy method
      if (window.botpress?.destroy) {
        window.botpress.destroy()
      }
      // Clean up global references
      delete window.botpress
      delete window.botpressWebChat
    }
  }, [])

  // Renderless component — Botpress manages its own floating widget DOM
  return null
}
