import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

const BOTPRESS_INJECT_URL =
  'https://cdn.botpress.cloud/webchat/v3.6/inject.js'
const BOTPRESS_CONFIG_URL =
  'https://files.bpcontent.cloud/2026/03/26/13/20260326135313-NCTZUAO7.js'

/**
 * Dynamically loads the Botpress webchat widget and listens for
 * custom navigation events emitted from the Botpress Studio flow.
 *
 * In Botpress Studio, use a "Send Custom Event Card" with JSON like:
 *   { "type": "navigate", "path": "/dashboard", "search": "glass repair" }
 *
 * The webchat v3 API dispatches this via:
 *   window.botpress.on('customEvent', (event) => { ... })
 */
export default function Chatbot() {
  const navigate = useNavigate()

  /**
   * Stable handler for Botpress webchat custom events.
   * Checks for navigate-type events and triggers React Router navigation.
   */
  const handleCustomEvent = useCallback(
    (event) => {
      console.log('Botpress Custom Event Received:', event)

      // The event from "Send Custom Event Card" arrives as the payload directly,
      // or nested inside event.payload depending on the Botpress version.
      const payload = event?.payload || event

      if (payload?.type === 'navigate' && payload?.path) {
        console.log(
          `[Chatbot] Navigating to "${payload.path}"` +
            (payload.search ? ` with search: "${payload.search}"` : '')
        )
        navigate(payload.path, {
          state: payload.search ? { searchQuery: payload.search } : undefined,
        })
      }
    },
    [navigate]
  )

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

      // 3. Register the custom event listener once window.botpress is available
      const registerListener = () => {
        if (window.botpress?.on) {
          window.botpress.on('customEvent', handleCustomEvent)
          console.log('[Chatbot] Botpress customEvent listener registered via window.botpress.on()')
        }
      }

      // The botpress global may not be immediately available after config loads.
      // Poll briefly until it appears, then register.
      configScript.onload = () => {
        if (window.botpress?.on) {
          registerListener()
        } else {
          let attempts = 0
          const interval = setInterval(() => {
            attempts++
            if (window.botpress?.on) {
              registerListener()
              clearInterval(interval)
            } else if (attempts > 20) {
              console.warn('[Chatbot] window.botpress not found after timeout.')
              clearInterval(interval)
            }
          }, 250)
        }
      }
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
  }, [handleCustomEvent])

  // Renderless component — Botpress manages its own floating widget DOM
  return null
}
