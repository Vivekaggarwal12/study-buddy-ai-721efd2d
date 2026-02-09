import { useCallback, useEffect, useRef, useState } from 'react'

type Options = { lang?: string; interimResults?: boolean }

export function useSpeechRecognition(options?: Options) {
  const recognitionRef = useRef<any | null>(null)
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const Win = window as any
    const SpeechRecognition = Win.SpeechRecognition ?? Win.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('SpeechRecognition not supported in this browser')
      return
    }

    const rec = new SpeechRecognition()
    rec.lang = options?.lang ?? 'en-US'
    rec.interimResults = options?.interimResults ?? true
    rec.maxAlternatives = 1

    // Keep finalized transcript separate to avoid duplicating interim text
    const finalTranscriptRef = { current: '' }

    rec.onresult = (event: any) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i]
        if (res.isFinal) {
          finalTranscriptRef.current += res[0].transcript
        } else {
          interim += res[0].transcript
        }
      }
      // Compose visible transcript as finalized text + current interim
      setTranscript(finalTranscriptRef.current + interim)
    }

    rec.onerror = (ev: any) => {
      setError(ev?.error ?? 'Speech recognition error')
    }

    recognitionRef.current = rec


    return () => {
      try {
        rec.onresult = null
        rec.onerror = null
        rec.onend = null
        rec.stop()
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null
    }
  }, [options?.lang, options?.interimResults])

  const start = useCallback(() => {
    const rec = recognitionRef.current
    if (!rec) {
      setError('SpeechRecognition not available')
      return
    }
    setTranscript('')
    setError(null)
    try {
      rec.start()
      setListening(true)
      rec.onend = () => setListening(false)
    } catch (e: any) {
      setError(e?.message ?? 'Could not start recognition')
    }
  }, [])

  const stop = useCallback(() => {
    const rec = recognitionRef.current
    if (!rec) return
    try {
      rec.stop()
    } catch {
      // ignore
    }
    setListening(false)
  }, [])

  return { listening, transcript, error, start, stop, setTranscript }
}

export default useSpeechRecognition
