import { useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { NewTrainingSession } from './useTrainingSessions'

type SpeechRecognitionLike = {
  lang: string
  interimResults: boolean
  continuous: boolean
  start: () => void
  stop: () => void
  onresult: ((event: unknown) => void) | null
  onerror: ((event: unknown) => void) | null
  onend: (() => void) | null
}

function getSpeechRecognition(): (new () => SpeechRecognitionLike) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export type VoiceLogState = 'idle' | 'listening' | 'parsing' | 'error'

export function useVoiceLog() {
  const [state, setState] = useState<VoiceLogState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [parsed, setParsed] = useState<Partial<NewTrainingSession> | null>(null)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  const isSupported = getSpeechRecognition() !== null

  function reset() {
    setState('idle')
    setError(null)
    setParsed(null)
  }

  function start() {
    const Recognition = getSpeechRecognition()
    if (!Recognition) {
      setError('Voice input is not supported in this browser.')
      setState('error')
      return
    }

    setError(null)
    setParsed(null)
    setState('listening')

    const recognition = new Recognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.continuous = false

    recognition.onresult = async (event: unknown) => {
      const results = (event as { results: { transcript: string }[][] }).results
      const transcript = results[0]?.[0]?.transcript
      if (!transcript) {
        setError('Could not hear anything - try again.')
        setState('error')
        return
      }

      setState('parsing')
      const { data, error: fnError } = await supabase.functions.invoke('parse-voice-log', {
        body: { transcript },
      })
      if (fnError || data?.error) {
        setError(fnError?.message ?? data?.error ?? 'Could not parse that entry.')
        setState('error')
        return
      }

      setParsed(data as Partial<NewTrainingSession>)
      setState('idle')
    }

    recognition.onerror = () => {
      setError('Voice input failed - try again.')
      setState('error')
    }

    recognition.onend = () => {
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  function stop() {
    recognitionRef.current?.stop()
  }

  return { state, error, parsed, isSupported, start, stop, reset }
}
