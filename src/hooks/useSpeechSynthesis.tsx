import { useCallback, useEffect, useRef, useState } from 'react'

type Options = { lang?: string; rate?: number; pitch?: number }

export function useSpeechSynthesis(options?: Options) {
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = useCallback((text: string) => {
    const Win = window as any
    if (!Win.speechSynthesis) {
      setError('Speech synthesis not supported in this browser')
      return
    }

    // Cancel any ongoing speech
    Win.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = options?.lang ?? 'en-US'
    utterance.rate = options?.rate ?? 1
    utterance.pitch = options?.pitch ?? 1

    utterance.onstart = () => {
      setSpeaking(true)
      setPaused(false)
      setError(null)
    }

    utterance.onend = () => {
      setSpeaking(false)
      setPaused(false)
    }

    utterance.onerror = (e: any) => {
      setError(e?.error ?? 'Speech synthesis error')
      setSpeaking(false)
      setPaused(false)
    }

    utteranceRef.current = utterance
    Win.speechSynthesis.speak(utterance)
  }, [options?.lang, options?.rate, options?.pitch])

  const pause = useCallback(() => {
    const Win = window as any
    if (Win.speechSynthesis && Win.speechSynthesis.pause) {
      Win.speechSynthesis.pause()
      setPaused(true)
    }
  }, [])

  const resume = useCallback(() => {
    const Win = window as any
    if (Win.speechSynthesis && Win.speechSynthesis.resume) {
      Win.speechSynthesis.resume()
      setPaused(false)
    }
  }, [])

  const stop = useCallback(() => {
    const Win = window as any
    if (Win.speechSynthesis) {
      Win.speechSynthesis.cancel()
      setSpeaking(false)
      setPaused(false)
    }
  }, [])

  return { speaking, paused, error, speak, pause, resume, stop }
}

export default useSpeechSynthesis
