import { useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const BOTPRESS_INJECT_URL =
  'https://cdn.botpress.cloud/webchat/v3.6/inject.js'
const BOTPRESS_CONFIG_URL =
  'https://files.bpcontent.cloud/2026/03/26/13/20260326135313-NCTZUAO7.js'

/**
 * Universal Botpress webchat integration with navigation interception.
 *
 * Handles TWO navigation mechanisms:
 *
 * 1. Custom Events (preferred): Botpress Studio "Send Custom Event Card" with:
 *    { "type": "navigate", "path": "/dashboard", "search": "glass repair" }
 *
 * 2. Link Interception (fallback): Any <a> link inside the Botpress widget
 *    pointing to the deployed site (or containing hash routes like #services)
 *    is intercepted and converted into a React Router navigation.
 *    This handles the case where the bot sends hardcoded Vercel links.
 */
export default function Chatbot() {
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)
  navigateRef.current = navigate

  // ── Method 1: Custom Event handler ──
  const handleCustomEvent = useCallback((event) => {
    console.log('[Chatbot] Custom Event Received:', event)
    const payload = event?.payload || event

    if (payload?.type === 'navigate' && payload?.path) {
      console.log(
        `[Chatbot] Navigating to "${payload.path}"` +
          (payload.search ? ` with search: "${payload.search}"` : '')
      )
      navigateRef.current(payload.path, {
        state: payload.search ? { searchQuery: payload.search } : undefined,
      })
    }
  }, [])

  useEffect(() => {
    // --- Guard: prevent duplicate injection ---
    if (document.getElementById('bp-inject')) return

    // ── Method 2: Intercept link clicks inside the Botpress widget ──
    // This catches hardcoded <a href="https://...vercel.app/dashboard?search=...">
    // links the bot sends and converts them to React Router navigations.
    const handleLinkClick = (e) => {
      const anchor = e.target.closest?.('a[href]')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href) return

      // Match links pointing to the deployed site or localhost
      // e.g. https://local-services-q53h.vercel.app/dashboard
      // e.g. https://local-services-q53h.vercel.app/#services
      // e.g. /dashboard?search=plumbing
      const deployedDomains = [
        'local-services-q53h.vercel.app',
        'localhost',
        window.location.hostname,
      ]

      let url
      try {
        url = new URL(href, window.location.origin)
      } catch {
        return // not a valid URL, let it pass
      }

      const isInternalLink = deployedDomains.some(
        (d) => url.hostname === d || url.hostname.includes(d)
      )

      if (!isInternalLink) return

      // Prevent the default browser navigation
      e.preventDefault()
      e.stopPropagation()

      // Extract the path to navigate to
      let targetPath = url.pathname || '/'
      const search = url.searchParams.get('search') || ''

      // Handle hash routes (e.g. /#services -> /dashboard with search)
      if (url.hash) {
        const hashValue = url.hash.replace('#', '')
        // Map known hash routes to actual paths
        if (hashValue === 'services' || hashValue === 'dashboard') {
          targetPath = '/dashboard'
        } else {
          targetPath = '/' + hashValue
        }
      }

      console.log(
        `[Chatbot] Intercepted link: "${href}" → navigating to "${targetPath}"` +
          (search ? ` with search: "${search}"` : '')
      )

      navigateRef.current(targetPath, {
        state: search ? { searchQuery: search } : undefined,
      })
    }

    // Listen on document for clicks within Botpress iframes/widgets
    document.addEventListener('click', handleLinkClick, true)

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
          console.log(
            '[Chatbot] Botpress customEvent listener registered via window.botpress.on()'
          )
        }
      }

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
      document.removeEventListener('click', handleLinkClick, true)

      document.getElementById('bp-inject')?.remove()
      document.getElementById('bp-config')?.remove()

      document
        .querySelectorAll('[id^="bp-web-widget"], [class^="bpw"]')
        .forEach((el) => el.remove())

      if (window.botpress?.destroy) {
        window.botpress.destroy()
      }
      delete window.botpress
      delete window.botpressWebChat
    }
  }, [handleCustomEvent])

  // Renderless component — Botpress manages its own floating widget DOM
  return null
}
